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

const FRAMEWORKS = ["html", "laravel", "hugo"];
const DEFAULT_CONFIG_FILE = ".favicon-kit.json";

const FRAMEWORK_CONFIG = {
  html: {
    inputCandidates: [
      "logo.png",
      "logo.jpg",
      "logo.jpeg",
      "logo.webp",
      "logo.svg",
      "public/logo.png",
      "public/logo.jpg",
      "public/logo.jpeg",
      "public/logo.webp",
      "public/images/logo.png",
      "public/images/logo.jpg",
      "public/images/logo.jpeg",
      "public/images/logo.webp",
      "images/logo.png",
      "images/logo.jpg",
      "assets/logo.png",
      "assets/logo.jpg"
    ],
    headCandidates: [
      "index.html",
      "public/index.html",
      "src/index.html"
    ],
    defaultOutputDir: ["images", "favicons"],
    defaultOutputDirWithPublic: ["public", "images", "favicons"],
    defaultSnippetFile: "favicon-head.html"
  },
  laravel: {
    inputCandidates: [
      "public/logo.png",
      "public/logo.jpg",
      "public/logo.jpeg",
      "public/logo.webp",
      "public/logo.svg",
      "public/images/logo.png",
      "public/images/logo.jpg",
      "public/images/logo.jpeg",
      "public/images/logo.webp",
      "public/images/uploads/logo.png",
      "public/images/uploads/logo.jpg"
    ],
    headCandidates: [
      "resources/views/layouts/app.blade.php",
      "resources/views/layouts/master.blade.php",
      "resources/views/layouts/main.blade.php",
      "resources/views/layouts/guest.blade.php",
      "resources/views/welcome.blade.php"
    ],
    defaultOutputDir: ["public", "images", "favicons"],
    defaultSnippetFile: ["resources", "views", "partials", "favicon.blade.php"]
  },
  hugo: {
    inputCandidates: [
      "static/logo.png",
      "static/logo.jpg",
      "static/logo.jpeg",
      "static/logo.webp",
      "static/logo.svg",
      "static/images/logo.png",
      "static/images/logo.jpg",
      "static/images/logo.jpeg",
      "static/images/logo.webp",
      "assets/logo.png",
      "assets/logo.jpg"
    ],
    headCandidates: [
      "layouts/_default/baseof.html",
      "layouts/partials/head.html",
      "layouts/index.html"
    ],
    defaultOutputDir: ["static", "images", "favicons"],
    defaultSnippetFile: ["layouts", "partials", "favicon.html"]
  }
};

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

