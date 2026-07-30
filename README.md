# Buzz Hives

Buzz Hives is a high-energy directory for the public communities building,
researching, and collaborating on Buzz.

## Experience

- "Find your hive" hero with free-flying SVG bees
- Minimal outlined featured-community combs
- Public community catalog from the X crawl of advertised Buzz instances
- Search and category filters (Builders, Bitcoin, Privacy, Culture, GTM, Labs)
- Responsive "bento comb" directory with Public / Invite access labels
- One-click relay copying with persistent Buzz paste instructions and a manual
  fallback when browser clipboard access is blocked
- "List your hive" call to action prepared for a future submission flow

## Local development

Requires Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Run the full production check with:

```bash
npm test
```

The production build is a static export in `out/`.

## Update the directory

All community metadata lives in `app/communities.ts`. Add or edit one object
there; the featured area, search, filters, and directory cards all use that
single catalog. The typed `relay` field only accepts `wss://` targets.

Selecting a card copies that relay. The join panel tells the user to open Buzz,
click **+ Add community** in the left sidebar, and paste it into **Relay URL**.

## GitHub Pages

The included workflow at `.github/workflows/deploy-pages.yml` builds and
publishes the site whenever `main` is updated:

1. Push this repository to GitHub.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main`, or run **Deploy Buzz Hives to GitHub Pages** manually from
   the Actions tab.

Project sites automatically use `/<repository-name>` as the base path.
User or organization sites named `<owner>.github.io` use `/`. For a custom
domain, set the Actions variable `PAGES_BASE_PATH` to `/` and rebuild.
