export const AEM_COMMAND_ID = "aem";
export const PROCESS_COPILOT_CREATE_CMD = "Create AEM Block";
export const COPILOT_CREATE_CMD = "AEM block with base template";
export const LANGUAGE_MODEL_ID = "copilot-gpt-3.5-turbo"; // Use faster model. Alternative is 'copilot-gpt-4', which is slower but more powerful
// export const LANGUAGE_MODEL_ID = "copilot-gpt-4"; // Use faster model. Alternative is 'copilot-gpt-4', which is slower but more powerful
export const OWNER = 'adobe';
export const REPO = 'aem-block-collection';
export const BRANCH = "main";
// export const GITHUB_BLOCK_COLLECTION_URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;

export const AEM_BLOCK_COLLECTION_URL = `https://cdn.jsdelivr.net/gh/${OWNER}/${REPO}@${BRANCH}/`;

