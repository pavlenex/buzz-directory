# Buzz Hives

Buzz Hives is a high-energy directory for the public communities building,
researching, and collaborating on Buzz.

## Experience

- "Find your hive" hero with a pointer-reactive GLSL bee swarm
- Minimal outlined featured-community combs
- Current public community catalog sourced from the Buzz relay
- Search and category filters
- Responsive variable-size "bento comb" directory
- Community detail drawer with copyable channel IDs
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
