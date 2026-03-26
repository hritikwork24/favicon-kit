# @hritikwork.npm/favicon-kit

A reusable favicon package for generating favicon assets, creating framework-friendly favicon structure, and safely wiring favicon tags into a project.

## What this package does

- Generates a standard favicon set from one logo or icon image
- Creates a real `favicon.ico`
- Detects `html`, `laravel`, and `hugo` projects
- Creates proper favicon structure for those projects
- Produces snippets for `html`, `laravel`, and `hugo`
- Injects managed favicon blocks into project head files safely

## Install

```bash
npm install @hritikwork.npm/favicon-kit
```

Node 18 or newer is required.

## Recommended command: init

Use `init` when a project does not already have favicon structure and you want the package to set it up for you.

### Simple HTML

```bash
npx favicon-kit init --framework html --input ./logo.png --file ./index.html
```

### Laravel

```bash
npx favicon-kit init --framework laravel --input ./public/images/logo.png
```

### Hugo

```bash
npx favicon-kit init --framework hugo --input ./static/images/logo.png
```

What `init` does:

- detects the project type if you do not pass `--framework`
- finds or uses the input image
- creates the favicon output folder
- generates the favicon files
- writes the correct snippet/partial structure
- injects a managed include or head block when possible
- writes `.favicon-kit.json`

## Quick start without init

### 1. Generate favicon files

```bash
npx favicon-kit generate \
  --input ./logo.png \
  --out ./public/images/favicons \
  --base-path /images/favicons
```

### 2. Add the favicon tags to your project

For plain HTML:

```bash
npx favicon-kit inject \
  --framework html \
  --file ./public/index.html \
  --base-path /images/favicons
```

For Laravel:

```bash
npx favicon-kit snippet \
  --framework laravel \
  --base-path images/favicons \
  --out ./resources/views/partials/favicon.blade.php
```

For Hugo:

```bash
npx favicon-kit snippet \
  --framework hugo \
  --base-path images/favicons \
  --out ./layouts/partials/favicon.html
```

## CLI usage

### Initialize a project

```bash
npx favicon-kit init --framework laravel --input ./public/images/logo.png
```

### Generate favicon assets

```bash
npx favicon-kit generate \
  --input ./logo.png \
  --out ./public/images/favicons \
  --base-path /images/favicons \
  --html favicon-head.html
```

### Write a framework snippet

```bash
npx favicon-kit snippet \
  --framework laravel \
  --base-path images/favicons \
  --out ./resources/views/partials/favicon.blade.php
```

### Inject into an existing head file

```bash
npx favicon-kit inject \
  --framework html \
  --file ./public/index.html \
  --base-path /images/favicons
```

Supported frameworks:

- `html`
- `laravel`
- `hugo`

Managed blocks use markers like:

```html
<!-- favicon-kit:start -->
<!-- favicon-kit:end -->
```

## Node API

```js
import { generateFavicons, initFaviconProject, injectFaviconsIntoFile } from "@hritikwork.npm/favicon-kit/node";

await initFaviconProject({
  framework: "html",
  input: "./logo.png",
  file: "./index.html"
});

await generateFavicons({
  input: "./logo.png",
  outputDir: "./public/images/favicons",
  basePath: "/images/favicons"
});

await injectFaviconsIntoFile({
  file: "./public/index.html",
  framework: "html",
  basePath: "/images/favicons"
});
```

## Browser API

Use this when you only want runtime favicon updates in the browser.

```js
import { applyFaviconTags, applySingleFavicon } from "@hritikwork.npm/favicon-kit/browser";

applyFaviconTags({
  basePath: "/images/favicons",
  includeManifest: true
});

applySingleFavicon({
  href: "/brand/favicon.png"
});
```

## Adapter imports

```js
import { buildHtmlSnippet } from "@hritikwork.npm/favicon-kit/adapters/html";
import { buildLaravelBladeSnippet } from "@hritikwork.npm/favicon-kit/adapters/laravel";
import { buildHugoSnippet } from "@hritikwork.npm/favicon-kit/adapters/hugo";
```

## Verification

Check the CLI:

```bash
npx favicon-kit help
```

Verify the published package version:

```bash
npm view @hritikwork.npm/favicon-kit version
```

## Testing

```bash
npm test
```
