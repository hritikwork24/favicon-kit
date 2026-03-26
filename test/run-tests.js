import assert from "node:assert/strict";
import { buildFaviconHtml, getFaviconTagDefinitions } from "../src/html-tags.js";
import { injectManagedSnippet } from "../src/inject-html.js";

function run() {
  const tags = getFaviconTagDefinitions();
  assert.equal(tags.length, 10);
  assert.equal(tags[0].attrs.href, "/images/favicons/favicon-16x16.png");
  assert.equal(tags.at(-1).attrs.rel, "shortcut icon");

  const html = buildFaviconHtml({
    basePath: "/assets/favicons",
    includeManifest: true
  });
  assert.match(html, /rel="manifest"/);
  assert.match(html, /href="\/assets\/favicons\/site\.webmanifest"/);
  assert.match(html, /href="\/assets\/favicons\/favicon\.ico"/);

  const injected = injectManagedSnippet("<html><head><title>Demo</title></head><body></body></html>", "<link rel=\"icon\" href=\"/favicon.ico\">");
  assert.match(injected, /favicon-kit:start/);
  assert.match(injected, /<link rel="icon" href="\/favicon\.ico">/);
  assert.ok(injected.indexOf("</head>") > injected.indexOf("favicon-kit:end"));

  const replaced = injectManagedSnippet([
    "<head>",
    "<!-- favicon-kit:start -->",
    "<link rel=\"icon\" href=\"/old.ico\">",
    "<!-- favicon-kit:end -->",
    "</head>"
  ].join("\n"), "<link rel=\"icon\" href=\"/new.ico\">");
  assert.doesNotMatch(replaced, /old\.ico/);
  assert.match(replaced, /new\.ico/);

  console.log("favicon-kit tests passed");
}

run();
