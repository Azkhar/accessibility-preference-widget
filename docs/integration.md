# Integration guide

## Self-hosted static site

Copy `dist/widget.min.js` into the host application's public assets and load it once:

```html
<script src="/vendor/accessibility-preference-widget/widget.min.js" defer></script>
```

Pin and review the copied artifact when upgrading. If Subresource Integrity is used, take the matching SHA-384 value from `dist/integrity.json` and add `crossorigin="anonymous"` when the script is served from another origin.

## Configuration before load

```html
<script>
  window.AccessibilityPreferenceWidgetConfig = {
    position: "bottom-right",
    language: "auto",
    excludePaths: ["/checkout", "/embed/*"]
  };
</script>
<script src="/vendor/accessibility-preference-widget/widget.min.js" defer></script>
```

Strings match an exact path and its descendants. A string ending in `*` matches by prefix. JavaScript configuration may also use regular expressions or callback functions.

## Next.js App Router

Place the built asset in `public/vendor/accessibility-preference-widget/widget.min.js`, then load it once from the root layout:

```tsx
import Script from "next/script"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script id="accessibility-preference-widget-config" strategy="beforeInteractive">
          {`window.AccessibilityPreferenceWidgetConfig = {
            excludePaths: ["/checkout"]
          }`}
        </Script>
        <Script
          id="accessibility-preference-widget"
          src="/vendor/accessibility-preference-widget/widget.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
```

If the application already has a client-side script loader, use that loader instead of adding the bundle to individual pages. The runtime observes route changes and DOM updates. An application can request an immediate route check after custom navigation:

```js
document.dispatchEvent(
  new Event("accessibility-preference-widget:navigate")
)
```

## Manual mounting

```html
<script>
  window.AccessibilityPreferenceWidgetConfig = { autoMount: false };
</script>
<script src="/vendor/accessibility-preference-widget/widget.min.js" defer></script>
<script>
  window.addEventListener("load", () => {
    window.AccessibilityPreferenceWidget.mount({
      position: "bottom-left"
    });
  });
</script>
```

Call `destroy()` before a host application tears down page-level integrations. Call `disconnect()` only when the script runtime itself will no longer be used; it also stops route observers and event listeners.

## Content Security Policy

Generate a fresh nonce for each response, apply it to the script tags, and pass the same value to the widget:

```html
<script nonce="RESPONSE_NONCE">
  window.AccessibilityPreferenceWidgetConfig = {
    nonce: "RESPONSE_NONCE"
  };
</script>
<script
  nonce="RESPONSE_NONCE"
  src="/vendor/accessibility-preference-widget/widget.min.js"
  defer
></script>
```

`RESPONSE_NONCE` is documentation-only. Never hard-code a production nonce. The widget copies the configured nonce to its Shadow DOM stylesheet and to document-level styles created by active preferences.

## Host-application checks

After integration:

1. Confirm there is exactly one widget host.
2. Test excluded routes and client-side navigation.
3. Test keyboard opening, focus containment, Escape, close, and focus restoration.
4. Verify each active preference against dynamic components, dialogs, editors, media, and embedded content.
5. Verify reset and destroy restore host styles and interactions.
6. Test the host application's own reduced-motion behavior and stacking contexts.
7. Run the host site's complete accessibility evaluation.

This widget does not by itself make a website WCAG-conformant. Site-wide design, content, code, and assistive-technology testing are still required.
