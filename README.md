# @hritikwork.npm/favicon-kit

A publish-ready favicon package for generating favicon assets, writing framework-specific head snippets, and injecting favicon tags at runtime.

## Features

- Generate PNG favicons plus a real `favicon.ico`
- Produce ready-to-use snippets for `html`, `laravel`, and `hugo`
- Inject a managed favicon block into an existing `<head>`
- Use a browser helper when you only want runtime head injection

## Install

```bash
npm install @hritikwork.npm/favicon-kit
```

## CLI

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

Supported frameworks:

- `html`
- `laravel`
- `hugo`

### Inject into an existing head file

```bash
npx favicon-kit inject \
  --framework html \
  --file ./public/index.html \
  --base-path /images/favicons
```

This creates or updates a managed block:

```html
<!-- favicon-kit:start -->
...
<!-- favicon-kit:end -->
```

## Node API

```js
import { generateFavicons, injectFaviconsIntoFile } from "@hritikwork.npm/favicon-kit/node";

await generateFavicons({
  input: "./logo.png",
  outputDir: "./public/images/favicons",
  basePath: "/images/favicons",
  htmlOutputFile: "favicon-head.html"
});

await injectFaviconsIntoFile({
  file: "./public/index.html",
  framework: "html",
  basePath: "/images/favicons"
});
```

## Browser API

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

Use the browser helper when you only want runtime head injection. Use the Node API or CLI when you want actual files generated in a project.

## Adapters

```js
import { buildHtmlSnippet } from "@hritikwork.npm/favicon-kit/adapters/html";
import { buildLaravelBladeSnippet } from "@hritikwork.npm/favicon-kit/adapters/laravel";
import { buildHugoSnippet } from "@hritikwork.npm/favicon-kit/adapters/hugo";
```

## Default generated files

- `favicon-16x16.png`
- `favicon-32x32.png`
- `favicon-48x48.png`
- `favicon-64x64.png`
- `favicon-96x96.png`
- `favicon-128x128.png`
- `apple-touch-icon-152x152.png`
- `apple-touch-icon-167x167.png`
- `apple-touch-icon-180x180.png`
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`
- `favicon.ico`

## Publish checklist

1. Create a dedicated GitHub repo, preferably `https://github.com/hritikwork24/favicon-kit`.
2. Push the contents of `packages/favicon-kit` there.
3. Run `npm login`.
4. Run `npm test`.
5. Run `npm run pack:check`.
6. Publish with `npm publish --access public`.

If you publish under a different repo name, update the `repository`, `bugs`, and `homepage` fields in `package.json` first.

## Testing

```bash
npm test
```

