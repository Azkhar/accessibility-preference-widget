# Contributing

Thank you for helping improve the Accessibility Preference Widget.

## Before you start

- Open an issue before making a broad behavioral or architectural change.
- Keep customer code, private endpoints, credentials, license checks, and proprietary adapters out of the public core.
- Do not describe the project or a host site as WCAG-conformant solely because it uses this widget.
- Preserve host-page content and styles when a preference is disabled or reset.

## Local setup

```bash
npm ci
npm run check
npm test
```

`npm test` creates fresh development and production bundles before running the test suite. Run `npm run validate` when network access is available to include the dependency audit.

## Pull request checklist

- Keep the change focused.
- Add or update tests for behavior and public-release safeguards.
- Test keyboard operation, focus order, Escape behavior, zoom, and reduced-motion behavior.
- Check at least one screen reader/browser combination for user-interface changes.
- Confirm that disabling and resetting a feature restores host-page state.
- Run a secret scan and `npm audit`.
- Confirm the bundle still works with `localStorage` unavailable and, when relevant, with a strict CSP nonce.
- Update README, accessibility documentation, and third-party notices when applicable.
- Do not commit generated secrets, customer data, `.env` files, or private URLs.

## Style

- Use English for code, identifiers, and contributor-facing documentation.
- Prefer browser APIs and small modules over framework dependencies.
- Keep the module load order explicit in `scripts/build.js`.
- Avoid unnecessary console output in distributed code.

## Reporting security issues

Follow [SECURITY.md](SECURITY.md). Never include a real credential or customer record in a public issue.
