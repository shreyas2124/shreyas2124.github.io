# SomehowConvert — GitHub Pages SEO Structure

## Folder structure

- `index.html` — homepage
- `assets/style.css` — shared styling
- `assets/tools.js` — shared browser-side conversion engine
- `png-to-jpg/index.html` — individual SEO page
- `jpg-to-png/index.html`
- `webp-to-png/index.html`
- `image-to-pdf/index.html`
- `txt-to-pdf/index.html`
- `csv-to-json/index.html`
- `json-to-csv/index.html`
- `html-to-pdf/index.html`
- `image-to-webp/index.html`
- `image-to-png/index.html`
- `image-to-jpg/index.html`
- `compress-image/index.html`
- `resize-image/index.html`
- `rotate-flip-image/index.html`
- `sitemap.xml`
- `robots.txt`
- `404.html`
- `privacy.html`

## Before publishing

Replace this placeholder in `sitemap.xml` and `robots.txt`:

`https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPOSITORY`

with the real GitHub Pages URL.

For example:

`https://example.github.io/somehowconvert`

If you later attach a custom domain, update the sitemap URLs to the custom domain.

## GitHub Pages

1. Create a GitHub repository.
2. Upload the entire contents of this folder, preserving the folder structure.
3. Open repository Settings → Pages.
4. Select the branch/folder containing these files.
5. Wait for GitHub Pages to publish.
6. Open the generated Pages URL.
7. Add the final site URL to Google Search Console.
8. Submit `/sitemap.xml`.

## AdSense

This structure keeps each tool as a real HTML page, so you can place AdSense code on the pages after your site is ready and approved. Do not add fake/click-inducing ad UI or traffic schemes. Google reviews the whole site and expects useful, original content and clear navigation.

## Important

The converters in this package are browser-side. There is no server upload endpoint and no artificial MB/GB limit in the JavaScript. Very large files can still be limited by the user's browser/device memory.

The visitor counter from the previous experiment is intentionally not included here because a true shared IP-based counter requires a backend/database. A localStorage counter is not a real site-wide visitor count.
