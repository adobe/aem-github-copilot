import { AEMQueryRun, AEMQueryRunParams } from '../../tools/aem';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

describe('AEMQueryRun', () => {
    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it('should initialize with default parameters', () => {
        const aemQueryRun = new AEMQueryRun();
        expect(aemQueryRun['topKResults']).toBe(3);
        expect(aemQueryRun['maxDocContentLength']).toBe(4000);
        expect(aemQueryRun['baseUrl']).toBe("https://www.aem.live");
    });

    it('should initialize with provided parameters', () => {
        const params: AEMQueryRunParams = {
            topKResults: 5,
            maxDocContentLength: 5000,
            baseUrl: "https://custom.url"
        };
        const aemQueryRun = new AEMQueryRun(params);
        expect(aemQueryRun['topKResults']).toBe(5);
        expect(aemQueryRun['maxDocContentLength']).toBe(5000);
        expect(aemQueryRun['baseUrl']).toBe("https://custom.url");
    });

    it('should return search results', async () => {
        const mockSearchResults = [
            { url: 'https://example.com/page1', title: 'Page 1', content: 'Content 1', firstMatch: 0 },
            { url: 'https://example.com/page2', title: 'Page 2', content: 'Content 2', firstMatch: 0 }
        ];
        // fetchMock.mockResponseOnce(JSON.stringify(mockSearchResults));

        const aemQueryRun = new AEMQueryRun();
        const result = await aemQueryRun.invoke('test query');

        expect(result).toContain('Page: https://example.com/page1');
        expect(result).toContain('Page: https://example.com/page2');
    });

    it('should handle errors in _call method', async () => {
        fetchMock.mockRejectOnce(new Error('Failed to fetch'));

        const aemQueryRun = new AEMQueryRun();
        const result = await aemQueryRun.invoke('test query');

        expect(result).toBe('An error occurred while fetching search results.');
    });
});