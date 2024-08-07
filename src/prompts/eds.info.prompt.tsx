import {
  PromptElement,
  PromptSizing,
  UserMessage,
} from '@vscode/prompt-tsx';

import * as prompts from "./templates/eds.info";
import { PromptProps } from '../interfaces/prompt.Interfaces';

export class AEMInfoPrompt extends PromptElement<PromptProps, any> {

  render(state: void, sizing: PromptSizing) {
    return (
      <>
        <UserMessage>{prompts.SYSTEM_MESSAGE}</UserMessage>
        <UserMessage>{this.props.userQuery}</UserMessage>
      </>
    );
  }
}