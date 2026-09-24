/**
 * Search provider contract.
 *
 * DuckDuckGo is the primary provider — free, no API key.
 * Additional providers (Brave, Google, …) can be added later by
 * implementing `SearchProvider` and registering it in providers/index.ts.
 */

export interface SearchResult {
	title: string;
	url: string;
	snippet: string;
}

export interface SearchProvider {
	/** Unique provider id, e.g. "duckduckgo". */
	readonly name: string;
	/** True when the provider is usable (e.g. required API key is set). */
	isAvailable(): boolean;
	search(query: string, limit: number): Promise<SearchResult[]>;
}

export function formatResults(results: SearchResult[]): string {
	if (results.length === 0) return "(no results)";
	return results
		.map((r) => `- ${r.title}\n  ${r.url}\n  ${r.snippet}`)
		.join("\n");
}
