import * as vscode from 'vscode';

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
export const LANGUAGE_MODEL_ID: string = "gpt-3.5-turbo"; // Use faster model. Alternative is 'gpt-4', which is slower but more powerful
export const MODEL_SELECTOR: vscode.LanguageModelChatSelector = { vendor: MODEL_VENDOR, family: LANGUAGE_MODEL_ID };


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