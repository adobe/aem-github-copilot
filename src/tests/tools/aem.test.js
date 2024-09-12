"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aem_1 = require("../../tools/aem");
const jest_fetch_mock_1 = __importDefault(require("jest-fetch-mock"));
jest_fetch_mock_1.default.enableMocks();
describe('AEMQueryRun', () => {
    beforeEach(() => {
        jest_fetch_mock_1.default.resetMocks();
    });
    it('should initialize with default parameters', () => {
        const aemQueryRun = new aem_1.AEMQueryRun();
        expect(aemQueryRun['topKResults']).toBe(3);
        expect(aemQueryRun['maxDocContentLength']).toBe(4000);
        expect(aemQueryRun['baseUrl']).toBe("https://www.aem.live");
    });
    it('should initialize with provided parameters', () => {
        const params = {
            topKResults: 5,
            maxDocContentLength: 5000,
            baseUrl: "https://custom.url"
        };
        const aemQueryRun = new aem_1.AEMQueryRun(params);
        expect(aemQueryRun['topKResults']).toBe(5);
        expect(aemQueryRun['maxDocContentLength']).toBe(5000);
        expect(aemQueryRun['baseUrl']).toBe("https://custom.url");
    });
    it('should return search results', async () => {
        const mockSearchResults = [
            { url: 'https://example.com/page1', title: 'Page 1', content: 'Content 1', firstMatch: 0 },
            { url: 'https://example.com/page2', title: 'Page 2', content: 'Content 2', firstMatch: 0 }
        ];
        jest_fetch_mock_1.default.mockResponseOnce(JSON.stringify(mockSearchResults));
        const aemQueryRun = new aem_1.AEMQueryRun();
        const result = await aemQueryRun.invoke('test query');
        expect(result).toContain('Page: https://example.com/page1');
        expect(result).toContain('Page: https://example.com/page2');
    });
    it('should handle errors in _call method', async () => {
        jest_fetch_mock_1.default.mockRejectOnce(new Error('Failed to fetch'));
        const aemQueryRun = new aem_1.AEMQueryRun();
        const result = await aemQueryRun.invoke('test query');
        expect(result).toBe('An error occurred while fetching search results.');
    });
});
//# sourceMappingURL=aem.test.js.map