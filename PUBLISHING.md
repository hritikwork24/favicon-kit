# Publishing @hritikwork.npm/favicon-kit

## 1. Create the GitHub repo

Create this repository on GitHub:

- `https://github.com/hritikwork24/favicon-kit`

Do not add a README, `.gitignore`, or license from the GitHub UI because those files already exist here.

## 2. Move into the package folder

```bash
cd packages/favicon-kit
```

## 3. Initialize it as its own repo

```bash
git init
git branch -M main
git add .
git commit -m "Initial release"
git remote add origin https://github.com/hritikwork24/favicon-kit.git
git push -u origin main
```

## 4. Install dependencies

```bash
npm install
```

## 5. Verify the package

```bash
npm test
npm run pack:check
```

## 6. Publish to npm

```bash
npm login
npm publish --access public
```

## 7. Optional GitHub Actions setup

Add this repository secret in GitHub before using the publish workflow:

- `NPM_TOKEN`

The package already includes:

- `.github/workflows/ci.yml`
- `.github/workflows/publish.yml`

## 8. Future releases

```bash
npm version patch
git push --follow-tags
npm publish --access public
```

Use `minor` or `major` instead of `patch` when needed.

