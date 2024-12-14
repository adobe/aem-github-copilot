import {
  PromptElement,
  PromptSizing,
  UserMessage,
} from '@vscode/prompt-tsx';

import * as prompts from "./templates/annotations";
import { AnnotationPromptProps } from '../interfaces/prompt.Interfaces';

export class AnnotationPrompt extends PromptElement<AnnotationPromptProps, any> {

  render(state: void, sizing: PromptSizing) {
    return (
      <>
        <UserMessage>{prompts.ANNOTATION_SYSTEM_MESSAGE}</UserMessage>
        <UserMessage>Best Practices: {this.props.bestPractices}</UserMessage>
        <UserMessage>CodeWithLineNumbers: {this.props.userQuery}</UserMessage>
      </>
    );
  }
}