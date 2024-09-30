import { Octokit } from "@octokit/rest";
import * as vscode from "vscode";
import { Issue } from "../interfaces/issueManagement.interfaces";


// Extracts owner and repo name from the workspace's Git configuration
export async function extractRepoDetailsFromWorkspace(): Promise<{ owner: string; repoName: string, baseUrl: string | undefined, provider: string } | null> {
    const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
    if (!gitExtension) {
        vscode.window.showErrorMessage('Unable to load Git extension');
        return null;
    }

    const api = gitExtension.getAPI(1);
    if (api.repositories.length === 0) {
        vscode.window.showInformationMessage('No Git repositories found');
        return null;
    }

    const repo = api.repositories[0];
    const remotes = repo.state.remotes;
    if (remotes.length === 0) {
        vscode.window.showInformationMessage('No remotes found');
        return null;
    }

    const remoteUrl = remotes[0].fetchUrl;
    let match;
    if (remoteUrl.startsWith('https://')) {
        match = remoteUrl?.match(/https\:\/\/(.+?)[:/](.+?)\/(.+?)(?:\.git)?$/);
    } else {
        match = remoteUrl?.match(/@(.+?)[:/](.+?)\/(.+?)(?:\.git)?$/);
    }
    if (!match) {
        vscode.window.showErrorMessage('Unable to parse GitHub repository URL');
        return null;
    }
    const isGH = match[1] === 'github.com';
    return {
        owner: match[2],
        repoName: match[3],
        baseUrl: isGH ? undefined : 'https://' + match[1] + '/api/v3',
        provider: (isGH ? 'github' : 'github-enterprise')
    };
}

// Utility function to get GitHub Octokit client
export async function getGitHubClient(baseUrl: string | undefined, provider: string): Promise<Octokit> {
    const session = await vscode.authentication.getSession(provider, ["repo"], { createIfNone: true });
    return new Octokit({
        auth: session.accessToken,
        baseUrl
    });
}

// Fetches the latest issue details including comments
export async function fetchLatestIssueDetails(owner: string, repoName: string, octokit: Octokit): Promise< Issue| null> {
    try {
        const issues = await octokit.issues.listForRepo({
            owner,
            repo: repoName,
            state: 'open',
            per_page: 1,
            sort: 'created',
            direction: 'desc',
        });

        if (issues.data.length === 0) {
            vscode.window.showInformationMessage('No open issues found in the repository');
            return null;
        }

        const latestIssue = issues.data[0];
        const commentsResponse = await octokit.issues.listComments({
            owner,
            repo: repoName,
            issue_number: latestIssue.number,
        });

        return {
            title: latestIssue.title,
            body: latestIssue.body || '',
            comments: commentsResponse.data,
        };
    } catch (error) {
        vscode.window.showErrorMessage(`Error fetching issue details: ${error}`);
        return null;
    }
}

export async function fetchIssueDetailsByNumber(owner: string, repoName: string, issueNumber: number, octokit: Octokit): Promise< Issue | null> {
    try {
        const issue = await octokit.issues.get({
            owner,
            repo: repoName,
            issue_number: issueNumber,
        });

        const commentsResponse = await octokit.issues.listComments({
            owner,
            repo: repoName,
            issue_number: issueNumber,
        });

        return {
            title: issue.data.title,
            body: issue.data.body || '',
            comments: commentsResponse.data,
        };
    } catch (error) {
        vscode.window.showErrorMessage(`Error fetching issue details: ${error}`);
        return null;
    }
}

export async function fetchAllIssues(owner: string, repoName: string, octokit: Octokit, top_n: number): Promise<any> {
    try {
        const issues = await octokit.issues.listForRepo({
            owner,
            repo: repoName,
            state: 'open',
            per_page: top_n, // Use top_n for per_page
        });

        // If the API returns more issues than top_n, slice the array to return only top_n issues
        return issues.data.length > top_n ? issues.data.slice(0, top_n) : issues.data;
    } catch (error) {
        vscode.window.showErrorMessage(`Error fetching issue details: ${error}`);
        return null;
    }
}