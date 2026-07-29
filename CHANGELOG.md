# Changelog

All notable changes to this project will be documented in this file. The format follows Keep a Changelog, and the project intends to use Semantic Versioning after its first tagged public release.

## [Unreleased]

### Added

- SPA-aware mount, destroy, refresh, route filtering, and runtime configuration API
- Dynamic DOM refresh for page-level preferences
- CSP nonce propagation for widget-owned styles
- Readable and minified source maps plus SHA-384 integrity metadata
- TypeScript declarations, runtime tests, static public-release checks, and CI

### Changed

- Read-aloud labeling now reflects browser speech synthesis behavior
- Skip navigation is a standard skip-to-content helper
- Language and preference-profile sections use native disclosure buttons
- Preference profile labels describe settings without implying medical safety
- Host-page styles and attributes are restored more precisely during reset and destroy

### Removed

- License validation, private endpoints, customer-specific services, and proprietary sign-language integration from the public core
- Definitive WCAG conformance wording and the Ctrl+U shortcut
