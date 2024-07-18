import {
    PromptElement,
    PromptSizing,
    UserMessage,
} from '@vscode/prompt-tsx';

import { IssuesManagePromptProps } from '../interfaces/prompt.Interfaces';

export const SYSTEM_MESSAGE = `You are a software product owner and you help your developers providing additional information 
for working on current software development task from github issue details.`;

export class IssuesManagePrompt extends PromptElement<IssuesManagePromptProps, any> {

    render(state: void, sizing: PromptSizing) {
        return (
            <>
                <UserMessage>{SYSTEM_MESSAGE}</UserMessage>
                <UserMessage>
                    Here are the Github issue details<br />
                    {this.props.issueDetails} <br />
                    Explain the issue details to the developer and probably provide some additional information.<br />
                    Provide the response in nice markdown format to the user.
                </UserMessage>
            </>
        );
    }
}