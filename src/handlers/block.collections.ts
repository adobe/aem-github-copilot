import * as vscode from "vscode";
import { AEM_COMMANDS as commands } from "../aem.commands";
import {
  PROCESS_COPILOT_CREATE_CMD,
  PROCESS_COPILOT_CREATE_CMD_TITLE,
} from "../constants";
import { getBlockContent, getBlocksList } from "../utils/helpers";

export async function fetchBlock(
  request: vscode.ChatRequest,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken,
  context: vscode.ExtensionContext
): Promise<{ metadata: { command: string } }> {
  
  const blockName = request.prompt?.trim().toLowerCase();
  let blockList = await getBlocksList(context);

  if (blockName === "ls" || !blockList?.includes(blockName)) {
    const message = blockName === "ls" ?
      `List of available blocks: \n\n  - ${blockList?.join("\n - ")}` :
      `Block not found in collection \n here is the list of available blocks: \n\n  - ${blockList?.join("\n - ")}`;
    stream.markdown(vscode.l10n.t(message));
  } else {

    try {
      const files = await fetchAEMBlock(blockName, stream);
      stream.button({
        command: PROCESS_COPILOT_CREATE_CMD,
        title: vscode.l10n.t(PROCESS_COPILOT_CREATE_CMD_TITLE),
        arguments: [files],
      });
    } catch (error) {
      stream.markdown(vscode.l10n.t(`Error fetching block:`));
    }
  }

  return {
    metadata: {
      command: commands.COLLECION,
    },
  };
}


function getFiles(children: any[], blockContentJsonNew: any[], stream: vscode.ChatResponseStream) {
  for (let child of children) {
    if (child.type === 'file') {
      blockContentJsonNew.push(child);
      let language = child.name.endsWith(".js") ? 'javascript' : 'css';
      stream.markdown(`\`\`\`${language}\n\n${child.content}\n\n\`\`\`\n\n`);
    } else {
      getFiles(child.children, blockContentJsonNew, stream);
    }
  }
}

function buildFileTree(element: { type: string, name: string, children?: typeof element[], path: string }, prefix = ''): string {
  let fileTreeMd = '';
  if (element.type === 'file') {
    fileTreeMd += prefix + '├──' + element.name;
  } else if (element.type === 'folder') {
    fileTreeMd += prefix + element.name;
    if (element.children) {
      for (let child of element.children) {
        fileTreeMd += buildFileTree(child, prefix + '    ');
      }
    }
  }
  return fileTreeMd;
}


async function fetchAEMBlock(
  blockName: string,
  stream: vscode.ChatResponseStream
) {
  const blockContentJson = await getBlockContent(blockName);
  let blockContentJsonNew: any[] = [];
  stream.markdown(`The folder/file structure is as follows:\n`);
  let fileTreeMd = `
  ${blockName}
  `
  for (let element of blockContentJson.children) {
    fileTreeMd += buildFileTree(element);
    fileTreeMd += '\n  ';
  }
  stream.markdown(`\`\`\`markdown\n\n${fileTreeMd}\n\n\`\`\`\n\n`);
  stream.markdown('\n\n');
  getFiles(blockContentJson.children, blockContentJsonNew, stream);
  return blockContentJsonNew;
}