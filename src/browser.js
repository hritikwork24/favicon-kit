import { getFaviconTagDefinitions } from "./html-tags.js";

const MANAGED_ATTRIBUTE = "data-favicon-kit";

function getDocument(documentRef) {
  return documentRef || globalThis.document;
}

export function clearManagedFaviconTags(options = {}) {
  const documentObject = getDocument(options.documentRef);

  if (!documentObject || !documentObject.head) {
    return [];
  }

  const nodes = Array.from(documentObject.head.querySelectorAll(`[${MANAGED_ATTRIBUTE}="true"]`));
  nodes.forEach((node) => node.remove());
  return nodes;
}

export function applyFaviconTags(options = {}) {
  const { documentRef, clearManaged = true, ...tagOptions } = options;
  const documentObject = getDocument(documentRef);

  if (!documentObject || !documentObject.head) {
    return [];
  }

  if (clearManaged) {
    clearManagedFaviconTags({ documentRef: documentObject });
  }

  const createdNodes = [];
  const definitions = getFaviconTagDefinitions(tagOptions);

  definitions.forEach((definition) => {
    const node = documentObject.createElement(definition.tag);
    Object.entries(definition.attrs).forEach(([name, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        node.setAttribute(name, value);
      }
    });
    node.setAttribute(MANAGED_ATTRIBUTE, "true");
    documentObject.head.appendChild(node);
    createdNodes.push(node);
  });

  return createdNodes;
}

export function applySingleFavicon(options = {}) {
  const {
    href,
    appleTouchIconHref = href,
    documentRef,
    clearManaged = true
  } = options;

  const documentObject = getDocument(documentRef);

  if (!documentObject || !documentObject.head || !href) {
    return [];
  }

  if (clearManaged) {
    clearManagedFaviconTags({ documentRef: documentObject });
  }

  const entries = [
    { rel: "icon", href },
    { rel: "apple-touch-icon", href: appleTouchIconHref }
  ];

  return entries.map((entry) => {
    const node = documentObject.createElement("link");
    node.setAttribute("rel", entry.rel);
    node.setAttribute("href", entry.href);
    node.setAttribute(MANAGED_ATTRIBUTE, "true");
    documentObject.head.appendChild(node);
    return node;
  });
}
