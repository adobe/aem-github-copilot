import * as vscode from 'vscode';
import { AEM_COMMANDS as commands } from "../enums/aem-commands";
import { FETCHING_BLOCK_CONTENT, FILE_NOT_IMAGE_MESSAGE, NO_IMAGE_MESSAGE, NO_IMAGE_TYPE_ERROR, NO_RESPONSE_MESSAGE, PROCESS_COPILOT_CREATE_CMD, PROCESS_COPILOT_CREATE_CMD_TITLE } from '../utils/constants';
import { AzureOpenAI } from "openai";
import { getBufferAndMimeTypeFromUri } from '../utils/image-utils';
import { ChatCompletionUserMessageParam } from 'openai/resources/index.mjs';
import { createBlockMarkdown, getBlockContent, getBlocksList, getChatResponse, parseCopilotJsonResponse } from '../utils/helpers';
import { CreateBlockPrompt } from '../prompts/create-block';

export async function handleVisionCommand(
    request: vscode.ChatRequest,
    chatContext: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken,
    extensionContext: vscode.ExtensionContext
) {
    try {
        if (!vscode.env.appName.includes('Insiders')) {
            stream.markdown(vscode.l10n.t('This command is only available on VS Code Insiders.'));
            vscode.window.showErrorMessage(vscode.l10n.t('This command is only available on VS Code Insiders.'));
            return { metadata: { command: '' } };
        }

        stream.progress(vscode.l10n.t('Please provide the API Key, Endpoint, API Version, and Deployment Name in the settings to use this command.'));
        let apiKey = await getOrPromptForConfig('extension.apiKey', vscode.l10n.t('Enter API Key'));
        let endpoint = await getOrPromptForConfig('extension.endpoint', vscode.l10n.t('Enter Endpoint'));
        let apiVersion = await getOrPromptForConfig('extension.apiVersion', vscode.l10n.t('Enter API Version'));
        let deploymentName = await getOrPromptForConfig('extension.deploymentName', vscode.l10n.t('Enter Deployment Name'));

        if (!apiKey || !endpoint || !apiVersion || !deploymentName) {
            vscode.window.showErrorMessage(vscode.l10n.t('API Key, Endpoint, API Version, and Deployment Name are required to use this command.'));
            return { metadata: { command: '' } };
        }

        stream.progress(vscode.l10n.t('Analyzing image...'));
        let client;
        try {
            client = createAzureOpenAIClient(apiKey, endpoint, apiVersion, deploymentName);
        } catch (error) {
            vscode.window.showErrorMessage(vscode.l10n.t('Invalid credentials. Please try again'));
            return { metadata: { command: '' } };
        }
        
        const userQuery = request.prompt;
        const blockList = await getBlocksList(extensionContext);
        const blockListStr = blockList?.join("\n - ") || '';
        const chatVariables = request.references;

        if (chatVariables.length === 0) {
            stream.markdown(vscode.l10n.t(NO_IMAGE_MESSAGE));
            return { metadata: { command: commands.VISION } };
        }

        const { base64Strings, mimeType } = await processChatVariables(chatVariables, stream);
        if (!mimeType) throw new Error(NO_IMAGE_TYPE_ERROR);

        const prompts = createPrompts(userQuery, blockListStr, base64Strings, mimeType);
        try {
            const responseContent = await getChatResponseContent(client, prompts);
            await handleChatResponse(responseContent, request, stream, token);
        } catch (error) {
            stream.markdown(vscode.l10n.t('Azure OpenAI credentials are invalid. Please try again...'));
            clearConfigurationOnError();
            throw error;
        }
        return { metadata: { command: commands.VISION } };
    } catch (error) {
        console.error(error);
        vscode.window.showErrorMessage(vscode.l10n.t('An error occurred, please try again'));
        return { metadata: { command: '' } };
    }
}

async function clearConfigurationOnError() {
    const configKeys = ['extension.apiKey', 'extension.endpoint', 'extension.apiVersion', 'extension.deploymentName'];
    for (const key of configKeys) {
        await vscode.workspace.getConfiguration().update(key, undefined, vscode.ConfigurationTarget.Global);
    }
}


