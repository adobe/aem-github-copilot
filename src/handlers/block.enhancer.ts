import * as vscode from 'vscode';
import * as prompts from '../prompts/create.block'
import { AEM_COMMANDS as commands } from '../aem.commands';
import { AEM_COMMAND_ID, LANGUAGE_MODEL_ID } from '../constants';

const MODEL_SELECTOR: vscode.LanguageModelChatSelector = { vendor: 'copilot', family: 'gpt-3.5-turbo' };


export async function enhanceBlock(request: vscode.ChatRequest, stream: vscode.ChatResponseStream, token: vscode.CancellationToken) {
    const userMesage = request.prompt;
    const messages = [
        vscode.LanguageModelChatMessage.User(prompts.SYSTEM_MESSAGE),
        vscode.LanguageModelChatMessage.User(userMesage),
    ];
    const progressStr = vscode.l10n.t("Enhancing AEM block...");
    stream.progress(progressStr);

    const [model] = await vscode.lm.selectChatModels(MODEL_SELECTOR);
    let result = "";
    if (model) {
        const chatResponse = await model.sendRequest(messages, {}, token)
        for await (const fragment of chatResponse.text) {
            stream.markdown(fragment);
            result += fragment;
        }
    }
    stream.button({
        command: AEM_COMMAND_ID,
        title: vscode.l10n.t(AEM_COMMAND_ID)
    });

    const resultObj = {
        metadata: {
            command: commands.ENHANCE
        }
    }

    return resultObj;
}