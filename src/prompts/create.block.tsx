import {
  PromptElement,
  PromptSizing,
  UserMessage,
  AssistantMessage
} from '@vscode/prompt-tsx';

import * as prompts from "./templates/create.block";
import { CreatePromptProps, CreatePromptState } from '../interfaces/prompt.Interfaces';
import { AEM_JS_FILE_PATH, AEM_SCRIPTS_FILE_PATH, PROJECT_STYLE_PATH } from '../constants';
import { readFileContent } from '../utils/helpers';

export class CreateBlockPrompt extends PromptElement<CreatePromptProps, CreatePromptState> {

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
        <UserMessage>{prompts.SYSTEM_MESSAGE_NEW}</UserMessage>
        <UserMessage>
          Here are the project level styles, AEM JS functions and global JS functions:
          <br />
          {state.projectLevelStyles}
          <br />
          {state.aemJsFunctions}
          <br />
          {state.globalJsFunctions}
        </UserMessage>
        <UserMessage>Relevant Block Code: {this.props.sampleBlockCode}</UserMessage>
        <AssistantMessage>Sample Assistant Ouput: {JSON.stringify(prompts.SAMPLE_ASSISTANT_OUTPUT)}</AssistantMessage>
        <UserMessage>{this.props.userQuery}</UserMessage>
      </>
    );
  }
}