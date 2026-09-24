# pi-websearch

Pi extension — free web search for agents.

## Tools

- `web_search` — query → top results (title/url/snippet)
- `web_fetch` — fetch a page → readable text extract

## Search providers

**DuckDuckGo is the primary provider** — free, no API key required
(scrapes the `lite.duckduckgo.com` endpoint).

The provider layer (`extensions/providers/`) is designed so additional
backends (Brave Search API, Google Custom Search, …) can be added later
by implementing `SearchProvider` and registering it in
`providers/index.ts`. Availability is gated by `isAvailable()`, so
key-based providers activate automatically once their key is
configured — no changes to the tools needed.
