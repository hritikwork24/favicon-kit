import test from "node:test";
import assert from "node:assert/strict";
import { injectManagedSnippet } from "../src/inject-html.js";

test("injectManagedSnippet inserts managed content before closing head", () => {
  const source = "<html><head><title>Demo</title></head><body></body></html>";
  const result = injectManagedSnippet(source, "<link rel=\"icon\" href=\"/favicon.ico\">");

  assert.match(result, /favicon-kit:start/);
  assert.match(result, /<link rel="icon" href="\/favicon\.ico">/);
  assert.ok(result.indexOf("</head>") > result.indexOf("favicon-kit:end"));
});

test("injectManagedSnippet replaces an existing managed block", () => {
  const source = [
    "<head>",
    "<!-- favicon-kit:start -->",
    "<link rel=\"icon\" href=\"/old.ico\">",
    "<!-- favicon-kit:end -->",
    "</head>"
  ].join("\n");

  const result = injectManagedSnippet(source, "<link rel=\"icon\" href=\"/new.ico\">");

  assert.doesNotMatch(result, /old\.ico/);
  assert.match(result, /new\.ico/);
});
