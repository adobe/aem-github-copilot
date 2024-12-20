import vscode from 'vscode';


/**
 * Represents a file with a name, path, and optional content.
 */
export interface File {
    name: string;
    path: string;
    content?: string;
}

/**
 * Represents a comment with an ID, URL, and optional body content.
 */
export interface Comment {
    id: number;
    url: string;
    body?: string | undefined;
}

/**
 * Represents an issue with a title, body, comments, labels, assignees, and milestone.
 */
export interface Issue {
    title: string;
    body: string;
    comments: Comment[];
    labels: any;
    assignees: any;
    milestone: any;
}


/**
 * Represents a chat result with metadata.
 */
export interface IAemChatResult extends vscode.ChatResult {
  metadata: {
    command: string;
  };
}