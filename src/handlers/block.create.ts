import * as vscode from "vscode";
import { AEM_COMMANDS as commands } from "../aem.commands";
import {
  PROCESS_COPILOT_CREATE_CMD,
  PROCESS_COPILOT_CREATE_CMD_TITLE,
} from "../constants";
import { getChatResponse, parseEDSblockJson } from "../utils/helpers";
import { CreateBlockPrompt } from "../prompts/create.block";

export async function createCmdHandler(
  request: vscode.ChatRequest,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<{ metadata: { command: string } }> {
  const promptProps = {
    userQuery: request.prompt,
  }
  const chatResponse = await getChatResponse(CreateBlockPrompt, promptProps, token, );
  let resultJsonStr = "";
  for await (const fragment of chatResponse.text) {
    resultJsonStr += fragment;
  }

  try {
    const blockMd: string = parseEDSblockJson(resultJsonStr);
    stream.markdown(blockMd);

    stream.button({
      command: PROCESS_COPILOT_CREATE_CMD,
      title: vscode.l10n.t(PROCESS_COPILOT_CREATE_CMD_TITLE),
      arguments: [JSON.parse(resultJsonStr).files],
    });
  } catch (error) {
    console.error("Error parsing result json", error);
    stream.markdown("Some Network issues. Please try again..");
  }

  return {
    metadata: {
      command: commands.CREATE,
    },
  };
}