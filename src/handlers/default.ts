import * as vscode from 'vscode';
import { AEM_COMMANDS as commands } from '../aem.commands';
import { SYSTEM_MESSAGE } from '../prompts/default';

const MODEL_SELECTOR: vscode.LanguageModelChatSelector = { vendor: 'copilot', family: 'gpt-3.5-turbo' };


export async function defaultHandler(request: vscode.ChatRequest, stream: vscode.ChatResponseStream, token: vscode.CancellationToken) {
    const messages = [
        vscode.LanguageModelChatMessage.User(SYSTEM_MESSAGE),
        vscode.LanguageModelChatMessage.User(request.prompt)
    ];
    const progressStr = vscode.l10n.t("AEM Assistant is thinking ...🤔");
    stream.progress(progressStr);
    const [model] = await vscode.lm.selectChatModels(MODEL_SELECTOR);
    const chatResponse = await model.sendRequest(messages, {}, token)
    for await (const fragment of chatResponse.text) {
      stream.markdown(fragment);
    }

    const resultObj  = {
        metadata: {
            command: commands.INFO
        }
    }

    return resultObj;
}