import type { SearchProvider, SearchResult } from "./types.ts";

const UA =
	"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const RESULT_RE =
	/<a[^>]+class="result-link"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?class="result-snippet"[^>]*>([\s\S]*?)<\/td>/g;

function clean(s: string): string {
	return s
		.replace(/<[^>]+>/g, "")
		.replace(/&\w+;/g, " ")
		.trim();
}

/**
 * DuckDuckGo — primary provider. Scrapes the free lite endpoint,
 * no API key required.
 */
export class DuckDuckGoProvider implements SearchProvider {
	readonly name = "duckduckgo";

	isAvailable(): boolean {
		return true;
	}

	async search(query: string, limit: number): Promise<SearchResult[]> {
		const url = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`;
		const r = await fetch(url, {
			headers: { "User-Agent": UA },
			signal: AbortSignal.timeout(20_000),
		});
		const html = await r.text();
		const results: SearchResult[] = [];
		let m: RegExpExecArray | null;
		while ((m = RESULT_RE.exec(html)) && results.length < limit) {
			results.push({
				url: m[1],
				title: clean(m[2]),
				snippet: clean(m[3]),
			});
		}
		return results;
	}
}
