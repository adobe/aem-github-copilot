import vscode from 'vscode';
import { ANNOTATION_SYSTEM_MESSAGE } from '../prompts/templates/annotations';
import { AnnotationPrompt } from '../prompts/annotations';
import { getChatResponse } from '../utils/helpers';


export async function annotateTextEditor(textEditor: vscode.TextEditor) {
    const codeWithLineNumbers = getVisibleCodeWithLineNumbers(textEditor);
    const bestPractices = await fetchAEMBestPractices();

    const promptProps = {
        userQuery: codeWithLineNumbers,
        bestPractices: bestPractices
      };
   
    try {
        // send the messages array to the model and get the response
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Fetching code annotations...',
            cancellable: false
        }, async (progress) => {
            const chatResponse = await getChatResponse(AnnotationPrompt, promptProps, new vscode.CancellationTokenSource().token);
            // handle chat response
            await parseChatResponse(chatResponse, textEditor);
            vscode.window.showInformationMessage('Code annotations applied successfully!');
        });
    } catch (error) {
        vscode.window.showErrorMessage('Failed to fetch code annotations.');
    }
   
}

function getVisibleCodeWithLineNumbers(textEditor: vscode.TextEditor) {
    // get the position of the first and last visible lines
    let currentLine = textEditor.visibleRanges[0].start.line;
    const endLine = textEditor.visibleRanges[0].end.line;

    let code = '';

    // get the text from the line at the current position.
    // The line number is 0-based, so we add 1 to it to make it 1-based.
    while (currentLine < endLine) {
        code += `${currentLine + 1}: ${textEditor.document.lineAt(currentLine).text} \n`;
        // move to the next line position
        currentLine++;
    }
    return code;
}

async function parseChatResponse(
    chatResponse: vscode.LanguageModelChatResponse,
    textEditor: vscode.TextEditor
) {
    let accumulatedResponse = '';

    for await (const fragment of chatResponse.text) {
        accumulatedResponse += fragment;

        // if the fragment is a }, we can try to parse the whole line
        if (fragment.includes('}')) {
            try {
                const annotation = JSON.parse(accumulatedResponse);
                applyDecoration(textEditor, annotation.line, annotation.suggestion);
                // reset the accumulator for the next line
                accumulatedResponse = '';
            } catch (e) {
                vscode.window.showWarningMessage('Failed to parse annotation response.');
            }
        }
    }
}

function applyDecoration(editor: vscode.TextEditor, line: number, suggestion: string) {
    const decorationType = vscode.window.createTextEditorDecorationType({
        after: {
            contentText: ` ${suggestion.substring(0, 25) + '...'}`,
            color: 'grey'
        }
    });

    // get the end of the line with the specified line number
    const lineLength = editor.document.lineAt(line - 1).text.length;
    const range = new vscode.Range(
        new vscode.Position(line - 1, lineLength),
        new vscode.Position(line - 1, lineLength)
    );

    const commandUri = vscode.Uri.parse(`command:applyCodeSuggestion?${encodeURIComponent(JSON.stringify({ line, suggestion }))}`);
    const decoration = { range: range, hoverMessage: new vscode.MarkdownString(`[Apply Change](${commandUri})`).appendText(` ${suggestion}`) };
        
    // Apply the decoration to the active text editor
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        activeEditor.setDecorations(decorationType, [decoration]);
    }
    vscode.window.activeTextEditor?.setDecorations(decorationType, [decoration]);

    // Listen for changes in the document and remove the decoration if the line is edited
    const disposable = vscode.workspace.onDidChangeTextDocument(event => {
        for (const change of event.contentChanges) {
            if (change.range.start.line === line - 1) {
                editor.setDecorations(decorationType, []);
                disposable.dispose();
                break;
            }
        }
    });
}

// Register the command to apply the code suggestion
vscode.commands.registerCommand('applyCodeSuggestion', async (args: { line: number, suggestion: string }) => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const line = editor.document.lineAt(args.line - 1);
        const newText = args.suggestion; // You might want to parse the suggestion to get the actual code change
        await editor.edit(editBuilder => {
            editBuilder.replace(line.range, newText);
        });
    }
});

async function fetchAEMBestPractices() {
    const bestPractices = await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Applying AEM best practices...',
        cancellable: false
    }, async (progress) => {
        const response = await fetch('https://www.aem.live/docpages-index.json');
        const bestPracticesJson = await response.json();
        const bestPracticesPage = bestPracticesJson.data.find((element: { path: string; }) => element.path === '/docs/dev-collab-and-good-practices');
        return bestPracticesPage.content;
    });
    return bestPractices;
}