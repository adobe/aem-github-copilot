import * as vscode from "vscode";
import { AEM_COMMANDS as commands } from "./aem.commands";
import {
  createCmdHandler,
} from "./handlers/block.create";
import { infoCmdHandler } from "./handlers/block.info";
import { enhanceBlock as enhanceCmdHandler } from "./handlers/block.enhancer";
import { defaultHandler } from "./handlers/default";
import { handleDocsCommand } from "./handlers/block.docs";

import {
  AEM_COMMAND_ID,
  PROCESS_COPILOT_CREATE_CMD,
} from "./constants";
import { createFolderAndFiles } from "./utils";
import { fetchBlock } from "./handlers/block.collections";

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
    try {
      if (request.command == commands.INFO) {
        cmdResult = await infoCmdHandler(request, stream, token);
      } else if (request.command == commands.CREATE) {
        cmdResult = await createCmdHandler(request, stream, token);
      } else if (request.command == commands.ENHANCE) {
        cmdResult = await enhanceCmdHandler(request, stream, token);
      } else if (request.command == commands.COLLECION) {
        cmdResult = await fetchBlock(request, stream, token, context);
      } else if (request.command == commands.DOCS) {
        cmdResult = await handleDocsCommand(request, stream, token);
      } else {
        cmdResult = await defaultHandler(request, stream, token);
      }
    } catch (err) {
      handleError(err, stream);
    }

    return cmdResult.metadata;
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