async function getOrPromptForConfig(configKey: string, promptMessage: string, forcePrompt: boolean = false): Promise<string> {
    let configValue = vscode.workspace.getConfiguration().get<string>(configKey) || '';
    if (!configValue || forcePrompt) {
        configValue = await vscode.window.showInputBox({ prompt: promptMessage, ignoreFocusOut: true }) || '';
        if (configValue) {
            await vscode.workspace.getConfiguration().update(configKey, configValue, vscode.ConfigurationTarget.Global);
        }
    }
    return configValue;
}

function createAzureOpenAIClient(apiKey: string, endpoint: string, apiVersion: string, deploymentName: string) {
    return new AzureOpenAI({
        apiKey: apiKey,
        endpoint: endpoint,
        apiVersion: apiVersion,
        deployment: deploymentName
    });
}

async function processChatVariables(chatVariables: any, stream: vscode.ChatResponseStream) {
    let base64Strings: Buffer[] = [];
    let mimeType: string | undefined;

    for (const reference of chatVariables) {
        if (reference.value instanceof vscode.Uri) {
            const result = await getBufferAndMimeTypeFromUri(reference.value);
            if (!result) {
                stream.markdown(vscode.l10n.t(FILE_NOT_IMAGE_MESSAGE));
                return { base64Strings, mimeType };
            }
            mimeType = result.mimeType;
            base64Strings.push(result.buffer);
        } else if (reference.value instanceof vscode.ChatReferenceBinaryData) {
            mimeType = reference.value.mimeType;
            base64Strings.push(Buffer.from(await reference.value.data()));
        }
    }

    return { base64Strings, mimeType };
}

function createPrompts(userQuery: string, blockListStr: string, base64Strings: Buffer[], mimeType: string) {
    const prompts: ChatCompletionUserMessageParam[] = [
        {
            role: 'user',
            content: `
                You are an expert customer support agent specializing in AEM projects, with deep knowledge of AEM Edge Delivery Services blocks.
                Your responsibilities include:
                - Analyze the image and find the most suited blocks from the given list of AEM Edge Delivery Services blocks.
                - Return the name of the block that best matches the image.
                - Also provide styling information for the block to be passed to AI model to enhance the AEM block with that style information.
                - Provide the output in JSON format to be easily parsable.

                sample output:
                ----
                {
                    "block": "hero",
                    "style": "white background with blue text and a large image with small font size"
                }

                ---- given list of AEM Edge Delivery Services blocks ----
                ${blockListStr}
                ----

                User Query: ${userQuery}
            `
        }
    ];

    for (const data of base64Strings) {
        const base64 = data.toString('base64');
        prompts.push({
            role: 'user',
            content: [{ type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}`, detail: 'auto' } }]
        });
    }

    return prompts;
}

async function getChatResponseContent(client: AzureOpenAI, prompts: ChatCompletionUserMessageParam[]) {
    const response = await client.chat.completions.create({
        model: "",
        messages: prompts,
    });

    return response.choices[0]?.message?.content || NO_RESPONSE_MESSAGE;
}

async function handleChatResponse(responseContent: string, request: vscode.ChatRequest, stream: vscode.ChatResponseStream, token: vscode.CancellationToken) {
    try {
        const responseJson = parseCopilotJsonResponse(responseContent);
        stream.progress(FETCHING_BLOCK_CONTENT);
        const block = responseJson.block;
        const blockStyle = responseJson.style;
        const blockObject = await getBlockContent(block);
        const blockContent = JSON.stringify(blockObject, null, 2);
        const promptProps = {
            userQuery: `User Query: create ${block} block with the following style: ${blockStyle}`,
            sampleBlockCode: blockContent,
        };
        stream.markdown(vscode.l10n.t(`Creating ${block} block with the following style:\n\n >***${blockStyle}***\n\n`));
        stream.progress(vscode.l10n.t('Creating block...'));
        const chatResponse = await getChatResponse(CreateBlockPrompt, promptProps, token);
        let resultJsonStr = "";
        for await (const fragment of chatResponse.text) {
            resultJsonStr += fragment;
        }
        const resultJson = parseCopilotJsonResponse(resultJsonStr);
        const blockMd = createBlockMarkdown(resultJson);

        stream.markdown(blockMd);
        stream.button({
            command: PROCESS_COPILOT_CREATE_CMD,
            title: `${vscode.l10n.t(PROCESS_COPILOT_CREATE_CMD_TITLE) } $(thumbsup)`,
            arguments: [resultJson.files],
        });
    } catch (error) {
        stream.markdown(vscode.l10n.t('Something went wrong, please try again'));
    }
}