import * as vscode from 'vscode';
import { closeIssue, createIssue, extractRepoDetailsFromWorkspace, fetchAssignedIssues, fetchIssueDetailsByNumber, fetchLatestIssueDetails, getGitHubClient } from '../utils/github-helper';

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
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(vscode.l10n.t('Repository details not found.'))]);
        }
        const octokit = await getGitHubClient(workspaceDetails.baseUrl, workspaceDetails.provider);
        try {
            const issue = await createIssue(workspaceDetails.owner, workspaceDetails.repoName, octokit, params.title, params.body);
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(vscode.l10n.t('Issue created: {0}', issue.data.html_url))]);
        } catch (error) {
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(vscode.l10n.t('Error creating issue: {0}', (error as Error).message))]);
        }
    }

    async prepareInvocation(
        options: vscode.LanguageModelToolInvocationPrepareOptions<ICreateIssueParameters>,
        _token: vscode.CancellationToken
    ) {
        const confirmationMessages = {
            title: vscode.l10n.t('Create GitHub Issue'),
            message: new vscode.MarkdownString(vscode.l10n.t('Create a new GitHub issue with the title "{0}"?', options.input.title)),
        };

        return {
            invocationMessage: vscode.l10n.t('Creating GitHub issue'),
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
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(vscode.l10n.t('Repository details not found.'))]);
        }
        const octokit = await getGitHubClient(workspaceDetails.baseUrl, workspaceDetails.provider);
        try {
            await closeIssue(workspaceDetails.owner, workspaceDetails.repoName, octokit, params.issueNumber);
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(vscode.l10n.t('Issue #{0} closed.', params.issueNumber))]);
        } catch (error) {
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(vscode.l10n.t('Error closing issue: {0}', (error as Error).message))]);
        }
    }

    async prepareInvocation(
        options: vscode.LanguageModelToolInvocationPrepareOptions<ICloseIssueParameters>,
        _token: vscode.CancellationToken
    ) {
        const confirmationMessages = {
            title: vscode.l10n.t('Close GitHub Issue'),
            message: new vscode.MarkdownString(vscode.l10n.t('Close GitHub issue #{0}?', options.input.issueNumber)),
        };

        return {
            invocationMessage: vscode.l10n.t('Closing GitHub issue'),
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
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(vscode.l10n.t('Repository details not found.'))]);
        }

        const octokit = await getGitHubClient(workspaceDetails.baseUrl, workspaceDetails.provider);
        try {
            const issue = await fetchIssueDetailsByNumber(workspaceDetails.owner, workspaceDetails.repoName, params.issueNumber, octokit);
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(vscode.l10n.t('Issue details: {0}', JSON.stringify(issue, null, 2)))]);
        } catch (error) {
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(vscode.l10n.t('Error fetching issue details: {0}', (error as Error).message))]);
        }
    }

    async prepareInvocation(
        options: vscode.LanguageModelToolInvocationPrepareOptions<IFetchIssueDetailsParameters>,
        _token: vscode.CancellationToken
    ) {
        const confirmationMessages = {
            title: vscode.l10n.t('Fetch GitHub Issue Details'),
            message: new vscode.MarkdownString(vscode.l10n.t('Fetch details for GitHub issue #{0}?', options.input.issueNumber)),
        };

        return {
            invocationMessage: vscode.l10n.t('Fetching GitHub issue details'),
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
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(vscode.l10n.t('Repository details not found.'))]);
        }

        const octokit = await getGitHubClient(workspaceDetails.baseUrl, workspaceDetails.provider);
        try {
            const latestIssue = await fetchLatestIssueDetails(workspaceDetails.owner, workspaceDetails.repoName, octokit);
            if (!latestIssue) {
                return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(vscode.l10n.t('No open issues found.'))]);
            }
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(vscode.l10n.t('Latest issue details: {0}', JSON.stringify(latestIssue, null, 2)))]);
        } catch (error) {
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(vscode.l10n.t('Error fetching latest issue: {0}', (error as Error).message))]);
        }
    }

    async prepareInvocation(
        options: vscode.LanguageModelToolInvocationPrepareOptions<IFetchLatestIssueParameters>,
        _token: vscode.CancellationToken
    ) {
        const confirmationMessages = {
            title: vscode.l10n.t('Fetch Latest GitHub Issue'),
            message: new vscode.MarkdownString(vscode.l10n.t('Fetch the latest GitHub issue?')),
        };

        return {
            invocationMessage: vscode.l10n.t('Fetching latest GitHub issue'),
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
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(vscode.l10n.t('Repository details not found.'))]);
        }

        const octokit = await getGitHubClient(workspaceDetails.baseUrl, workspaceDetails.provider);
        try {
            let givenUsername = options?.input?.username?.toLowerCase()?.includes('your-') ? undefined : options?.input?.username;
            const { data: { login: username } } = await octokit.rest.users.getAuthenticated();
            console.log(vscode.l10n.t('Logged in user name: {0}', username));
            const assignee = givenUsername ? givenUsername : username;
            const issues = await fetchAssignedIssues(workspaceDetails.owner, workspaceDetails.repoName, octokit, assignee);

            if (issues?.length === 0) {
                return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(vscode.l10n.t('No issues assigned to you.'))]);
            }

            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(vscode.l10n.t('Assigned issues: {0}', JSON.stringify(issues, null, 2)))]);
        } catch (error) {
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(vscode.l10n.t('Error fetching assigned issues: {0}', (error as Error).message))]);
        }
    }

    async prepareInvocation(
        options: vscode.LanguageModelToolInvocationPrepareOptions<IFetchAssignedIssuesParameters>,
        _token: vscode.CancellationToken
    ) {
        const username = options.input.username?.toLowerCase();
        const githubUserName = (username && !username.includes('your-')) ? username : vscode.l10n.t('you');
        
        const confirmationMessages = {
            title: vscode.l10n.t('Fetch Assigned GitHub Issues'),
            message: new vscode.MarkdownString(vscode.l10n.t('Fetch the GitHub issues assigned to {0}?', githubUserName)),
        };

        return {
            invocationMessage: vscode.l10n.t('Fetching assigned GitHub issues'),
            confirmationMessages,
        };
    }
}