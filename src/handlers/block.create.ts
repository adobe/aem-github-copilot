import * as vscode from "vscode";
import * as prompts from "../prompts/create.block";
import { AEM_COMMANDS as commands } from "../aem.commands";
import {
  PROCESS_COPILOT_CREATE_CMD,
} from "../constants";
import { parseEDSblockJson } from "../utils";
import { blockTemplates } from "../block.templates";

const MODEL_SELECTOR: vscode.LanguageModelChatSelector = { vendor: 'copilot', family: 'gpt-3.5-turbo' };
const STYLES_PATH = "styles/styles.css";

async function getProjectLevelStyles(): Promise<string> {
 try {
  const projectLevelStylesUri = vscode.Uri.joinPath(
    vscode.workspace.workspaceFolders![0].uri,
    STYLES_PATH
  );

    const projectLevelStylesFile = await vscode.workspace.fs.readFile(
      projectLevelStylesUri
    );
    return projectLevelStylesFile.toString();
  } catch (error) {
    console.error("Error reading project level styles", error);
   return "";
  }
}

async function getChatResponse(messages: vscode.LanguageModelChatMessage[], token: vscode.CancellationToken): Promise<string> {
  let resultJsonStr = "";
  const [model] = await vscode.lm.selectChatModels(MODEL_SELECTOR);
  if (model) {
    const chatResponse = await model.sendRequest(messages, {}, token);
    for await (const fragment of chatResponse.text) {
      resultJsonStr += fragment;
    }
  }
  return resultJsonStr;
}

export async function createCmdHandler(
  request: vscode.ChatRequest,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<{ metadata: { command: string } }> {

  const templateName = "None";
  if (templateName === "None") { 
    return createCmdHandlerWithoutTemplate(request, stream, token);
  }
  const progressStr2 = vscode.l10n.t(
      "Creating AEM block with base template..."
  );
  stream.progress(progressStr2);
  let userInput = request.prompt;

  let systemMsg = prompts.SYSTEM_MESSAGE;
  let userMsg = prompts.USER_MESSAGE;
  userMsg = userMsg.replace("#user_input", userInput);
  let templateOutput =
    blockTemplates[templateName as keyof typeof blockTemplates];
  userMsg = userMsg.replace("#base_block", JSON.stringify(templateOutput));

  let projectLevelStyles = await getProjectLevelStyles();
  systemMsg = systemMsg.replace(
    "{project-level-styles}",
    `${STYLES_PATH}\n${projectLevelStyles}`
  );

  const messages = [
    vscode.LanguageModelChatMessage.User(systemMsg),
    vscode.LanguageModelChatMessage.User(userMsg),
  ];

  try {
    let resultJsonStr = await getChatResponse(messages, token);
    console.log(resultJsonStr);
    const blockMd: string = parseEDSblockJson(resultJsonStr);
    stream.markdown(blockMd);
    stream.button({
      command: PROCESS_COPILOT_CREATE_CMD,
      title: vscode.l10n.t(PROCESS_COPILOT_CREATE_CMD),
      arguments: [JSON.parse(resultJsonStr).files],
    });
  } catch (error) {
    console.error("Error parsing result json ", error);
    stream.markdown("Sorry I can't assist with that. Please try again..");
  }

  return {
    metadata: {
      command: commands.CREATE,
    },
  };
}

async function createCmdHandlerWithoutTemplate(
  request: vscode.ChatRequest,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<{ metadata: { command: string } }> {
  const userMesage = request.prompt;
  let systemMsg = prompts.SYSTEM_MESSAGE_WITHOUT_BASE_TEMPLATE;

  let projectLevelStyles = await getProjectLevelStyles();

  systemMsg = systemMsg.replace(
    "{project-level-styles}",
    `${STYLES_PATH}\n${projectLevelStyles}`
  );

  const messages = [
    vscode.LanguageModelChatMessage.User(systemMsg),
    vscode.LanguageModelChatMessage.User(prompts.SAMPLE_USER_MESSAGE),
    vscode.LanguageModelChatMessage.Assistant(
      JSON.stringify(prompts.SAMPLE_ASSISTANT_OUTPUT)
    ),
     vscode.LanguageModelChatMessage.User(prompts.SAMPLE_USER_MESSAGE_2),
     vscode.LanguageModelChatMessage.Assistant(
      JSON.stringify(prompts.SAMPLE_ASSISTANT_OUTPUT_2)
    ),
    vscode.LanguageModelChatMessage.User(userMesage),
  ];

  const progressStr = vscode.l10n.t("Creating AEM block...");
  stream.progress(progressStr);
  const [model] = await vscode.lm.selectChatModels(MODEL_SELECTOR);
  const chatResponse = await model.sendRequest(messages, {}, token);

  let resultJsonStr = "";
  for await (const fragment of chatResponse.text) {
    resultJsonStr += fragment;
  }

  try {
    console.log(resultJsonStr);
    const blockMd: string = parseEDSblockJson(resultJsonStr);
    stream.markdown(blockMd);

    stream.button({
      command: PROCESS_COPILOT_CREATE_CMD,
      title: vscode.l10n.t(PROCESS_COPILOT_CREATE_CMD),
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