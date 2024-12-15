import {
  PromptElement,
  PromptSizing,
  UserMessage,
} from '@vscode/prompt-tsx';

import * as prompts from "./templates/annotations";
import { AnnotationPromptProps, CreatePromptState } from '../interfaces/prompt.Interfaces';
import { AEM_JS_FILE_PATH, AEM_SCRIPTS_FILE_PATH, PROJECT_STYLE_PATH } from '../constants';
import { readFileContent } from '../utils/helpers';

export class AnnotationPrompt extends PromptElement<AnnotationPromptProps, CreatePromptState> {

  override async prepare() {
    const fileContents = await Promise.all([
      readFileContent(PROJECT_STYLE_PATH),
      readFileContent(AEM_JS_FILE_PATH),
      readFileContent(AEM_SCRIPTS_FILE_PATH),
    ]);

    return {
      projectLevelStyles: fileContents[0],
      aemJsFunctions: fileContents[1],
      globalJsFunctions: fileContents[2],
    };
  }

  render(state: CreatePromptState, sizing: PromptSizing) {
    return (
      <>
        <UserMessage>{prompts.ANNOTATION_SYSTEM_MESSAGE}</UserMessage>
        <UserMessage>Best Practices: {this.props.bestPractices}</UserMessage>
        <UserMessage>
          Here are the project level styles, AEM JS functions and global JS functions:
          <br />
          path: {PROJECT_STYLE_PATH}
          {state.projectLevelStyles}
          <br />
          path: {AEM_JS_FILE_PATH}
          {state.aemJsFunctions}
          <br />
          path: {AEM_SCRIPTS_FILE_PATH}
          {state.globalJsFunctions}
        </UserMessage>
        <UserMessage >CodeWithLineNumbers: {this.props.userQuery}</UserMessage>
      </>
    );
  }
}