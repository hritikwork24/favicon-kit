import {
  DEFAULT_BASE_PATH,
  DEFAULT_MANIFEST_FILE,
  HTML_ICON_SPECS,
  ICO_FILE
} from "./icon-spec.js";

function stripTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

function ensureLeadingSlash(value) {
  if (!value) {
    return "";
  }

  return value.startsWith("/") ? value : `/${value}`;
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
}

function joinUrl(basePath, filename) {
  const normalizedBasePath = stripTrailingSlash(ensureLeadingSlash(basePath || DEFAULT_BASE_PATH));
  return `${normalizedBasePath}/${filename}`;
}

export function getFaviconTagDefinitions(options = {}) {
  const {
    basePath = DEFAULT_BASE_PATH,
    includeManifest = false,
    includeShortcutIcon = true,
    manifestPath
  } = options;

  const tags = HTML_ICON_SPECS.map((spec) => ({
    tag: "link",
    attrs: {
      rel: spec.rel,
      type: spec.type,
      sizes: `${spec.size}x${spec.size}`,
      href: joinUrl(basePath, spec.filename)
    }
  }));

  if (includeShortcutIcon) {
    tags.push({
      tag: "link",
      attrs: {
        rel: "shortcut icon",
        href: joinUrl(basePath, ICO_FILE)
      }
    });
  }

  if (includeManifest) {
    tags.push({
      tag: "link",
      attrs: {
        rel: "manifest",
        href: manifestPath || joinUrl(basePath, DEFAULT_MANIFEST_FILE)
      }
    });
  }

  return tags;
}

export function serializeHtmlTag(definition) {
  const attributes = Object.entries(definition.attrs)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([name, value]) => `${name}="${escapeAttribute(value)}"`)
    .join(" ");

  return `<${definition.tag}${attributes ? ` ${attributes}` : ""}>`;
}

export function buildFaviconHtml(options = {}) {
  const { indent = "" } = options;

  return getFaviconTagDefinitions(options)
    .map((definition) => `${indent}${serializeHtmlTag(definition)}`)
    .join("\n");
}
