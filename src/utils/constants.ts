import * as vscode from 'vscode';


// supported models are gpt-4o, gpt-4o-mini, o1-preview, o1-mini, claude-3.5-sonnet, gemini-1.5-pro
enum LANGUAGE_MODEL_ID {
    GPT_3 = "gpt-3.5-turbo",
    GPT_4 = "gpt-4",
    GPT_4o = "gpt-4o",
    O1_PREVIEW = "o1-preview",
    O1_MINI = "o1-mini",
    CLAUDE_3_5_SONNET = "claude-3.5-sonnet",
    GEMINI_1_5_PRO = "gemini-1.5-pro"
}

// AEM Constants
export const AEM_COMMAND_ID = "aem";
export const PROCESS_COPILOT_CREATE_CMD = "aem.createFiles";
export const AEM_COPILOT_ANNOTATE_CMD = "aem_copilot.annotate";

export const PROCESS_COPILOT_CREATE_CMD_TITLE = "Create Block";
export const COPILOT_CREATE_CMD = "AEM block with base template";


// Github Repository Details
export const OWNER = 'adobe';
export const REPO = 'aem-block-collection';
export const BRANCH = "main";
export const AEM_BLOCK_COLLECTION_URL = `https://cdn.jsdelivr.net/gh/${OWNER}/${REPO}@${BRANCH}/`;

// Github Copilot Model details
export const MODEL_VENDOR: string = "copilot";

export const MODEL_SELECTOR: vscode.LanguageModelChatSelector = { vendor: MODEL_VENDOR, family: LANGUAGE_MODEL_ID.GPT_4o };

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

export const AEM_COPILOT_TOOLS_PREFIX = "aem_copilot";


export const PROJECT_STYLE_PATH = "styles/styles.css";

export const AEM_JS_FILE_PATH = "scripts/aem.js";

export const AEM_SCRIPTS_FILE_PATH = "scripts/scripts.js";


export const NO_IMAGE_MESSAGE = vscode.l10n.t('I need a picture to generate a response.');
export const NO_IMAGE_TYPE_ERROR = vscode.l10n.t('No image type was found from the attachment.');
export const FILE_NOT_IMAGE_MESSAGE = vscode.l10n.t('The file is not an image.');
export const NO_RESPONSE_MESSAGE = vscode.l10n.t('No response from the model');


export const FETCHING_BLOCK_CONTENT = 'fetching block content...';


export const EXTENSION_ICON_PATH = "resources/aem.png";


export const INDEX_URL: string = "https://www.aem.live/docpages-index.json";

export const AZURE_APPLICATION_INSIGHTS_CONNECTION_STRING = 'InstrumentationKey=1458d8d7-7b1d-48f8-b90c-6f0132bd394e;IngestionEndpoint=https://eastus2-3.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus2.livediagnostics.monitor.azure.com/;ApplicationId=ca34c6eb-8c2d-48d5-8514-14cb73d54e85';