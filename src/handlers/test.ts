import * as vscode from 'vscode';
import { AEM_COMMANDS as commands } from "../aem.commands";
import * as chatUtils from '@vscode/chat-extension-utils';
import { MODEL_SELECTOR } from '../constants';

export async function handleTestCommand(
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
                command: commands.TEST,
            },
        };
    }

    const tools = vscode.lm.tools.filter(tool => tool.name.includes("github"));
    const libResult = chatUtils.sendChatParticipantRequest(
        request,
        chatContext,
        {
            prompt: 'You are a helpful AEM developer assistant who can help user with AEM related queries. Given the different git related tools , you have to use them and help user with their queries. Either could be giving solution to their queries or creating a github issue for them.',
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