import * as vscode from "vscode";
import { AEM_COMMANDS as commands } from "../aem.commands";
import { Comment, Issue } from "../interfaces/issueManagement.interfaces";
import { extractRepoDetailsFromWorkspace, fetchAllIssues, fetchIssueDetailsByNumber, fetchLatestIssueDetails, getGitHubClient } from "../utils/github.helper";
import { FETCH_ISSUE_DETAIL_CMD } from "../constants";
import { IssuesManagePrompt } from "../prompts/issueManagement.prompt";
import { IssuesManagePromptProps } from "../interfaces/prompt.Interfaces";
import { getChatResponse } from "../utils/helpers";

function streamIssueDetails(
    stream: vscode.ChatResponseStream,
    issue: any,
    comments: Comment[]
) {
    stream.progress(`Issue "${issue.title}" loaded.`);
    stream.markdown(`Issue: **${issue.title}**\n\n`);
    stream.markdown(issue.body?.replaceAll("\n", "\n> ") + "");
    if (comments?.length > 0) {
        stream.markdown("\n\n_Comments_\n");
        comments?.map((comment) =>
            stream.markdown(`\n> ${comment.body?.replaceAll("\n", "\n> ") + ""}\n`)
        );
    }
    stream.markdown("\n\n----\n\n");
}

async function streamCopilotResponse(stream: vscode.ChatResponseStream, issueDetails: Issue, promptProps: IssuesManagePromptProps, token: vscode.CancellationToken) {
    stream.progress(`Copilot suggestion....`);
    try {
        const issueDetailsStr = `The issue to work on has the title: "${issueDetails?.title}" and the description: ${issueDetails?.body}. Use that information to give better answer for the following user query.` +
            (issueDetails?.comments && issueDetails?.comments?.length > 0
                ? `Do also regard the comments: ${issueDetails?.comments
                    ?.map((comment) => comment.body)
                    .join("\n\n") + ""
                }`
                : "");
        promptProps.issueDetails = issueDetailsStr;
        const chatResponse = await getChatResponse(IssuesManagePrompt, promptProps, token,);
        for await (const fragment of chatResponse.text) {
            stream.markdown(fragment);
        }
    } catch (error) {
        stream.markdown("Some Network issues. Please try again..");
    }
}

// Main handler for issue management
export async function handleIssueManagement(request: vscode.ChatRequest, stream: vscode.ChatResponseStream, token: vscode.CancellationToken): Promise<{ metadata: { command: string } }> {
    const userQuery = request.prompt.toLowerCase();
    const workspaceDetails = await extractRepoDetailsFromWorkspace();
    if (!workspaceDetails) {
        stream.markdown("Repository details not found.");
        return { metadata: { command: commands.ISSUES } };
    }

    let promptProps: IssuesManagePromptProps = {
        userQuery: request.prompt,
        issueDetails: "",
    };

    const octokit = await getGitHubClient(workspaceDetails.baseUrl, workspaceDetails.provider);

    // Determine action based on user query
    if (userQuery.includes("latest issue")) {
        const issueDetails = await fetchLatestIssueDetails(workspaceDetails.owner, workspaceDetails.repoName, octokit);
        if (!issueDetails) {
            stream.markdown("Latest issue details not found.");
            return { metadata: { command: commands.ISSUES } };
        }
        streamIssueDetails(stream, issueDetails, issueDetails.comments);
        await streamCopilotResponse(stream, issueDetails, promptProps, token);
    } else if (userQuery.match(/issue #(\d+)/)) {
        const match = userQuery.match(/issue #(\d+)/);
        const issueNumber = match ? parseInt(match[1]) : null;
        if (!issueNumber) {
            stream.markdown("Issue number not found.");
            return { metadata: { command: commands.ISSUES } };
        }
        const issueDetails = await fetchIssueDetailsByNumber(workspaceDetails.owner, workspaceDetails.repoName, issueNumber, octokit);
        if (!issueDetails) {
            stream.markdown(`Details for issue #${issueNumber} not found.`);
            return { metadata: { command: commands.ISSUES } };
        }
        streamIssueDetails(stream, issueDetails, issueDetails.comments);
        await streamCopilotResponse(stream, issueDetails, promptProps, token);
    } else if (userQuery.includes("list")) {
        const issuesList = await fetchAllIssues(workspaceDetails.owner, workspaceDetails.repoName, octokit, 5);
        if (!issuesList || issuesList.length === 0) {
            stream.markdown("No issues found.");
            return { metadata: { command: commands.ISSUES } };
        }
        stream.markdown("Here are the latest issues:\n");
        issuesList.forEach((issue: any) => {
            stream.button({
                command: FETCH_ISSUE_DETAIL_CMD,
                title: `${issue.number}:    ${issue.title}`,
                tooltip: vscode.l10n.t(`Fetch details for Issue #${issue.number}`),
                arguments: [issue],

            });
        });
    } else {
        stream.markdown("I'm not sure how to help with that. You can ask for the 'latest issue', 'list all issues', or about a specific 'issue #number'.");
        return { metadata: { command: commands.ISSUES } };
    }

    return { metadata: { command: commands.ISSUES } };
}
