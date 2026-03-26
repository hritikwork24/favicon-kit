#!/usr/bin/env node

import path from "node:path";
import process from "node:process";
import {
  generateFavicons,
  initFaviconProject,
  injectFaviconsIntoFile,
  writeFaviconSnippet
} from "./node.js";

function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function parseArgs(argv) {
  const parsed = { _: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      parsed._.push(token);
      continue;
    }

    if (token.startsWith("--no-")) {
      parsed[toCamelCase(token.slice(5))] = false;
      continue;
    }

    const key = toCamelCase(token.slice(2));
    const nextToken = argv[index + 1];

    if (!nextToken || nextToken.startsWith("--")) {
      parsed[key] = true;
      continue;
    }

    parsed[key] = nextToken;
    index += 1;
  }

  return parsed;
}

function printHelp() {
  console.log(`favicon-kit

Commands:
  init [--framework html|laravel|hugo] [--input <file>] [--file <head-file>]
  generate --input <file> --out <dir> [--base-path /images/favicons] [--html favicon-head.html]
  snippet --out <file> [--framework html|laravel|hugo] [--base-path /images/favicons]
  inject --file <head-file> [--framework html|laravel|hugo] [--base-path /images/favicons]

Examples:
  favicon-kit init --framework laravel --input ./public/images/logo.png
  favicon-kit init --framework html --input ./logo.png --file ./index.html
  favicon-kit generate --input ./logo.png --out ./public/images/favicons --base-path /images/favicons
  favicon-kit snippet --framework laravel --out ./storage/app/favicon-head.blade.php --base-path images/favicons
  favicon-kit inject --framework html --file ./public/index.html --base-path /images/favicons
`);
}

async function run() {
  const [command = "help", ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);
  const cwd = process.cwd();

  if (command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  if (command === "init") {
    const result = await initFaviconProject({
      projectDir: cwd,
      framework: args.framework,
      input: args.input,
      file: args.file,
      outputDir: args.out,
      basePath: args.basePath || "/images/favicons",
      snippetFile: args.snippetFile,
      configFile: args.configFile,
      fit: args.fit || "contain",
      background: args.background || "transparent",
      includeManifest: args.manifest !== false,
      manifestFile: args.manifestFile || "site.webmanifest",
      manifestPath: args.manifestPath,
      marker: args.marker,
      appName: args.appName || "Website",
      themeColor: args.themeColor || "#ffffff",
      backgroundColor: args.backgroundColor || args.themeColor || "#ffffff"
    });

    console.log(`Initialized favicon structure for ${result.framework}.`);
    console.log(`Input: ${result.input}`);
    console.log(`Output directory: ${result.outputDir}`);
    if (result.snippetFile) {
      console.log(`Snippet file: ${result.snippetFile}`);
    }
    if (result.headTarget) {
      console.log(`Updated head target: ${result.headTarget}`);
    }
    if (result.configFile) {
      console.log(`Config file: ${result.configFile}`);
    }
    if (result.warnings.length > 0) {
      result.warnings.forEach((warning) => console.log(`Warning: ${warning}`));
    }
    return;
  }

  if (command === "generate") {
    if (!args.input || !args.out) {
      throw new Error("generate requires --input and --out");
    }

    const result = await generateFavicons({
      input: path.resolve(cwd, args.input),
      outputDir: path.resolve(cwd, args.out),
      basePath: args.basePath || "/images/favicons",
      fit: args.fit || "contain",
      background: args.background || "transparent",
      includeManifest: args.manifest !== false,
      manifestFile: args.manifestFile || "site.webmanifest",
      manifestPath: args.manifestPath,
      htmlOutputFile: args.html,
      metadataFile: args.metadata,
      appName: args.appName || "Website",
      themeColor: args.themeColor || "#ffffff",
      backgroundColor: args.backgroundColor || args.themeColor || "#ffffff"
    });

    console.log(`Generated ${result.generatedFiles.length} PNG files and favicon.ico in ${path.resolve(cwd, args.out)}`);
    if (args.html) {
      console.log(`Wrote HTML snippet to ${path.resolve(path.resolve(cwd, args.out), args.html)}`);
    }
    return;
  }

  if (command === "snippet") {
    if (!args.out) {
      throw new Error("snippet requires --out");
    }

    const result = await writeFaviconSnippet({
      outputFile: path.resolve(cwd, args.out),
      framework: args.framework || "html",
      basePath: args.basePath || "/images/favicons",
      includeManifest: args.manifest !== false,
      manifestPath: args.manifestPath
    });

    console.log(`Wrote ${args.framework || "html"} snippet to ${result.outputFile}`);
    return;
  }

  if (command === "inject") {
    if (!args.file) {
      throw new Error("inject requires --file");
    }

    const result = await injectFaviconsIntoFile({
      file: path.resolve(cwd, args.file),
      framework: args.framework || "html",
      basePath: args.basePath || "/images/favicons",
      includeManifest: args.manifest !== false,
      manifestPath: args.manifestPath,
      markerName: args.marker || "favicon-kit"
    });

    console.log(`Injected managed favicon snippet into ${result.file}`);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
