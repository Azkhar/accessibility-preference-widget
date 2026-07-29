# Accessibility Preference Widget

A WCAG 2.2-focused accessibility preference widget built with vanilla JavaScript, Shadow DOM isolation, and persistent user settings.

> This widget does not by itself make a website WCAG-conformant. Site-wide design, content, code, and assistive-technology testing are still required.

## Features

- One-script browser integration
- Shadow DOM for the widget interface
- Preferences persisted in `localStorage`
- Text size, font family, line height, letter spacing, and text alignment controls
- Dark, warm, light, and blue contrast modes
- Monochrome mode and image hiding
- Reading line and reading mask
- Large cursor and enhanced focus indicators
- Pause-animation preference
- Link and heading highlighting
- Skip-to-content helper and explanatory tooltips
- Browser speech synthesis-based audio description controls
- Multilingual interface

The public core does not include license validation, customer-specific services, sign-language video services, keyboard-navigation simulation, a screen-reader replacement, or layout-control modules.

## Quick start

Use the production bundle on a page:

```html
<script src="/assets/widget.min.js" defer></script>
```

Use `dist/widget.js` during development when readable source is preferable.

The widget mounts itself once, creates an open Shadow Root, and injects its trigger and preference dialog into the page. No key, endpoint, or remote service is required.

## Build from source

Requirements:

- Node.js 18 or later
- npm with lockfile support

```bash
npm ci
npm run build
npm test
```

`npm run build` creates:

- `dist/widget.js` — readable development bundle
- `dist/widget.min.js` — minified production bundle

The build creates `dist/` automatically.

## Demo

Build the project, then serve the repository root with any local static server and open `demo/index.html`.

For example:

```bash
npx --yes http-server .
```

The demo uses only the local readable bundle and does not require a key or service connection. The `npx` example downloads a third-party development tool if it is not already cached; any equivalent local HTTP server can be used instead.

## Architecture and page effects

The widget interface is isolated in Shadow DOM. Preference modules intentionally apply CSS classes, styles, or helper elements to the host document so they can affect page content. Settings are stored under `a11y-*` keys in `localStorage`.

Reset removes widget-owned preferences while preserving the selected interface language.

The bundle performs no application-level network requests. It uses system font stacks. Audio description relies on the browser's Web Speech API and the voices available in the user's operating system or browser.

## Accessibility scope

See [docs/accessibility.md](docs/accessibility.md) for implemented behavior, known limitations, and the required manual test matrix.

The project is WCAG 2.2-focused. It is a user-preference tool, not an automated remediation layer or conformance certificate.

## Browser support

The current implementation requires:

- Shadow DOM
- `inert`
- `localStorage`
- modern DOM APIs such as `composedPath`
- Web Speech API only for the optional audio-description preference

No formal browser/assistive-technology compatibility matrix has been completed yet.

## Development

Before submitting a change:

```bash
npm ci
npm test
```

Tests build both bundles and check package metadata, initial dialog semantics, demo independence, excluded private integrations, and prohibited definitive WCAG wording.

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

Do not report vulnerabilities, keys, tokens, private URLs, or customer data in public issues. Follow [SECURITY.md](SECURITY.md).

## Third-party notices

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). The project bundles no third-party font files and makes no font CDN requests.

## License

The project is provided under the [MIT License](LICENSE), subject to confirmation that all original contributors and applicable rights holders authorize the public release. Third-party components remain under their respective licenses.
