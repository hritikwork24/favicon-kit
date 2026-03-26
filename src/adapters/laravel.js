import {
  DEFAULT_MANIFEST_FILE,
  HTML_ICON_SPECS,
  ICO_FILE
} from "../icon-spec.js";

function normalizeAssetBasePath(basePath) {
  return String(basePath || "images/favicons")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

function joinAssetPath(basePath, filename) {
  return `${normalizeAssetBasePath(basePath)}/${filename}`;
}

function buildAssetExpression(pathValue, assetFunction) {
  const escapedPath = pathValue.replace(/'/g, "\\'");
  return `{{ ${assetFunction}('${escapedPath}') }}`;
}

export function buildLaravelBladeSnippet(options = {}) {
  const {
    basePath = "images/favicons",
    assetFunction = "asset",
    includeManifest = false,
    manifestPath,
    indent = ""
  } = options;

  const lines = HTML_ICON_SPECS.map((spec) => {
    const href = buildAssetExpression(joinAssetPath(basePath, spec.filename), assetFunction);
    return `${indent}<link rel="${spec.rel}" type="${spec.type}" sizes="${spec.size}x${spec.size}" href="${href}">`;
  });

  lines.push(
    `${indent}<link rel="shortcut icon" href="${buildAssetExpression(joinAssetPath(basePath, ICO_FILE), assetFunction)}">`
  );

  if (includeManifest) {
    const resolvedManifestPath = manifestPath || joinAssetPath(basePath, DEFAULT_MANIFEST_FILE);
    lines.push(
      `${indent}<link rel="manifest" href="${buildAssetExpression(resolvedManifestPath, assetFunction)}">`
    );
  }

  return lines.join("\n");
}
