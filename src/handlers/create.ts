import * as vscode from "vscode";
import { AEM_COMMANDS as commands } from "../enums/aem-commands";
import {
  PROCESS_COPILOT_CREATE_CMD,
  PROCESS_COPILOT_CREATE_CMD_TITLE,
} from "../utils/constants";
import {
  createBlockMarkdown,
  getBlockContent,
  getBlocksList,
  getChatResponse,
  parseCopilotJsonResponse,
} from "../utils/helpers";
import { CreateBlockPrompt } from "../prompts/create-block";

/**
 * Command handler for creating a block using Copilot.
 * @param request - User's chat request.
 * @param chatContext - Context of the chat session.
 * @param stream - Stream to send responses back to the user.
 * @param token - Cancellation token to handle user interruptions.
 * @param extensionContext - Context of the VS Code extension.
 */
export async function createCmdHandler(
  request: vscode.ChatRequest,
  chatContext: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken,
  extensionContext: vscode.ExtensionContext
): Promise<{ metadata: { command: string } }> {
  try {
    
    // Step 1: Indicate the start of the operation
    stream.progress(vscode.l10n.t("Fetching available blocks..."));

    const blockList = (await getBlocksList(extensionContext)) || [];
    if (blockList.length === 0) {
      stream.markdown(vscode.l10n.t("No blocks available to process the request."));
      return { metadata: { command: commands.CREATE } };
    }

    stream.progress(vscode.l10n.t("Selecting the relevant block..."));

    // Identify the selected block
    const selectedBlock =
      blockList.find((block) => request.prompt.includes(block)) || blockList[0];


    stream.reference(
      vscode.Uri.parse(`https://www.aem.live/developer/block-collection/${selectedBlock}`),
      {
        light: vscode.Uri.file(extensionContext.asAbsolutePath("resources/demo.png")),
        dark: vscode.Uri.file(extensionContext.asAbsolutePath("resources/demo.png")),
      }
    );

    stream.progress(vscode.l10n.t(`creating ${selectedBlock} block...`));
    // Fetch block content
    const blockContent = await getSelectedBlockContent(selectedBlock);

    // Prepare prompt properties
    const promptProps = {
      userQuery: request.prompt,
      sampleBlockCode: blockContent,
    };

    // Fetch Copilot response
    const chatResponse = await getChatResponse(CreateBlockPrompt, promptProps, token);
    const resultJsonStr = await concatenateStream(chatResponse);

    // Parse and process the response
    const resultJson = parseCopilotJsonResponse(resultJsonStr);
    const blockMarkdown = createBlockMarkdown(resultJson);

    // Stream the response back to the user
    stream.markdown(blockMarkdown);
    stream.button({
      command: PROCESS_COPILOT_CREATE_CMD,
      title: vscode.l10n.t(PROCESS_COPILOT_CREATE_CMD_TITLE),
      arguments: [resultJson.files],
    });

    return { metadata: { command: commands.CREATE } };
  } catch (error) {
    console.error("Error in createCmdHandler:", error);
    stream.markdown(vscode.l10n.t("An error occurred while processing your request. Please try again."));
    return { metadata: { command: commands.CREATE } };
  }
}

/**
 * Fetches the content of the selected block as a JSON string.
 * @param selectedBlock - The selected block name.
 * @returns The block content as a formatted JSON string.
 */
async function getSelectedBlockContent(selectedBlock: string): Promise<string> {
  if (!selectedBlock) {
    return "";
  }

  try {
    const blockObject = await getBlockContent(selectedBlock);
    return JSON.stringify(blockObject, null, 2);
  } catch (error) {
    console.error(`Error fetching block content for '${selectedBlock}':`, error);
    return "";
  }
}


async function concatenateStream(chatResponse: vscode.LanguageModelChatResponse): Promise<string> {
  let result = "";
  for await (const fragment of chatResponse.text) {
    result += fragment;
  }
  return result;
}
