export interface Comment {
    id: number;
    url: string;
    body?: string | undefined;
}

export interface Issue {
    title: string;
    body: string;
    comments: Comment[];
}