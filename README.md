# Accessibility Preference Widget

A dependency-free, WCAG 2.2-focused accessibility preference widget for static sites and single-page applications. Its interface runs in Shadow DOM while user-selected presentation preferences are applied to the host page.

> This widget does not by itself make a website WCAG-conformant. Site-wide design, content, code, and assistive-technology testing are still required.

## Live Demo

[Open the Accessibility Preference Widget demo](https://azkhar.github.io/accessibility-preference-widget/)

## Features

- One-script, keyless integration with no application-level network requests
- Open Shadow DOM for interface isolation
- Preferences persisted under `a11y-*` keys in `localStorage`
- Text size, font family, line height, letter spacing, and text alignment
- Dark, warm, light, and blue contrast modes
- Monochrome presentation, image hiding, and animation pausing
- Reading line, reading mask, skip-to-content, and browser-based read aloud
- Large cursor, enhanced focus indicator, link highlighting, and heading highlighting
- Six optional preference presets
- Eleven interface languages
- SPA route awareness, dynamic-content refresh, and explicit lifecycle API
- Bottom-left or bottom-right placement, configurable offsets, and CSP nonce support

The public core does not contain license validation, customer-specific services, proprietary APIs, sign-language video services, keyboard-navigation simulation, a screen-reader replacement, or layout-control modules.

## Quick start

Build the repository and self-host the production bundle:

```html
<script src="/vendor/accessibility-preference-widget/widget.min.js" defer></script>
```

No key, endpoint, account, or remote service is required. Use `dist/widget.js` instead when a readable development bundle is preferable.

This repository is prepared for npm packaging, but do not assume the package name is available from the npm registry until an official release is published.

## Build and test

Requirements: Node.js 18 or later and npm.

```bash
npm ci
npm run check
npm test
npm audit --audit-level=high
```

`npm run build` creates:

- `dist/widget.js` and `dist/widget.js.map`
- `dist/widget.min.js` and `dist/widget.min.js.map`
- `dist/integrity.json` with SHA-384 integrity values

The `dist/` directory is created automatically and intentionally ignored by Git.

## Configuration

Set configuration before loading the bundle:

```html
<script>
  window.AccessibilityPreferenceWidgetConfig = {
    position: "bottom-left",
    language: "en",
    excludePaths: ["/checkout"],
    offsetX: "1.5rem",
    offsetY: "1.5rem"
  };
</script>
<script src="/vendor/accessibility-preference-widget/widget.min.js" defer></script>
```

Or use data attributes:

```html
<script
  src="/vendor/accessibility-preference-widget/widget.min.js"
  data-position="bottom-left"
  data-language="en"
  data-exclude-paths="/checkout,/embed/*"
  data-offset-x="1.5rem"
  data-offset-y="1.5rem"
  defer
></script>
```

Supported options:

| Option | Default | Purpose |
| --- | --- | --- |
| `autoMount` | `true` | Mount when the document is ready |
| `disabled` | `false` | Keep the widget unmounted |
| `excludePaths` | `[]` | Exact, prefix, wildcard, regular-expression, or callback exclusions |
| `includePaths` | `[]` | Optional route allowlist |
| `observeDom` | `true` | Refresh active preferences for dynamic content |
| `position` | `"bottom-right"` | `"bottom-right"` or `"bottom-left"` |
| `offsetX` / `offsetY` | `"25px"` | Trigger offsets, including CSS units |
| `zIndex` | `999999` | Widget stacking level |
| `language` | `"auto"` | Supported language code or browser detection |
| `nonce` | `""` | CSP nonce copied to widget-owned style elements |

For a strict Content Security Policy, pass the page's per-response nonce through the global configuration or `data-nonce`. A nonce is not a substitute for an appropriate `script-src` and `style-src` policy.

## Runtime API

The bundle exposes `window.AccessibilityPreferenceWidget`:

```js
const widget = window.AccessibilityPreferenceWidget

widget.open()
widget.close()
widget.refresh()
widget.configure({ position: "bottom-left", language: "tr" })
widget.destroy()
widget.mount()
widget.reset()
```

Additional methods are `disconnect()`, `getConfig()`, `getHost()`, and `isMounted()`. `destroy()` removes page effects while preserving stored preferences by default; use `destroy({ preservePreferences: false })` to clear them.

Lifecycle events are dispatched on `document`:

- `accessibility-preference-widget:mounted`
- `accessibility-preference-widget:destroyed`
- `accessibility-preference-widget:refreshed`
- `accessibility-preference-widget:routechange`

See [docs/integration.md](docs/integration.md) for static-site, SPA, Next.js, route-exclusion, and CSP examples.

## Demo

Build the project, serve the repository root with any local static server, and open `demo/index.html`.

```bash
npx --yes http-server .
```

The demo uses the local readable bundle. The `npx` command may download a third-party development tool; any equivalent local HTTP server can be used.

## Architecture and scope

The Shadow DOM isolates the control interface. Preference modules intentionally add widget-owned classes, inline styles, style elements, or helper elements to the host document so that they can affect page content. The runtime tracks those changes, refreshes dynamic content, and restores prior inline values during reset or destroy.

Read aloud uses the browser Web Speech API and system/browser voices. Availability and behavior vary by platform. The widget makes no conformance guarantee and is not an automated remediation layer, accessibility audit, screen reader, or certification tool.

See [docs/accessibility.md](docs/accessibility.md) for verified behavior, remaining limitations, and the manual release test matrix.

## Browser support

The runtime targets modern browsers with Shadow DOM, `inert`, `localStorage`, MutationObserver, and standard DOM APIs. Read aloud additionally requires the Web Speech API. Storage failures fall back to in-memory preferences for the current page session.

A complete browser and assistive-technology compatibility matrix has not yet been performed.

## Contributing, security, and licenses

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SECURITY.md](SECURITY.md)
- [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)
- [CHANGELOG.md](CHANGELOG.md)

The project is licensed under the [MIT License](LICENSE), subject to confirmation that all original contributors and applicable rights holders authorize the public release. Third-party components remain under their respective licenses.
