import test from "node:test";
import assert from "node:assert/strict";
import { buildFaviconHtml, getFaviconTagDefinitions } from "../src/html-tags.js";

test("getFaviconTagDefinitions returns standard tags and shortcut icon", () => {
  const tags = getFaviconTagDefinitions();

  assert.equal(tags.length, 10);
  assert.equal(tags[0].attrs.href, "/images/favicons/favicon-16x16.png");
  assert.equal(tags.at(-1).attrs.rel, "shortcut icon");
});

test("buildFaviconHtml can include manifest tag", () => {
  const html = buildFaviconHtml({
    basePath: "/assets/favicons",
    includeManifest: true
  });

  assert.match(html, /rel="manifest"/);
  assert.match(html, /href="\/assets\/favicons\/site\.webmanifest"/);
  assert.match(html, /href="\/assets\/favicons\/favicon\.ico"/);
});
