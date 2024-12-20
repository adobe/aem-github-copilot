import {
  PromptElement,
  PromptSizing,
  UserMessage,
} from '@vscode/prompt-tsx';

import * as prompts from "./templates/docs";
import { DocsToolPromptProps } from '../interfaces/prompt-interfaces';

export class DocsToolPrompt extends PromptElement<DocsToolPromptProps, any> {

  render(state: void, sizing: PromptSizing) {
    return (
      <>
        <UserMessage>{prompts.DOCS_TOOL_SYSTEM_MESSAGE}</UserMessage>
        <UserMessage>{this.props.docs}</UserMessage>
        <UserMessage>{this.props.userQuery}</UserMessage>
      </>
    );
  }
}