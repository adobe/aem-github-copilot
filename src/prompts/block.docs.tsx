import {
  PromptElement,
  PromptSizing,
  UserMessage,
} from '@vscode/prompt-tsx';

import * as prompts from "./templates/default";
import { DocsPromptProps } from '../interfaces/promptInterfaces';

export class DocsPrompt extends PromptElement<DocsPromptProps, any> {

  render(state: void, sizing: PromptSizing) {
    return (
      <>
        <UserMessage>{prompts.SYSTEM_MESSAGE}</UserMessage>
        <UserMessage>{this.props.hits}</UserMessage>
        <UserMessage>{this.props.userQuery}</UserMessage>
      </>
    );
  }
}