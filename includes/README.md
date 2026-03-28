# Shared layout (header & footer)

- **`header.html`** — Promo strip, main nav, Services mega-menu overlay (same behavior as the home page, with cross-page links).
- **`footer.html`** — Full footer from the home page; “Navigate” links point to `index.html` sections.
- **`site-layout.css`** — Styles for the header, overlay, and footer (extracted from `index.html`). Inner pages should still keep their own `<style>` block for page content.
- **`load-includes.js`** — Injects `header.html` / `footer.html` into placeholders and initializes the mega menu + header scroll.

## Inner pages (not `index.html`)

1. In `<head>`, after the favicon:

   ```html
   <link rel="stylesheet" href="includes/site-layout.css" />
   ```

2. Right after `<body>`:

   ```html
   <div id="layout-header"></div>
   ```

3. After `</main>` (and before your page scripts):

   ```html
   <div id="layout-footer"></div>
   <script src="includes/load-includes.js"></script>
   ```

4. **Important:** `fetch()` does not work reliably with `file://`. Open the site with a local server (VS Code **Live Server**, `npx serve`, etc.).

## `index.html`

Leave **`index.html` unchanged** — it keeps its inline header and footer. When you are ready to deduplicate the home page too, you can switch it to the same pattern.

## Regenerating `site-layout.css`

From the `includes` folder:

```bash
node extract-layout-css.js
```
