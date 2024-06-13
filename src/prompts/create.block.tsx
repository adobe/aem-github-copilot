import {
  PromptElement,
  PromptSizing,
  UserMessage,
  AssistantMessage
} from '@vscode/prompt-tsx';

import * as prompts from "./templates/create.block";
import { getProjectLevelStyles } from '../utils/helpers';
import { CreatePromptState, PromptProps } from '../interfaces/promptInterfaces';

export class CreateBlockPrompt extends PromptElement<PromptProps, CreatePromptState> {

  override async prepare() {
    let projectLevelStyles = await getProjectLevelStyles();
    return { projectStyleCSS: projectLevelStyles };
  }

  render(state: CreatePromptState, sizing: PromptSizing) {

    let systemMsg = prompts.SYSTEM_MESSAGE;
    let projectLevelStyles = state.projectStyleCSS;

    systemMsg = systemMsg.replace(
      "{project-level-styles}",
      `${projectLevelStyles}`
    );

    return (
      <>
        <UserMessage>{systemMsg}</UserMessage>
        <UserMessage>{prompts.SAMPLE_USER_MESSAGE}</UserMessage>
        <AssistantMessage>{JSON.stringify(prompts.SAMPLE_ASSISTANT_OUTPUT)}</AssistantMessage>
        <UserMessage>{prompts.SAMPLE_USER_MESSAGE_2}</UserMessage>
        <AssistantMessage>{JSON.stringify(prompts.SAMPLE_ASSISTANT_OUTPUT_2)}</AssistantMessage>
        <UserMessage>{this.props.userQuery}</UserMessage>
      </>
    );
  }
}