import * as vscode from 'vscode';
import { Octokit } from '@octokit/rest';
import { extractRepoDetailsFromWorkspace, getGitHubClient } from '../utils/github.helper';

interface ICreateIssueParameters {
    title: string;
    body: string;
}

interface ICloseIssueParameters {
    issueNumber: number;
}

interface IFetchIssueDetailsParameters {
    issueNumber: number;
}

interface IFetchLatestIssueParameters { }

export class CreateIssueTool implements vscode.LanguageModelTool<ICreateIssueParameters> {
    async invoke(
        options: vscode.LanguageModelToolInvocationOptions<ICreateIssueParameters>,
        _token: vscode.CancellationToken
    ) {
        const params = options.input;
        const workspaceDetails = await extractRepoDetailsFromWorkspace();
        if (!workspaceDetails) {
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart('Repository details not found.')]);
        }

        const octokit = await getGitHubClient(workspaceDetails.baseUrl, workspaceDetails.provider);
        try {
            const issue = await octokit.issues.create({
                owner: workspaceDetails.owner,
                repo: workspaceDetails.repoName,
                title: params.title,
                body: params.body,
            });
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(`Issue created: ${issue.data.html_url}`)]);
        } catch (error) {
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(`Error creating issue: ${(error as Error).message}`)]);
        }
    }

    async prepareInvocation(
        options: vscode.LanguageModelToolInvocationPrepareOptions<ICreateIssueParameters>,
        _token: vscode.CancellationToken
    ) {
        const confirmationMessages = {
            title: 'Create GitHub Issue',
            message: new vscode.MarkdownString(`Create a new GitHub issue with the title "${options.input.title}"?`),
        };

        return {
            invocationMessage: 'Creating GitHub issue',
            confirmationMessages,
        };
    }
}

export class CloseIssueTool implements vscode.LanguageModelTool<ICloseIssueParameters> {
    async invoke(
        options: vscode.LanguageModelToolInvocationOptions<ICloseIssueParameters>,
        _token: vscode.CancellationToken
    ) {
        const params = options.input;
        const workspaceDetails = await extractRepoDetailsFromWorkspace();
        if (!workspaceDetails) {
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart('Repository details not found.')]);
        }

        const octokit = await getGitHubClient(workspaceDetails.baseUrl, workspaceDetails.provider);
        try {
            await octokit.issues.update({
                owner: workspaceDetails.owner,
                repo: workspaceDetails.repoName,
                issue_number: params.issueNumber,
                state: 'closed',
            });
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(`Issue #${params.issueNumber} closed.`)]);
        } catch (error) {
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(`Error closing issue: ${(error as Error).message}`)]);
        }
    }

    async prepareInvocation(
        options: vscode.LanguageModelToolInvocationPrepareOptions<ICloseIssueParameters>,
        _token: vscode.CancellationToken
    ) {
        const confirmationMessages = {
            title: 'Close GitHub Issue',
            message: new vscode.MarkdownString(`Close GitHub issue #${options.input.issueNumber}?`),
        };

        return {
            invocationMessage: 'Closing GitHub issue',
            confirmationMessages,
        };
    }
}

export class FetchIssueDetailsTool implements vscode.LanguageModelTool<IFetchIssueDetailsParameters> {
    async invoke(
        options: vscode.LanguageModelToolInvocationOptions<IFetchIssueDetailsParameters>,
        _token: vscode.CancellationToken
    ) {
        const params = options.input;
        const workspaceDetails = await extractRepoDetailsFromWorkspace();
        if (!workspaceDetails) {
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart('Repository details not found.')]);
        }

        const octokit = await getGitHubClient(workspaceDetails.baseUrl, workspaceDetails.provider);
        try {
            const issue = await octokit.issues.get({
                owner: workspaceDetails.owner,
                repo: workspaceDetails.repoName,
                issue_number: params.issueNumber,
            });
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(`Issue details: ${JSON.stringify(issue.data, null, 2)}`)]);
        } catch (error) {
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(`Error fetching issue details: ${(error as Error).message}`)]);
        }
    }

    async prepareInvocation(
        options: vscode.LanguageModelToolInvocationPrepareOptions<IFetchIssueDetailsParameters>,
        _token: vscode.CancellationToken
    ) {
        const confirmationMessages = {
            title: 'Fetch GitHub Issue Details',
            message: new vscode.MarkdownString(`Fetch details for GitHub issue #${options.input.issueNumber}?`),
        };

        return {
            invocationMessage: 'Fetching GitHub issue details',
            confirmationMessages,
        };
    }
}

export class FetchLatestIssueTool implements vscode.LanguageModelTool<IFetchLatestIssueParameters> {
    async invoke(
        options: vscode.LanguageModelToolInvocationOptions<IFetchLatestIssueParameters>,
        _token: vscode.CancellationToken
    ) {
        const workspaceDetails = await extractRepoDetailsFromWorkspace();
        if (!workspaceDetails) {
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart('Repository details not found.')]);
        }

        const octokit = await getGitHubClient(workspaceDetails.baseUrl, workspaceDetails.provider);
        try {
            const issues = await octokit.issues.listForRepo({
                owner: workspaceDetails.owner,
                repo: workspaceDetails.repoName,
                per_page: 1,
                sort: 'created',
                direction: 'desc',
            });

            if (issues.data.length === 0) {
                return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart('No issues found.')]);
            }

            const latestIssue = issues.data[0];
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(`Latest issue details: ${JSON.stringify(latestIssue, null, 2)}`)]);
        } catch (error) {
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(`Error fetching latest issue: ${(error as Error).message}`)]);
        }
    }

    async prepareInvocation(
        options: vscode.LanguageModelToolInvocationPrepareOptions<IFetchLatestIssueParameters>,
        _token: vscode.CancellationToken
    ) {
        const confirmationMessages = {
            title: 'Fetch Latest GitHub Issue',
            message: new vscode.MarkdownString('Fetch the latest GitHub issue?'),
        };

        return {
            invocationMessage: 'Fetching latest GitHub issue',
            confirmationMessages,
        };
    }
}