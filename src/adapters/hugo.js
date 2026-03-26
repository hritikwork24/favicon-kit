import {
  DEFAULT_MANIFEST_FILE,
  HTML_ICON_SPECS,
  ICO_FILE
} from "../icon-spec.js";

function normalizeHugoBasePath(basePath) {
  return String(basePath || "images/favicons")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

function buildHugoRelUrl(pathValue) {
  return `{{ "${pathValue}" | relURL }}`;
}

export function buildHugoSnippet(options = {}) {
  const {
    basePath = "images/favicons",
    includeManifest = false,
    manifestPath,
    indent = ""
  } = options;

  const normalizedBasePath = normalizeHugoBasePath(basePath);

  const lines = HTML_ICON_SPECS.map((spec) => {
    const href = buildHugoRelUrl(`${normalizedBasePath}/${spec.filename}`);
    return `${indent}<link rel="${spec.rel}" type="${spec.type}" sizes="${spec.size}x${spec.size}" href="${href}">`;
  });

  lines.push(
    `${indent}<link rel="shortcut icon" href="${buildHugoRelUrl(`${normalizedBasePath}/${ICO_FILE}`)}">`
  );

  if (includeManifest) {
    lines.push(
      `${indent}<link rel="manifest" href="${buildHugoRelUrl(manifestPath || `${normalizedBasePath}/${DEFAULT_MANIFEST_FILE}`)}">`
    );
  }

  return lines.join("\n");
}
