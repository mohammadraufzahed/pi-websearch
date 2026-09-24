/**
 * pi-websearch — free web search for pi agents.
 *
 *   web_search  — query → top results (title/url/snippet)
 *   web_fetch   — fetch a page → text extract
 *
 * Search uses DuckDuckGo as the primary provider (free, no API key).
 * The provider layer in providers/ allows Brave/Google to be added
 * later without changing the tools.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { getProvider } from "./providers/index.ts";
import { formatResults } from "./providers/types.ts";

const UA =
	"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export default function piWebsearch(pi: ExtensionAPI) {
	pi.registerTool({
		name: "web_search",
		label: "Web Search",
		description:
			"Search the web (DuckDuckGo, free) — errors, docs, libraries, news. Returns title/url/snippet per result.",
		promptSnippet: "Search the web",
		parameters: Type.Object({
			query: Type.String(),
			limit: Type.Optional(Type.Number({ description: "default 6" })),
		}),
		async execute(_id, params) {
			try {
				const provider = getProvider();
				const results = await provider.search(
					params.query,
					params.limit ?? 6,
				);
				return {
					content: [
						{
							type: "text" as const,
							text: formatResults(results),
						},
					],
				};
			} catch (e) {
				return {
					content: [
						{ type: "text" as const, text: `search failed: ${e}` },
					],
				};
			}
		},
	});

	pi.registerTool({
		name: "web_fetch",
		label: "Web Fetch",
		description:
			"Fetch a URL → readable text extract (html stripped). For docs, changelogs, articles.",
		parameters: Type.Object({
			url: Type.String(),
			max_chars: Type.Optional(Type.Number({ description: "default 8000" })),
		}),
		async execute(_id, params) {
			try {
				const r = await fetch(params.url, {
					headers: { "User-Agent": UA },
					signal: AbortSignal.timeout(25_000),
				});
				let t = await r.text();
				t = t
					.replace(/<script[\s\S]*?<\/script>/g, " ")
					.replace(/<style[\s\S]*?<\/style>/g, " ")
					.replace(/<[^>]+>/g, " ")
					.replace(/&nbsp;/g, " ")
					.replace(/&amp;/g, "&")
					.replace(/&lt;/g, "<")
					.replace(/&gt;/g, ">")
					.replace(/\s{3,}/g, "\n\n")
					.trim();
				const cap = params.max_chars ?? 8000;
				if (t.length > cap) t = t.slice(0, cap) + "\n[truncated]";
				return {
					content: [
						{ type: "text" as const, text: `HTTP ${r.status}\n\n${t}` },
					],
				};
			} catch (e) {
				return {
					content: [
						{ type: "text" as const, text: `fetch failed: ${e}` },
					],
				};
			}
		},
	});
}
