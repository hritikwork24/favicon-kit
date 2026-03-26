import { DEFAULT_MARKER_NAME } from "./icon-spec.js";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getManagedMarkerBlock(markerName = DEFAULT_MARKER_NAME) {
  return {
    start: `<!-- ${markerName}:start -->`,
    end: `<!-- ${markerName}:end -->`
  };
}

export function wrapManagedSnippet(snippet, markerName = DEFAULT_MARKER_NAME) {
  const { start, end } = getManagedMarkerBlock(markerName);
  return `${start}\n${snippet}\n${end}`;
}

export function injectManagedSnippet(html, snippet, options = {}) {
  const markerName = options.markerName || DEFAULT_MARKER_NAME;
  const wrappedSnippet = wrapManagedSnippet(snippet, markerName);
  const { start, end } = getManagedMarkerBlock(markerName);
  const managedBlockPattern = new RegExp(
    `${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`,
    "i"
  );

  if (managedBlockPattern.test(html)) {
    return html.replace(managedBlockPattern, wrappedSnippet);
  }

  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `${wrappedSnippet}\n</head>`);
  }

  return `${html}\n${wrappedSnippet}\n`;
}
