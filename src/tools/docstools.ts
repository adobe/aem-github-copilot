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
        const params = options.input;
        const response = await fetch(INDEX_URL);
        const json: any = await response.json();
        if (json.error) {
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart('Error fetching index.')]);
        }

        const index = json.data.map((element: { path: string, title: string, content: string }) => ({
            url: `https://www.aem.live${element.path}`,
            title: element.title,
            content: element.content,
        }));

        const alltitles = index.map((item: { title: any; }) => item.title).join('\n');
        
        const promptProps: DocsToolPromptProps = {
            userQuery: params.query,
            titles: alltitles,
        };
        const chatResponse = await getChatResponse(DocsToolPrompt, promptProps, _token);
        let result = '';
        for await (const fragment of chatResponse.text) {
            result += fragment;
        }

        // parse the result json and get the paths returned and then get the content from index to return
        const relevantTitles = parseCopilotResponseToJson(result);
        let context = '';
        for (const obj of relevantTitles) {
            const item = index.find((element: { title: string; }) => element.title === obj.path);
            if (item) {
                context += `${item.title}\n${item.content}\n\n`;
            }
        }

        return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(context)]);
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