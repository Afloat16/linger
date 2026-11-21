import { describe, expect, it } from "vitest";

import { WorkerDocumentNormalizer } from "../../src/document-normalizer/document-normalizer.js";

describe("document character references", () => {
  for (const kind of ["html", "svg"] as const) {
    it.each([
      ["&#38;lt;item&#38;gt;", "&lt;item&gt;"],
      ["&#x26;#65;", "&#65;"],
      ["&#38;amp;", "&amp;"],
      ["&#x26;quot;", "&quot;"],
      ["&amp;lt;item&amp;gt;", "&lt;item&gt;"],
      ["&#65; &amp; &#x1F680; &quot;ok&quot;", 'A & \u{1f680} "ok"'],
    ])(
      `decodes ${kind} character references once: %s`,
      async (source, expected) => {
        const input =
          kind === "html"
            ? `<p>${source}</p>`
            : `<svg xmlns="http://www.w3.org/2000/svg"><text>${source}</text></svg>`;
        const bytes = await new WorkerDocumentNormalizer().normalizeDocument({
          filename: `entities.${kind}`,
          mediaType: kind === "html" ? "text/html" : "image/svg+xml",
          source: new TextEncoder().encode(input),
        });
        expect(new TextDecoder().decode(bytes)).toBe(
          `${kind === "svg" ? "# entities.svg\n\n" : ""}${expected}\n`,
        );
      },
    );
  }
});
