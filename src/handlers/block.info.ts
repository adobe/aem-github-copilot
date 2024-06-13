import * as vscode from "vscode";
import { AEM_COMMANDS as commands } from "../aem.commands";
import { AEMInfoPrompt } from "../prompts/eds.info.prompt";
import { getChatResponse } from "../utils/helpers";
import { PromptProps } from "../interfaces/promptInterfaces";

export async function infoCmdHandler(
  request: vscode.ChatRequest,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
) {
  stream.progress(vscode.l10n.t("Let me think how i can help you...?"));
  const userQuery = request.prompt;
  const props: PromptProps = {
    userQuery: userQuery,
  };

  const chatResponse = await getChatResponse(AEMInfoPrompt, props, token);

  let result = "";
  for await (const fragment of chatResponse.text) {
    stream.markdown(fragment);
    result += fragment;
  }

  return {
    metadata: {
      command: commands.INFO,
    },
  };
}