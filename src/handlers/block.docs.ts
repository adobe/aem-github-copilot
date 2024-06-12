import * as vscode from 'vscode';
import { AEM_COMMANDS as commands } from "../aem.commands";

const SYSTEM_MESSAGE = 'You are a customer support agent specialized in AEM projects. You are answering questions based on a set of provided documents by the assistent. ' +
    'The provided documents are formated in JSON format, with each containing at least a title, a content and a url. ' +
    'Whenever you use content from one of the documents, attribute this with the url of the document. ' +
    'If you are not sure, answer with "I can only answer questions about AEM. "'

const MODEL_SELECTOR: vscode.LanguageModelChatSelector = { vendor: 'copilot', family: 'gpt-3.5-turbo' };

const INDEX_URL: string = "https://www.aem.live/docpages-index.json";

let INDEX: any[];

function poorMansNormalize(text: string): string[] {
    const s = text.toLowerCase().replace(/[^a-z0-9]/g, ' ');
    // filter common fill words like a, the, etc.
    const words = s.split(' ').filter((word) => word.length > 2).filter((word) => word != 'the' && word != 'and' && word != 'for' && word != 'with' && word != 'from' && word != 'that' && word != 'this' && word != 'which' && word != 'what' && word != 'how' && word != 'why' && word != 'when' && word != 'where' && word != 'who' && word != 'whom' && word != 'whose' && word != 'will' && word != 'would' && word != 'should' && word != 'could' && word != 'can' && word != 'may' && word != 'might' && word != 'shall' && word != 'must' && word != 'have' && word != 'has' && word != 'had' && word != 'do' && word != 'does' && word != 'did' && word != 'is' && word != 'are' && word != 'was' && word != 'were' && word != 'be' && word != 'been' && word != 'being' && word != 'it' && word != 'its' && word != 'they' && word != 'them' && word != 'their' && word != 'our' && word != 'we' && word != 'us' && word != 'you' && word != 'your' && word != 'my' && word != 'mine' && word != 'his' && word != 'her' && word != 'he' && word != 'she' && word != 'it' && word != 'its' && word != 'him' && word != 'her' && word != 'his' && word != 'hers' && word != 'they' && word != 'them' && word != 'their' && word != 'theirs' && word != 'we' && word != 'us' && word != 'our' && word != 'ours' && word != 'you' && word != 'your' && word != 'yours' && word != 'my' && word != 'mine' && word != 'our' && word != 'ours' && word != 'your' && word != 'yours' && word != 'my' && word != 'mine' && word != 'his' && word != 'her' && word != 'he' && word != 'she');
    return words.map((e) => e.trim()).filter((e) => !!e);
}

async function search(query: string, limit: number = 4): Promise<any[] | null> {
    // load INDEX if it is not already loaded
    if (!INDEX) {
        // fetch JSON from INDEX_URL
        const response = await fetch(INDEX_URL);
        const json: any = await response.json();
        if (json.error) {
            return null;
        }
        INDEX = json.data;
        INDEX = json.data.map((element: { path: string, title: string, content: string }) => ({
            url: `https://www.aem.live${element.path}`,
            title: element.title,
            content: element.content,
        }));
    }
    // search in index
    const terms = poorMansNormalize(query);

    const hits: any = [];
    INDEX.forEach(e => {
        // no need to make copy of the element as this is single threaded
        e.firstMatch = -1;
        const text = [e.title, e.content].join(' ').toLowerCase();
        const matches = terms.map((term) => text.indexOf(term));
        if (matches.every((match) => match >= 0)) {
            e.firstMatch = Math.min(...matches);
            hits.push(e);
        }
    });

    hits.sort((a: any, b: any) => a.firstMatch - b.firstMatch);
    const limitedHits = hits.slice(0, limit);
    if (limitedHits.length === 0) {
        return null;
    }

    return limitedHits;
}

function getPrompt(hits: any[], question: string): any[] {
    const prompt = `${question}?`;
    return [
        {
            role: 'system',
            content: SYSTEM_MESSAGE,
        },
        {
            role: 'assistant',
            content: JSON.stringify(hits),
        },
        {
            role: 'user',
            content: prompt,
        },
    ];
}

export async function handleDocsCommand(
    request: vscode.ChatRequest,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
): Promise<{ metadata: { command: string } }> {
    const progressStr = vscode.l10n.t(
        "Let me check how I can help you today..."
    );
    stream.progress(progressStr);


    const hits = await search(request.prompt, 2);
    if (!hits) {
        stream.markdown('I could not find an answer to your question. Please try again.');
    } else {
        const [model] = await vscode.lm.selectChatModels(MODEL_SELECTOR);
        if (model) {
            const prompt = getPrompt(hits, request.prompt);
            const messages = [];
            for (const m of prompt) {
                messages.push(vscode.LanguageModelChatMessage.User(m.content));
            }
            const chatResponse = await model.sendRequest(messages, {}, token);
            for await (const fragment of chatResponse.text) {
                stream.markdown(fragment);
            }
        }
    }
    
    return {
        metadata: {
            command: commands.DOCS,
        },
    };
}
