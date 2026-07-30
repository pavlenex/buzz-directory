# buzzdir

buzzdir (buzzdir.xyz) is an open-source directory of publicly shared Buzz communities.
It is community-run and **not affiliated with, endorsed by, or operated by Buzz
or buzz.xyz**. Every community name and relay listed here was shared publicly
by its own admins.

Want to improve it? Open the public `buzzdir` invite in Buzz, point your agents
at the repo, and send a patch.

## Experience

- "Find your hive" hero with a canvas bee swarm
- Minimal outlined featured-community combs
- Catalog of admin-shared Buzz communities from the X crawl
- Search and category filters (Builders, Bitcoin, Privacy, Culture, GTM, Labs)
- Responsive "bento comb" directory with Public / Invite labels
- Safe join routes: **Public** hives open an HTTPS `/invite/` page or a verified
  custom public URL; **Invite** hives open
  `buzz://add-community` with the bare `wss://` relay prefilled
- Three-field "List your hive" popup accepts `wss://`, `http://`, `https://`,
  and `/invite/` links, with a prefilled GitHub issue and Buzz-community route

## The bee swarm

The swarm lives in three files:

- `app/BeeDrift.tsx`: a host `<div>`. It renders nothing on the server and
  lazy-loads the engine on idle, so the swarm costs the first paint nothing.
- `app/beeSprites.ts`: bakes an offscreen sprite atlas once at mount. Body,
  ink outline, glow and motion-blurred wings are rasterised there rather than
  redrawn per frame. Four wing frames per tint: three flight, one folded.
- `app/beeField.ts`: one `<canvas>`, one `requestAnimationFrame` loop. Bees
  live in document coordinates and are drawn through a fixed viewport-sized
  canvas, so only the on-screen third of the swarm costs anything to draw.

Two things matter if you change it.

**The duty cycle is the bee.** A real bee holds a point in the air with almost
no net translation, with wings blurring, body yawing, and a small vertical bob,
then snaps to a new point in a burst of a few hundred milliseconds. Motion at
any *constant* speed is wrong in both directions: fast reads as a hornet, slow
reads as an ant crawling. Measured, the swarm sits around 84% hovering / 13%
darting, median speed ~8 px/s with a p99 near 290. If you touch the springs in
`step`, check that split still holds. Hover is a stiff, nearly critically
damped spring that parks the bee, dart is a loose underdamped one that throws
it. Smooth continuous heading interpolation, meanwhile, is how *birds* fly, and
it is what made the original DOM version read as birds.

**Nothing per-bee may live in the DOM.** The version before this one ran 64 SVG
elements with two `drop-shadow` filters and two wing animations each, which is
roughly 128 non-composited repaints a frame.

The swarm thins itself if frames start slipping (see the adaptive valve in
`tick`), halves its budget on narrow screens and low-core devices, pauses on
`visibilitychange`, and renders a single still frame under
`prefers-reduced-motion`.

## Layout conventions

`--gutter` and `--section-y` in `app/globals.css` set the horizontal inset and
vertical rhythm for every section. Use them instead of a per-section `clamp()`
so the page edges line up. Breakpoints run wide to narrow at 1180 / 980 / 760 /
620 / 420, and each one only changes what actually breaks at that width.

There is no CSS framework. Tailwind was imported once but the markup used zero
utility classes, so all it ever shipped was preflight; the import, PostCSS
plugin, and packages have been removed, and the handful of resets the stylesheet
actually depends on now sit at the top of `globals.css`. The CSS-only version
was verified pixel-identical at 1440 and 390 across the full page. If you add
utility classes you are adding a framework back. Do it deliberately.

## Security notes

`output: "export"` means Next's `headers()` never runs, and GitHub Pages cannot
set response headers at all, so the Content-Security-Policy lives in a meta tag
in `app/layout.tsx`. `script-src`/`style-src` have to allow inline because Next
inlines its bootstrap; what the policy actually buys is a hard block on
third-party origins plus the `base-uri` / `object-src` / `form-action` vectors.
`frame-ancestors` is ignored in meta form. Closing clickjacking properly would
mean fronting Pages with something that can set real headers.

The site loads zero third-party resources: no CDN, no analytics, no webfonts,
no cookies, no storage. Keep it that way and the CSP stays honest.

`app/page.tsx` ships the canonical GitHub URL as a constant. The buzzdir
community link comes from the same catalog as every other hive. The test suite
rejects placeholder values so an unclaimed namespace cannot reach production.

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
single catalog. The typed `relay` field only accepts `wss://` targets. Entries
with a publicly shared invite also set `inviteUrl` to the full
`https://…/invite/…` share from X. Cards open that HTTPS page because it handles
required join-policy acceptance before handing the invite to Buzz. A publicly
known relay is not necessarily open to new members. A confirmed custom public
join URL can be kept in `publicUrl`.

Selecting a card:

- **Public** (`inviteUrl` set): original HTTPS invite page (policy-aware join)
- **Invite** (bare wss only): `buzz://add-community?relay=…&name=…` (Add
  Community dialog)

Invite tokens expire; refresh `inviteUrl` from the newest public share when
links go stale.

## GitHub Pages

The included workflow at `.github/workflows/deploy-pages.yml` builds and
publishes the site whenever `main` is updated:

1. Push this repository to GitHub.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main`, or run **Deploy buzzdir to GitHub Pages** manually from
   the Actions tab.

The workflow reads the site URL and base path from `actions/configure-pages`,
so both the default `pavlenex.github.io/buzz-directory/` URL and the
`buzzdir.xyz` custom domain build with the correct asset paths.

The custom domain is configured in **Settings → Pages** (or through GitHub's
Pages API), not with a `CNAME` file: custom Actions workflows ignore that file.
After the domain is configured, add the DNS records for `buzzdir.xyz` and
enable **Enforce HTTPS** when GitHub makes the option available.

## License

This project is available under the [MIT License](LICENSE).
