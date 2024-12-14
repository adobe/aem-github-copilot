import * as vscode from 'vscode';
import { closeIssue, createIssue, extractRepoDetailsFromWorkspace, fetchIssueDetailsByNumber, getGitHubClient } from '../utils/github.helper';

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

interface IFetchAssignedIssuesParameters { 
    username: string;
}

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
            const issue = await createIssue(workspaceDetails.owner, workspaceDetails.repoName, octokit, params.title, params.body);
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
            await closeIssue(workspaceDetails.owner, workspaceDetails.repoName, octokit, params.issueNumber);
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
            const issue = await fetchIssueDetailsByNumber(workspaceDetails.owner, workspaceDetails.repoName, params.issueNumber, octokit);
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(`Issue details: ${JSON.stringify(issue, null, 2)}`)]);
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

export class FetchAssignedIssuesTool implements vscode.LanguageModelTool<IFetchAssignedIssuesParameters> {
    async invoke(
        options: vscode.LanguageModelToolInvocationOptions<IFetchAssignedIssuesParameters>,
        _token: vscode.CancellationToken
    ) {


        const workspaceDetails = await extractRepoDetailsFromWorkspace();
        if (!workspaceDetails) {
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart('Repository details not found.')]);
        }

        const octokit = await getGitHubClient(workspaceDetails.baseUrl, workspaceDetails.provider);
        try {
            let givenUsername = options.input.username;
            const { data: { login: username } } = await octokit.rest.users.getAuthenticated();
            console.log(`Logged in user name: ${username}`);
            const issues = await octokit.issues.listForRepo({
                owner: workspaceDetails.owner,
                repo: workspaceDetails.repoName,
                assignee: givenUsername ? givenUsername : username,
            });

            if (issues.data.length === 0) {
                return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart('No issues assigned to you.')]);
            }

            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(`Assigned issues: ${JSON.stringify(issues.data, null, 2)}`)]);
        } catch (error) {
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(`Error fetching assigned issues: ${(error as Error).message}`)]);
        }
    }

    async prepareInvocation(
        options: vscode.LanguageModelToolInvocationPrepareOptions<IFetchAssignedIssuesParameters>,
        _token: vscode.CancellationToken
    ) {
        const githubUserName = options.input.username ? options.input.username : 'you';

        const confirmationMessages = {
            title: 'Fetch Assigned GitHub Issues',
            message: new vscode.MarkdownString(`Fetch the GitHub issues assigned to ${githubUserName}?`),
        };

        return {
            invocationMessage: 'Fetching assigned GitHub issues',
            confirmationMessages,
        };
    }
}