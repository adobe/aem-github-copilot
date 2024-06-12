import * as vscode from "vscode";
import * as prompts from "../prompts/eds.info.prompt";
import { AEM_COMMANDS as commands } from "../aem.commands";

const MODEL_SELECTOR: vscode.LanguageModelChatSelector = { vendor: 'copilot', family: 'gpt-3.5-turbo' };

export async function infoCmdHandler(
  request: vscode.ChatRequest,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
) {
  const userMessage = request.prompt;
  const messages = [
    vscode.LanguageModelChatMessage.User(prompts.EDS_INFO_PROMPT_MSG),
    vscode.LanguageModelChatMessage.User(userMessage),
  ];
  stream.progress(vscode.l10n.t("Provide AEM block Info..."));
  const [model] = await vscode.lm.selectChatModels(MODEL_SELECTOR);
  let result = "";
  if (model) {
    const chatResponse = await model.sendRequest(messages, {}, token);
    for await (const fragment of chatResponse.text) {
      stream.markdown(fragment);
      result += fragment;
    }
  }

  return {
    metadata: {
      command: commands.INFO,
    },
  };
}