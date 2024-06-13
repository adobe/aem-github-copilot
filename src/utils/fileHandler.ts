import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export async function createFileWithContent(
    filePath: string,
    content: string
): Promise<void> {
    const fileUri = vscode.Uri.file(filePath);
    await vscode.workspace.fs.writeFile(fileUri, Buffer.from(content, "utf8"));
}

export async function createFolderAndFiles(files: any[]): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
        const baseUri = workspaceFolders[0].uri;
        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: "Creating files",
                cancellable: false,
            },
            async (progress) => {
                if (files.length > 0) {
                    // split files[0] by / and if first starts with blocks and second would represent the block name , check if that folder exist then delete that
                    const blockName = files[0].path.split("/")[1];
                    const blockPath = path.join(baseUri.fsPath, "/blocks/" + blockName);
                    if (fs.existsSync(blockPath
                    )) {
                        fs.rmdirSync(blockPath, { recursive: true });
                    }
                }

                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const newFilePath = vscode.Uri.joinPath(baseUri, file.path);
                    const dirPath = path.dirname(newFilePath.fsPath);
                    fs.mkdirSync(dirPath, { recursive: true });
                    try {
                        await vscode.workspace.fs.stat(newFilePath);
                    } catch (err) {
                        await createFileWithContent(newFilePath.fsPath, file.content);
                        const document = await vscode.workspace.openTextDocument(
                            newFilePath
                        ); // open the document
                        const editor = await vscode.window.showTextDocument(document); // show the document in the editor
                        await vscode.commands.executeCommand(
                            "editor.action.formatDocument"
                        ); // format the document
                    }
                    progress.report({
                        increment: 100.0 / files.length,
                        message: `Creating file: ${file.path}`,
                    });
                }
            }
        );
    }
}