function normalizeSlashes(value) {
  return value.replace(/\\/g, "/");
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function findFirstExisting(projectDir, candidates = []) {
  for (const candidate of candidates) {
    const absolutePath = path.resolve(projectDir, candidate);
    if (await pathExists(absolutePath)) {
      return absolutePath;
    }
  }

  return null;
}

function toRelativeDisplayPath(projectDir, targetPath) {
  return normalizeSlashes(path.relative(projectDir, targetPath) || ".");
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

function getFrameworkDefaults(framework) {
  const defaults = FRAMEWORK_CONFIG[framework];

  if (!defaults) {
    throw new Error(`Unsupported framework: ${framework}`);
  }

  return defaults;
}

export async function detectFramework(projectDir, explicitFramework) {
  if (explicitFramework) {
    if (!FRAMEWORKS.includes(explicitFramework)) {
      throw new Error(`Unsupported framework: ${explicitFramework}`);
    }
    return explicitFramework;
  }

  if (await pathExists(path.resolve(projectDir, "artisan"))) {
    return "laravel";
  }

  if (
    (await pathExists(path.resolve(projectDir, "hugo.toml"))) ||
    (await pathExists(path.resolve(projectDir, "config.toml"))) ||
    (await pathExists(path.resolve(projectDir, "config.yaml"))) ||
    (await pathExists(path.resolve(projectDir, "config.yml")))
  ) {
    return "hugo";
  }

  if (await findFirstExisting(projectDir, FRAMEWORK_CONFIG.html.headCandidates)) {
    return "html";
  }

  throw new Error(
    "Unable to detect project framework automatically. Use --framework html, --framework laravel, or --framework hugo."
  );
}

export async function resolveInputFile(projectDir, framework, explicitInput) {
  if (explicitInput) {
    const resolvedInput = path.resolve(projectDir, explicitInput);
    if (!(await pathExists(resolvedInput))) {
      throw new Error(`Input file is missing: ${resolvedInput}`);
    }
    return resolvedInput;
  }

  const defaults = getFrameworkDefaults(framework);
  const detectedInput = await findFirstExisting(projectDir, defaults.inputCandidates);

  if (detectedInput) {
    return detectedInput;
  }

  const searchedPaths = defaults.inputCandidates.map((candidate) => `- ${candidate}`).join("\n");
  throw new Error(
    `No input image was found automatically for ${framework}. Provide --input <file>. Searched:\n${searchedPaths}`
  );
}

function buildIncludeReference(framework, projectDir, snippetFile) {
  if (framework === "laravel") {
    const viewsRoot = path.resolve(projectDir, "resources/views");
    const relativePath = normalizeSlashes(path.relative(viewsRoot, snippetFile))
      .replace(/\.blade\.php$/, "")
      .split("/")
      .join(".");

    return `@include('${relativePath}')`;
  }

  if (framework === "hugo") {
    return `{{ partial "${path.basename(snippetFile)}" . }}`;
  }

  return "";
}

export async function writeManagedSnippetToFile(options = {}) {
  const { file, snippet, markerName = DEFAULT_MARKER_NAME } = options;

  if (!file) {
    throw new Error("Missing required option: file");
  }

  if (!snippet) {
    throw new Error("Missing required option: snippet");
  }

  await fs.mkdir(path.dirname(file), { recursive: true });

  const currentContent = (await pathExists(file)) ? await fs.readFile(file, "utf8") : "";
  const updatedContent = injectManagedSnippet(currentContent, snippet, { markerName });

  await fs.writeFile(file, updatedContent);

  return { file, snippet, markerName };
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

  if (!(await pathExists(input))) {
    throw new Error(`Input file is missing: ${input}`);
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

  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  const snippet = buildSnippetForFramework(options);
  await fs.writeFile(outputFile, `${snippet}\n`);
  return { outputFile, snippet };
}

export async function injectFaviconsIntoFile(options = {}) {
  const { file, markerName = DEFAULT_MARKER_NAME } = options;

  if (!file) {
    throw new Error("Missing required option: file");
  }

  const snippet = buildSnippetForFramework(options);
  return writeManagedSnippetToFile({ file, snippet, markerName });
}

export async function initFaviconProject(options = {}) {
  const projectDir = path.resolve(options.projectDir || process.cwd());
  const framework = await detectFramework(projectDir, options.framework);
  const defaults = getFrameworkDefaults(framework);
  const includeManifest = options.includeManifest !== false;
  const basePath = options.basePath || DEFAULT_BASE_PATH;
  const input = await resolveInputFile(projectDir, framework, options.input);

  const outputDir = options.outputDir
    ? path.resolve(projectDir, options.outputDir)
    : path.resolve(
        projectDir,
        ...(framework === "html" && (await pathExists(path.resolve(projectDir, "public")))
          ? defaults.defaultOutputDirWithPublic
          : defaults.defaultOutputDir)
      );

  const generated = await generateFavicons({
    input,
    outputDir,
    basePath,
    fit: options.fit || "contain",
    background: options.background || "transparent",
    includeManifest,
    manifestFile: options.manifestFile || DEFAULT_MANIFEST_FILE,
    manifestPath: options.manifestPath,
    appName: options.appName || "Website",
    themeColor: options.themeColor || "#ffffff",
    backgroundColor: options.backgroundColor || options.themeColor || "#ffffff"
  });

  const result = {
    framework,
    projectDir,
    input,
    outputDir,
    basePath,
    generatedCount: generated.generatedFiles.length,
    generatedFiles: generated.generatedFiles,
    icoPath: generated.icoPath,
    headTarget: null,
    snippetFile: null,
    configFile: null,
    warnings: []
  };

  if (framework === "html") {
    const headTarget = options.file
      ? path.resolve(projectDir, options.file)
      : await findFirstExisting(projectDir, defaults.headCandidates);

    if (headTarget) {
      await injectFaviconsIntoFile({
        file: headTarget,
        framework: "html",
        basePath,
        includeManifest,
        manifestPath: options.manifestPath,
        markerName: options.marker || DEFAULT_MARKER_NAME
      });
      result.headTarget = headTarget;
    } else {
      const snippetFile = path.resolve(projectDir, options.snippetFile || defaults.defaultSnippetFile);
      await writeFaviconSnippet({
        outputFile: snippetFile,
        framework: "html",
        basePath,
        includeManifest,
        manifestPath: options.manifestPath
      });
      result.snippetFile = snippetFile;
      result.warnings.push(
        "No HTML head file was detected automatically. A snippet file was created instead; include it manually."
      );
    }
  }

  if (framework === "laravel" || framework === "hugo") {
    const snippetFile = options.snippetFile
      ? path.resolve(projectDir, options.snippetFile)
      : path.resolve(projectDir, ...[].concat(defaults.defaultSnippetFile));

    await writeFaviconSnippet({
      outputFile: snippetFile,
      framework,
      basePath: framework === "laravel" ? basePath.replace(/^\//, "") : basePath.replace(/^\//, ""),
      includeManifest,
      manifestPath: options.manifestPath
    });
    result.snippetFile = snippetFile;

    const headTarget = options.file
      ? path.resolve(projectDir, options.file)
      : await findFirstExisting(projectDir, defaults.headCandidates);

    if (headTarget) {
      const includeSnippet = buildIncludeReference(framework, projectDir, snippetFile);
      await writeManagedSnippetToFile({
        file: headTarget,
        snippet: includeSnippet,
        markerName: `${options.marker || DEFAULT_MARKER_NAME}-include`
      });
      result.headTarget = headTarget;
    } else {
      result.warnings.push(
        `No ${framework} head target was detected automatically. The snippet file was created; include it manually.`
      );
    }
  }

  const configFile = path.resolve(projectDir, options.configFile || DEFAULT_CONFIG_FILE);
  const config = {
    framework,
    input: toRelativeDisplayPath(projectDir, input),
    outputDir: toRelativeDisplayPath(projectDir, outputDir),
    basePath,
    headTarget: result.headTarget ? toRelativeDisplayPath(projectDir, result.headTarget) : null,
    snippetFile: result.snippetFile ? toRelativeDisplayPath(projectDir, result.snippetFile) : null
  };
  await fs.writeFile(configFile, `${JSON.stringify(config, null, 2)}\n`);
  result.configFile = configFile;

  return result;
}
