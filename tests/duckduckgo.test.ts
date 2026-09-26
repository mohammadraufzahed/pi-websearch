import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { clean, parseResults } from "../extensions/providers/duckduckgo.ts";
import { formatResults } from "../extensions/providers/types.ts";

const fixture = (name: string): string =>
	readFileSync(
		fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url)),
		"utf8",
	);

describe("parseResults", () => {
	it("extracts title, url and snippet from a lite results page", () => {
		const results = parseResults(fixture("results.html"), 10);

		expect(results).toHaveLength(3);
		expect(results[0]).toEqual({
			url: "https://laravel.com/docs/12.x",
			title: "Laravel Documentation   The PHP Framework",
			snippet:
				"Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable experience.",
		});
		expect(results[2].url).toBe("https://laracasts.com");
	});

	it("respects the limit", () => {
		const results = parseResults(fixture("results.html"), 2);
		expect(results).toHaveLength(2);
	});

	it("returns an empty array when the page has no result links", () => {
		expect(parseResults(fixture("empty.html"), 10)).toEqual([]);
	});

	it("returns an empty array on a captcha/anomaly page", () => {
		expect(parseResults(fixture("anomaly.html"), 10)).toEqual([]);
	});
});

describe("clean", () => {
	it("strips HTML tags", () => {
		expect(clean("<b>Laravel</b> on <i>GitHub</i>")).toBe(
			"Laravel on GitHub",
		);
	});

	it("replaces entities and trims", () => {
		expect(clean("  foo &mdash; bar  ")).toBe("foo   bar");
	});
});

describe("formatResults", () => {
	it("returns (no results) for an empty list", () => {
		expect(formatResults([])).toBe("(no results)");
	});

	it("formats results as title/url/snippet lines", () => {
		const text = formatResults([
			{ title: "T", url: "https://x", snippet: "S" },
		]);
		expect(text).toBe("- T\n  https://x\n  S");
	});
});
