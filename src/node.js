import { promises as fs } from "node:fs";
import path from "node:path";
import { buildHugoSnippet } from "./adapters/hugo.js";
import { buildLaravelBladeSnippet } from "./adapters/laravel.js";
import {
  DEFAULT_BASE_PATH,
  DEFAULT_MANIFEST_FILE,
  DEFAULT_MARKER_NAME,
  GENERATED_ICON_SPECS,
  ICO_FILE,
  ICO_SOURCE_FILENAMES,
  MANIFEST_ICON_SPECS
} from "./icon-spec.js";
import { buildFaviconHtml } from "./html-tags.js";
import { injectManagedSnippet } from "./inject-html.js";

function resolveOutputPath(outputDir, value) {
  if (!value) {
    return null;
  }

  return path.isAbsolute(value) ? value : path.join(outputDir, value);
}

function resolveFit(value) {
  return value === "cover" ? "cover" : "contain";
}

function resolveBackground(value) {
  if (!value || value === "transparent") {
    return { r: 0, g: 0, b: 0, alpha: 0 };
  }

  const hex = value.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    throw new Error(`Unsupported background value: ${value}`);
  }

  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
    alpha: 1
  };
}

function buildWebManifest(options = {}) {
  const {
    appName = "Website",
    basePath = DEFAULT_BASE_PATH,
    themeColor = "#ffffff",
    backgroundColor = themeColor
  } = options;

  return {
    name: appName,
    short_name: appName,
    icons: MANIFEST_ICON_SPECS.map((spec) => ({
      src: `${String(basePath).replace(/\/+$/, "")}/${spec.filename}`,
      sizes: `${spec.size}x${spec.size}`,
      type: spec.type
    })),
    theme_color: themeColor,
    background_color: backgroundColor,
    display: "standalone"
  };
}

function buildSnippetForFramework(options = {}) {
  const framework = options.framework || "html";

  if (framework === "laravel") {
    return buildLaravelBladeSnippet(options);
  }

  if (framework === "hugo") {
    return buildHugoSnippet(options);
  }

  return buildFaviconHtml(options);
}

export async function generateFavicons(options = {}) {
  const {
    input,
    outputDir,
    basePath = DEFAULT_BASE_PATH,
    fit = "contain",
    background = "transparent",
    includeManifest = true,
    manifestFile = DEFAULT_MANIFEST_FILE,
    manifestPath,
    htmlOutputFile,
    metadataFile,
    appName = "Website",
    themeColor = "#ffffff",
    backgroundColor = themeColor
  } = options;

  if (!input) {
    throw new Error("Missing required option: input");
  }

  if (!outputDir) {
    throw new Error("Missing required option: outputDir");
  }

  const [{ default: sharp }, { default: pngToIco }] = await Promise.all([
    import("sharp"),
    import("png-to-ico")
  ]);

  await fs.mkdir(outputDir, { recursive: true });

  const generatedFiles = [];
  const pngBuffers = new Map();

  for (const spec of GENERATED_ICON_SPECS) {
    const buffer = await sharp(input)
      .ensureAlpha()
      .resize(spec.size, spec.size, {
        fit: resolveFit(fit),
        position: "centre",
        background: resolveBackground(background)
      })
      .png({ compressionLevel: 9 })
      .toBuffer();

    const filePath = path.join(outputDir, spec.filename);
    await fs.writeFile(filePath, buffer);

    pngBuffers.set(spec.filename, buffer);
    generatedFiles.push({
      ...spec,
      filePath,
      publicPath: `${String(basePath).replace(/\/+$/, "")}/${spec.filename}`
    });
  }

  const icoBuffers = ICO_SOURCE_FILENAMES.map((filename) => pngBuffers.get(filename)).filter(Boolean);
  const icoPath = path.join(outputDir, ICO_FILE);
  if (icoBuffers.length > 0) {
    const icoBuffer = await pngToIco(icoBuffers);
    await fs.writeFile(icoPath, icoBuffer);
  }

  let manifest = null;
  let manifestOutputPath = null;
  if (includeManifest) {
    manifest = buildWebManifest({
      appName,
      basePath,
      themeColor,
      backgroundColor
    });
    manifestOutputPath = resolveOutputPath(outputDir, manifestFile);
    await fs.writeFile(manifestOutputPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  const snippet = buildFaviconHtml({
    basePath,
    includeManifest,
    manifestPath:
      manifestPath ||
      (includeManifest ? `${String(basePath).replace(/\/+$/, "")}/${path.basename(manifestFile)}` : undefined)
  });

  if (htmlOutputFile) {
    await fs.writeFile(resolveOutputPath(outputDir, htmlOutputFile), `${snippet}\n`);
  }

  if (metadataFile) {
    const metadata = {
      input: path.resolve(input),
      outputDir: path.resolve(outputDir),
      basePath,
      generatedFiles,
      icoPath,
      manifestPath: manifestOutputPath,
      snippet
    };
    await fs.writeFile(resolveOutputPath(outputDir, metadataFile), `${JSON.stringify(metadata, null, 2)}\n`);
  }

  return {
    generatedFiles,
    icoPath,
    manifest,
    manifestPath: manifestOutputPath,
    snippet
  };
}

export async function writeFaviconSnippet(options = {}) {
  const { outputFile } = options;

  if (!outputFile) {
    throw new Error("Missing required option: outputFile");
  }

  const snippet = buildSnippetForFramework(options);
  await fs.writeFile(outputFile, `${snippet}\n`);
  return { outputFile, snippet };
}

export async function injectFaviconsIntoFile(options = {}) {
  const { file, markerName = DEFAULT_MARKER_NAME } = options;

  if (!file) {
    throw new Error("Missing required option: file");
  }

  const currentContent = await fs.readFile(file, "utf8");
  const snippet = buildSnippetForFramework(options);
  const updatedContent = injectManagedSnippet(currentContent, snippet, { markerName });

  await fs.writeFile(file, updatedContent);

  return {
    file,
    markerName,
    snippet
  };
}
