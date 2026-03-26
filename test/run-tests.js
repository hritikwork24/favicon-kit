import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { promises as fs } from "node:fs";
import { buildFaviconHtml, getFaviconTagDefinitions } from "../src/html-tags.js";
import { injectManagedSnippet } from "../src/inject-html.js";
import { detectFramework, initFaviconProject } from "../src/node.js";

const SAMPLE_PNG_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO2NmNsAAAAASUVORK5CYII=";

async function run() {
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

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "favicon-kit-"));
  await fs.writeFile(path.join(tempDir, "index.html"), "<html><head><title>Sample</title></head><body></body></html>");
  await fs.writeFile(path.join(tempDir, "logo.png"), Buffer.from(SAMPLE_PNG_BASE64, "base64"));

  const detectedFramework = await detectFramework(tempDir);
  assert.equal(detectedFramework, "html");

  const initResult = await initFaviconProject({
    projectDir: tempDir,
    input: "./logo.png"
  });

  assert.equal(initResult.framework, "html");
  assert.ok(initResult.generatedCount >= 1);
  assert.ok(initResult.headTarget.endsWith("index.html"));
  assert.ok(initResult.configFile.endsWith(".favicon-kit.json"));

  const updatedHtml = await fs.readFile(path.join(tempDir, "index.html"), "utf8");
  assert.match(updatedHtml, /favicon-kit:start/);
  assert.match(updatedHtml, /favicon-16x16\.png/);
  assert.ok(await fs.stat(path.join(tempDir, "images", "favicons", "favicon.ico")));

  console.log("favicon-kit tests passed");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
