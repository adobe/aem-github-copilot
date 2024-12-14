import * as vscode from 'vscode';
import { getChatResponse, parseCopilotResponseToJson } from '../utils/helpers';
import { DocsToolPromptProps } from '../interfaces/prompt.Interfaces';
import { DocsToolPrompt } from '../prompts/docs';

const INDEX_URL: string = "https://www.aem.live/docpages-index.json";

interface IDocsIdentifierParameters {
    query: string;
}

export class DocsIdentifierTool implements vscode.LanguageModelTool<IDocsIdentifierParameters> {
    async invoke(
        options: vscode.LanguageModelToolInvocationOptions<IDocsIdentifierParameters>,
        _token: vscode.CancellationToken
    ) {
        try {
            const params = options.input;
            const response = await fetch(INDEX_URL);
            const json: any = await response.json();
            if (json.error) {
                return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart('Error fetching index.')]);
            }

            const index = json.data.map((element: { path: string, title: string, content: string, description: string }) => ({
                path: element.path,
                title: element.title,
                content: element.content,
                description: element.description,
            }));
            
            const allDocs = index.map((element: { title: string, path: string, description: string }) => ({
                title: element.title,
                path: element.path,
                description: element.description
            }));
            
            const promptProps: DocsToolPromptProps = {
                userQuery: params.query,
                docs: JSON.stringify(allDocs),
            };
            const chatResponse = await getChatResponse(DocsToolPrompt, promptProps, _token);
            let result = '';
            for await (const fragment of chatResponse.text) {
                result += fragment;
            }

            // parse the result json and get the paths returned and then get the content from index to return
            const relevantDocs = parseCopilotResponseToJson(result);
            let context = [];
            for (const obj of relevantDocs) {
                const item = index.find((element: { path: string; }) => element.path === obj.path);
                if (item) {
                    const newItem = {
                        path: item.path,
                        content: item.content,
                    };
                    context.push(newItem);
                }
            }
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(JSON.stringify(context))]);
        } catch (error) {
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart('An error occurred while getting the relevant documents.')]);
        }
    }

    async prepareInvocation(
        options: vscode.LanguageModelToolInvocationPrepareOptions<IDocsIdentifierParameters>,
        _token: vscode.CancellationToken
    ) {
        const confirmationMessages = {
            title: 'Identify Relevant Docs',
            message: new vscode.MarkdownString(`Identify relevant documents for the query "${options.input.query}"?`),
        };

        return {
            invocationMessage: 'Identifying relevant documents',
            confirmationMessages,
        };
    }
}