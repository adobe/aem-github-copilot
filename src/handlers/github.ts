import * as vscode from 'vscode';
import { AEM_COMMANDS as commands } from "../enums/aem-commands";
import * as chatUtils from '@vscode/chat-extension-utils';
import { MODEL_SELECTOR } from '../utils/constants';
import { SYSTEM_MESSAGE } from '../prompts/templates/issues';

export async function handleIssuesCommand(
    request: vscode.ChatRequest,
    chatContext: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken,
    extensionContext: vscode.ExtensionContext
) {

    const [model] = await vscode.lm.selectChatModels(MODEL_SELECTOR);
    if (!model) {
        console.log('Model not found. Please make sure the GitHub Copilot Chat extension is installed and enabled.');
        return {
            metadata: {
                command: commands.ISSUES,
            },
        };
    }

    const tools = vscode.lm.tools.filter(tool => tool.name.includes("github"));
    const libResult = chatUtils.sendChatParticipantRequest(
        request,
        chatContext,
        {
            prompt: SYSTEM_MESSAGE,
            model: model,
            responseStreamOptions: {
                stream,
                references: true,
                responseText: true
            },
            tools
        },
        token
    );
    
    const result = await libResult.result;
    return result;
}