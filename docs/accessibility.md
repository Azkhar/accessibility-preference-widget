# Accessibility scope and known limitations

## Positioning

This project is a WCAG 2.2-focused accessibility preference widget.

> This widget does not by itself make a website WCAG-conformant. Site-wide design, content, code, and assistive-technology testing are still required.

The widget changes presentation and exposes user controls. It does not audit, repair, or certify the host site's markup, content, interactions, media alternatives, forms, or complete user processes.

## Implemented dialog behavior

- The trigger starts with `aria-expanded="false"` and references the dialog with `aria-controls`.
- The closed dialog has both `hidden` and `inert`, keeping its controls out of the tab sequence.
- Opening moves focus to the close button.
- Tab and Shift+Tab are contained within the open modal.
- Escape closes the modal and restores focus.
- Other body children are temporarily made inert while the modal is open, and their previous inert state is restored on close.
- The former Ctrl+U shortcut is not present, so the browser shortcut is not overridden.
- A `prefers-reduced-motion: reduce` rule removes widget animations and minimizes transitions.

## Preference behavior

The interface is hosted in an open Shadow Root. Modules intentionally modify the host document with widget-owned classes, inline styles, `<style>` elements, and helper overlays. Preferences are stored with `a11y-*` `localStorage` keys.

Reset attempts to remove all widget-owned effects and storage values except the interface language. Host applications should still verify that their own dynamic DOM and styles are fully restored.

## Excluded capabilities

The public core intentionally excludes:

- license verification and customer-specific code
- proprietary or private API calls
- sign-language video services
- simulated keyboard-navigation mode
- a screen-reader replacement
- layout-control mode

These capabilities must not be advertised as active features.

## Known limitations

- No formal WCAG conformance evaluation has been performed.
- No complete browser and assistive-technology matrix has been completed.
- Image hiding applies to images present when the preference runs; newly inserted images may require reapplying the preference.
- Some host-page styles use broad selectors and can conflict with site-specific CSS.
- The audio-description control uses browser speech synthesis. Voice availability and behavior vary by browser and operating system.
- Preset profiles combine preferences and are not medical recommendations.
- Shadow DOM isolates the control interface, but the intended page-level transformations are not isolated.

## Manual release test matrix

Before a public release:

1. Test current Chrome, Edge, Firefox, and Safari where available.
2. Test keyboard-only opening, complete focus traversal, Escape, close, and focus restoration.
3. Test at 200% and 400% zoom and in narrow responsive layouts.
4. Test `prefers-reduced-motion: reduce`.
5. Test at least NVDA/Firefox, NVDA/Chrome or Edge, VoiceOver/Safari, and one mobile screen reader.
6. Confirm trigger name, dialog announcement, button pressed states, language changes, and reset feedback.
7. Confirm each preference can be enabled, disabled, persisted, and reset without corrupting host-page styles.
8. Test dynamic content, single-page navigation, forms, editors, media, and embedded content.
9. Run automated accessibility tooling as a supplement, not a substitute for manual testing.
10. Repeat the host site's own WCAG evaluation after integration.
