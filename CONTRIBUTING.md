# Contributing

## Local setup

```bash
npm install
npm test
npm run pack:check
```

## Development expectations

- Keep the package compatible with Node 18+
- Preserve the public API unless releasing a breaking change
- Update `README.md` when changing CLI flags or public exports
- Update `CHANGELOG.md` for user-facing changes

## Release flow

```bash
npm version patch
npm test
npm run pack:check
npm publish --access public
```

Use `minor` or `major` instead of `patch` when appropriate.
