# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning.

## [0.2.0] - 2026-03-26

### Added

- New `init` command that detects `html`, `laravel`, and `hugo` projects
- Automatic favicon structure setup for projects that do not already have favicon files
- Safe managed include/head injection for supported frameworks
- `.favicon-kit.json` config output for initialized projects
- Expanded test coverage for the project initialization flow

## [0.1.0] - 2026-03-26

### Added

- Initial public package scaffold for `@hritikwork.npm/favicon-kit`
- Node API for favicon generation and HTML injection
- Browser API for runtime favicon tag management
- HTML, Laravel, and Hugo snippet adapters
- CLI commands for `generate`, `snippet`, and `inject`
- GitHub Actions workflows for CI and npm publishing
