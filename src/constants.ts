import * as vscode from 'vscode';

enum LANGUAGE_MODEL_ID {
    GPT_3 = "gpt-3.5-turbo",
    GPT_4 = "gpt-4",
    GPT_4o = "gpt-4o"
}

// AEM Constants
export const AEM_COMMAND_ID = "aem";
export const PROCESS_COPILOT_CREATE_CMD = "aem.createFiles";
export const PROCESS_COPILOT_CREATE_CMD_TITLE = "Create Block";
export const COPILOT_CREATE_CMD = "AEM block with base template";


// Github Repository Details
export const OWNER = 'adobe';
export const REPO = 'aem-block-collection';
export const BRANCH = "main";
export const AEM_BLOCK_COLLECTION_URL = `https://cdn.jsdelivr.net/gh/${OWNER}/${REPO}@${BRANCH}/`;

// Github Copilot Model details
export const MODEL_VENDOR: string = "copilot";

export const MODEL_SELECTOR: vscode.LanguageModelChatSelector = { vendor: MODEL_VENDOR, family: LANGUAGE_MODEL_ID.GPT_3 };

// Issue Management Constants
export const FETCH_ISSUE_DETAIL_CMD = "Fetch Issue Details Command";


export const GREETINGS = [
    "Let me think how I can help you... 🤔",
    "Just a moment, I'm thinking... 💭",
    "Give me a second, I'm on it... ⏳",
    "Hold on, let me figure this out... 🧐",
    "One moment, I'm processing your request... ⏲️",
    "Working on your request... 🚀",
    "Let's see what we can do... 🕵️‍♂️",
    "Let's get this sorted... 🗂️",
    "Hang tight, I'm on the case... 🕵️‍♀️"
];