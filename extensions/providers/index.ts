import { DuckDuckGoProvider } from "./duckduckgo.ts";
import type { SearchProvider } from "./types.ts";

/**
 * Provider chain, in priority order. DuckDuckGo is primary — free and
 * keyless. Future providers (Brave, Google) can be pushed before/after
 * DuckDuckGo here; availability is gated by `isAvailable()` (e.g. API
 * key presence), so no configuration is needed today.
 */
const providers: SearchProvider[] = [new DuckDuckGoProvider()];

export function getProvider(): SearchProvider {
	const available = providers.find((p) => p.isAvailable());
	if (!available) {
		throw new Error("no web search provider available");
	}
	return available;
}
