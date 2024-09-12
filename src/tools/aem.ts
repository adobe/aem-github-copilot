import * as cheerio from 'cheerio';
import axios from 'axios';
export interface AEMQueryRunParams {
    topKResults?: number;
    maxDocContentLength?: number;
    baseUrl?: string;
}

interface SearchResult {
    url: string;
    title: string;
    content: string;
    firstMatch: number;
}

export class AEMQueryRun {
    private readonly name = "aem-api";
    private readonly description = "A tool for interacting with and fetching data from the aem.live site.";
    private readonly INDEX_URL = "https://www.aem.live/docpages-index.json";

    private topKResults: number;
    private maxDocContentLength: number;
    private baseUrl: string;
    private INDEX: SearchResult[] = [];

    constructor(params: AEMQueryRunParams = {}) {
        this.topKResults = params.topKResults ?? 3;
        this.maxDocContentLength = params.maxDocContentLength ?? 4000;
        this.baseUrl = params.baseUrl ?? "https://www.aem.live";
    }

    async invoke(query: string): Promise<string> {
        return this._call(query);
    }

    private async _call(query: string): Promise<string> {
        try {
            const searchResults = await this._fetchSearchResults(query) || [];
            const summaries: string[] = [];

            for (let i = 0; i < Math.min(this.topKResults, searchResults.length); i++) {
                const page = searchResults[i].url;
                const pageDetails = await this._fetchPage(page, true);

                if (pageDetails) {
                    const summary = `Page: ${page}\nSummary: ${pageDetails}`;
                    summaries.push(summary);
                }
            }

            if (summaries.length === 0) {
                return "No good AEM Search Result was found";
            } else {
                return summaries.join("\n\n").slice(0, this.maxDocContentLength);
            }
        } catch (error) {
            console.error("Error in _call method:", error);
            return "An error occurred while fetching search results.";
        }
    }

    private async _fetchPage(pageUrl: string, redirect: boolean): Promise<string> {
        try {
            const response = await fetch(pageUrl);
            if (!response.ok) throw new Error("Network response was not ok");

            const html = await response.text();
            const $ = cheerio.load(html);

            $('img, script, style, noscript').remove();
            const cleanText = $('body').text().trim();

            return cleanText;
        } catch (error) {
            console.error("Error in _fetchPage method:", error);
            throw error;
        }
    }

    private poorMansNormalize(text: string): string[] {
        const s = text.toLowerCase().replace(/[^a-z0-9]/g, ' ');
        const stopWords = new Set([
            'the', 'and', 'for', 'with', 'from', 'that', 'this', 'which', 'what', 'how', 'why', 'when', 'where', 'who', 'whom', 'whose', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'shall', 'must', 'have', 'has', 'had', 'do', 'does', 'did', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'it', 'its', 'they', 'them', 'their', 'our', 'we', 'us', 'you', 'your', 'my', 'mine', 'his', 'her', 'he', 'she'
        ]);
        return s.split(' ')
            .filter(word => word.length > 2 && !stopWords.has(word))
            .map(e => e.trim())
            .filter(e => !!e);
    }

    private async _fetchSearchResults(query: string): Promise<SearchResult[] | null> {
        try {
            if (!this.INDEX.length) {
                const response = await axios.get(this.INDEX_URL);
                if (response.status !== 200) throw new Error("Failed to fetch index");

                const json = response.data;
                if (json.error) {
                    console.error("Error in _fetchSearchResults method:", json.error);
                    return null;
                }

                this.INDEX = json.data.map((element: { path: string, title: string, content: string }) => ({
                    url: `https://www.aem.live${element.path}`,
                    title: element.title,
                    content: element.content,
                    firstMatch: -1
                }));
            }

            const terms = this.poorMansNormalize(query);
            const hits: SearchResult[] = [];

            this.INDEX.forEach(e => {
                e.firstMatch = -1;
                const text = [e.title, e.content].join(' ').toLowerCase();
                const matches = terms.map(term => text.indexOf(term));
                if (matches.every(match => match >= 0)) {
                    e.firstMatch = Math.min(...matches);
                    hits.push(e);
                }
            });

            hits.sort((a, b) => a.firstMatch - b.firstMatch);
            return hits;
        } catch (error) {
            console.error("Error in _fetchSearchResults method:", error);
            return null;
        }
    }
}