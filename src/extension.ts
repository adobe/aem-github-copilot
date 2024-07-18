import * as vscode from "vscode";
import { AEM_COMMANDS, AEM_COMMANDS as commands } from "./aem.commands";
import {
  createCmdHandler,
} from "./handlers/block.create";
import { infoCmdHandler } from "./handlers/block.info";
import { handleDocsCommand } from "./handlers/block.docs";

import {
  AEM_COMMAND_ID,
  FETCH_ISSUE_DETAIL_CMD,
  PROCESS_COPILOT_CREATE_CMD,
} from "./constants";
import { createFolderAndFiles } from "./utils/fileHandler";
import { fetchBlock } from "./handlers/block.collections";
import { getRandomGreeting } from "./utils/helpers";
import { handleIssueManagement } from "./handlers/issueManagement.handler";

interface IAemChatResult extends vscode.ChatResult {
  metadata: {
    command: string;
  };
}

export function activate(context: vscode.ExtensionContext) {
  // Define a AEM chat handler.
  const handler: vscode.ChatRequestHandler = async (
    request: vscode.ChatRequest,
    chatContext: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ): Promise<IAemChatResult> => {
    let cmdResult: any;
    stream.progress(vscode.l10n.t(getRandomGreeting()));
    try {
      if (request.command === commands.INFO) {
        cmdResult = await infoCmdHandler(request, stream, token);
      } else if (request.command === commands.CREATE) {
        cmdResult = await createCmdHandler(request, stream, token);
      } else if (request.command === commands.COLLECION) {
        cmdResult = await fetchBlock(request, stream, token, context);
      } else if (request.command === commands.ISSUES) {
        cmdResult = await handleIssueManagement(request, stream, token);
      } else {
        cmdResult = await handleDocsCommand(request, stream, token);
      }
    } catch (err) {
      handleError(err, stream);
    }

    return {
      metadata: {
        command: request.command || "",
      },
    };
  };

  const aem = vscode.chat.createChatParticipant(AEM_COMMAND_ID, handler);
  const path = vscode.Uri.joinPath(context.extensionUri, "aem.jpeg");
  aem.iconPath = path;

  // #TODO: Add followup provider  --> need to check
  aem.followupProvider = {
    provideFollowups(
      result: IAemChatResult,
      context: vscode.ChatContext,
      token: vscode.CancellationToken
    ) {
      return [
        {
          prompt: "How to build AEM blocks?",
          label: vscode.l10n.t("Build with AEM"),
          command: commands.INFO,
        } satisfies vscode.ChatFollowup,
      ];
    },
  };

  context.subscriptions.push(
    aem,
    vscode.commands.registerCommand(
      PROCESS_COPILOT_CREATE_CMD,
      async (filesToCreate) => {
        await createFolderAndFiles(filesToCreate);
      }
    ),
    vscode.commands.registerCommand(FETCH_ISSUE_DETAIL_CMD, async (githubIssue) => {
      vscode.commands.executeCommand(`workbench.action.chat.open`, `@${AEM_COMMAND_ID} /${commands.ISSUES} fetch me details of issue #${githubIssue.number}`);
    })
  );
}


function handleError(err: any, stream: vscode.ChatResponseStream): void {
  // making the chat request might fail because
  // - model does not exist
  // - user consent not given
  // - quote limits exceeded
  if (err instanceof vscode.LanguageModelError) {
    console.log(err.message, err.code, err.cause);
    if (err.cause instanceof Error && err.cause.message.includes('off_topic')) {
      stream.markdown(vscode.l10n.t('I\'m sorry, I can only help with aem related topics.'));
    }
  }
}



export function deactivate() {}
