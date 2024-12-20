import {
    BasePromptElementProps,
} from '@vscode/prompt-tsx';


/**
 * PromptProps interface extends BasePromptElementProps.
 * @interface
 * @property {string} userQuery - The query input by the user.
 */
export interface PromptProps extends BasePromptElementProps {
    userQuery: string;
}


/**
 * CreatePromptProps interface extends PromptProps.
 * @interface
 * @property {string} blockList - The list of blocks.
 */
export interface CreatePromptProps extends PromptProps {
    sampleBlockCode: string;
}

/**
 * DocsPromptProps interface extends PromptProps.
 * @interface
 * @property {string} hits - The hits returned from the user's query.
 */
export interface DocsPromptProps extends PromptProps {
    hits: string
}

/**
 * DocsToolPromptProps interface extends PromptProps.
 * @interface
 * @property {string} titles - The titles of aem live site
 */
export interface DocsToolPromptProps extends PromptProps {
    docs: string
}

/**
* Prompt state for the create prompt
*/
export interface CreatePromptState {
    projectLevelStyles: string;
    aemJsFunctions: string;
    globalJsFunctions: string;
}


export interface AnnotationPromptProps extends PromptProps {
    bestPractices: string;
}