import * as vscode from "vscode";
import { AEM_COMMANDS as commands } from "../aem.commands";
import {
  PROCESS_COPILOT_CREATE_CMD,
  PROCESS_COPILOT_CREATE_CMD_TITLE,
} from "../constants";
import { createBlockMarkdown, getBlockContent, getBlocksList, getChatResponse, parseCopilotJsonResponse } from "../utils/helpers";
import { CreateBlockPrompt } from "../prompts/create.block";

export async function createCmdHandler(
  request: vscode.ChatRequest,
  chatContext: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken,
  extensionContext: vscode.ExtensionContext
): Promise<{ metadata: { command: string } }> {

  let blockList = await getBlocksList(extensionContext) || [];

  let selectedblock = blockList.find((block) => request.prompt.includes(block));

  if (!selectedblock) {
    selectedblock = blockList.length > 0 ? blockList[0] : '';
  }
  let blockContent = '';
  if (selectedblock) {
    const blockObject = await getBlockContent(selectedblock);
    blockContent = JSON.stringify(blockObject, null, 2);
  }

  const promptProps = {
    userQuery: request.prompt,
    sampleBlockCode: blockContent,
  };
  try {
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
      title: vscode.l10n.t(PROCESS_COPILOT_CREATE_CMD_TITLE),
      arguments: [resultJson.files],
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