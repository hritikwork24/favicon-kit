export const DEFAULT_BASE_PATH = "/images/favicons";
export const DEFAULT_MANIFEST_FILE = "site.webmanifest";
export const DEFAULT_MARKER_NAME = "favicon-kit";
export const ICO_FILE = "favicon.ico";
export const ICO_SOURCE_FILENAMES = [
  "favicon-16x16.png",
  "favicon-32x32.png",
  "favicon-48x48.png"
];

export const GENERATED_ICON_SPECS = [
  { size: 16, filename: "favicon-16x16.png", rel: "icon", type: "image/png", includeInHtml: true },
  { size: 32, filename: "favicon-32x32.png", rel: "icon", type: "image/png", includeInHtml: true },
  { size: 48, filename: "favicon-48x48.png", rel: "icon", type: "image/png", includeInHtml: true },
  { size: 64, filename: "favicon-64x64.png", rel: "icon", type: "image/png", includeInHtml: false },
  { size: 96, filename: "favicon-96x96.png", rel: "icon", type: "image/png", includeInHtml: true },
  { size: 128, filename: "favicon-128x128.png", rel: "icon", type: "image/png", includeInHtml: false },
  { size: 152, filename: "apple-touch-icon-152x152.png", rel: "apple-touch-icon", type: "image/png", includeInHtml: true },
  { size: 167, filename: "apple-touch-icon-167x167.png", rel: "apple-touch-icon", type: "image/png", includeInHtml: true },
  { size: 180, filename: "apple-touch-icon-180x180.png", rel: "apple-touch-icon", type: "image/png", includeInHtml: true },
  { size: 192, filename: "android-chrome-192x192.png", rel: "icon", type: "image/png", includeInHtml: true },
  { size: 512, filename: "android-chrome-512x512.png", rel: "icon", type: "image/png", includeInHtml: true }
];

export const HTML_ICON_SPECS = GENERATED_ICON_SPECS.filter((spec) => spec.includeInHtml);

export const MANIFEST_ICON_SPECS = GENERATED_ICON_SPECS.filter((spec) =>
  spec.size === 192 || spec.size === 512
);
