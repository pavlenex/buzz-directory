import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("exports the buzzdir catalog for static hosting", async () => {
  const html = await read("out/index.html");

  assert.match(html, /<title>buzzdir — publicly shared Buzz communities<\/title>/i);
  assert.match(html, /Find your/);
  assert.match(html, /hive\./);
  assert.match(html, /Explore all hives/);
  // The hero's primary action is listing a hive; exploring is secondary.
  assert.match(
    html,
    /class="button button-dark button-big"[^>]*>List your hive/,
  );
  assert.match(
    html,
    /class="button button-ghost button-big" href="#directory">Explore all hives/,
  );
  assert.match(html, /Pick a frequency\./);
  assert.match(html, /List your hive/);
  assert.match(html, /bento-comb/);
  assert.match(html, /og\.png/);
  for (const name of ["Cashu", "monero", "bitcoiners", "vibecoding"]) {
    assert.match(html, new RegExp(name));
  }

  // The swarm is a client-side canvas: no bee markup, and no <canvas> either,
  // because the engine creates it after mount.
  assert.match(html, /<div class="bee-drift-field" aria-hidden="true"><\/div>/);
  assert.doesNotMatch(html, /drift-bee/);
  assert.doesNotMatch(html, /<canvas/i);

  // Deep-link contract: every card opens Buzz, no raw relay ever becomes an
  // href, and each link carries an encoded wss:// relay plus a name.
  assert.match(html, /card-access-public[^>]*>Public/);
  assert.match(html, /card-access-invite[^>]*>Invite/);
  assert.match(
    html,
    /<a class="community-card" href="buzz:\/\/add-community\?relay=wss%3A%2F%2Fbuzz\.cashu\.space&amp;name=Cashu" aria-label="Open Cashu in Buzz" title="Open Cashu in Buzz"/,
  );
  assert.doesNotMatch(
    html,
    /href="(?:wss|https):\/\/(?:[\w-]+\.)?communities\.buzz\.xyz"/,
  );
  const deepLinks = [
    ...html.matchAll(
      /href="buzz:\/\/add-community\?relay=(wss%3A%2F%2F[^&"]+)&amp;name=([^"]+)"/g,
    ),
  ].map(([, relay, name]) => ({
    relay: decodeURIComponent(relay),
    name: decodeURIComponent(name),
  }));
  // 34 community cards + 4 featured cells + 2 buzzdir CTAs (manifesto + footer).
  assert.equal(deepLinks.length, 40);
  // 34 catalog relays + 1 buzzdir relay.
  assert.equal(new Set(deepLinks.map(({ relay }) => relay)).size, 35);
  assert.ok(
    deepLinks.every(
      ({ relay, name }) => relay.startsWith("wss://") && name.length > 0,
    ),
  );

  // Deliberately excluded test instances must not creep back into the catalog.
  assert.doesNotMatch(html, /sonarprivacy|SV2-Fleet|building-buzz-inside|test2/);
  assert.doesNotMatch(html, /class="notice"/);

  // No header, no logo lockup, no hero eyebrow.
  assert.doesNotMatch(html, /<nav\b/);
  assert.doesNotMatch(html, /nav-shell|nav-links|nav-cta|Primary navigation/);
  assert.doesNotMatch(html, /class="brand"|brand-mark/);
  // The project is buzzdir; the old "Buzz Hives" name must not come back.
  assert.doesNotMatch(html, /Buzz Hives|BUZZ HIVES/i);
  assert.doesNotMatch(html, /hero-eyebrow|Community-run/);

  // creatormagic holds the second featured slot; monero stays a plain card.
  assert.match(html, /feature-cell-2[^>]*>[\s\S]{0,200}creatormagic/);
  assert.doesNotMatch(html, /feature-cell-\d[^>]*>[\s\S]{0,200}>monero</);
  assert.match(html, /class="card-title">monero</);

  // Open-source positioning and the affiliation disclaimer.
  assert.match(html, /A directory of publicly shared/);
  assert.match(html, /why everyone is buzzing about Buzz/);
  // "Buzz" in the deck links out to buzz.xyz.
  assert.match(
    html,
    /href="https:\/\/buzz\.xyz"[^>]*target="_blank"[^>]*rel="noreferrer noopener"/,
  );
  assert.match(html, /BUILT IN THE OPEN/);
  assert.match(html, /buzzdir/);
  assert.match(html, /footer-disclaimer/);
  assert.match(
    html,
    /buzzdir is an independent, open-source, community-run directory/,
  );
  assert.match(
    html,
    /Not\s+affiliated with, endorsed by, or operated by buzz\.xyz/,
  );
  assert.doesNotMatch(html, /operated by Buzz or buzz\.xyz/);
  assert.match(html, /href="https:\/\/github\.com\/[^"]+"[^>]*target="_blank"/);

  // Static export cannot send response headers, so the policy rides in a meta
  // tag; check it survived the build.
  assert.match(html, /http-equiv="Content-Security-Policy"/i);
  assert.match(html, /object-src 'none'/);
});

test("keeps the swarm off the main thread and out of the DOM", async () => {
  const [drift, field, sprites, styles] = await Promise.all([
    read("app/BeeDrift.tsx"),
    read("app/beeField.ts"),
    read("app/beeSprites.ts"),
    read("app/globals.css"),
  ]);

  // BeeDrift is a thin host: one div, engine lazy-loaded on idle.
  assert.match(drift, /bee-drift-field/);
  assert.match(drift, /import\("\.\/beeField"\)/);
  assert.match(drift, /requestIdleCallback/);
  assert.doesNotMatch(drift, /requestAnimationFrame|querySelectorAll|<svg/);

  // The engine owns simulation and drawing.
  assert.match(field, /createBeeField/);
  assert.match(field, /getContext\("2d"/);
  assert.match(field, /requestAnimationFrame/);
  assert.match(field, /visibilitychange/);
  assert.match(field, /ResizeObserver/);
  assert.match(field, /prefers-reduced-motion: reduce/);
  assert.match(field, /setTransform/);
  assert.match(field, /drawImage/);

  // Hold-station-then-dart. Constant-speed motion reads as a hornet when fast
  // and an ant when slow; the duty cycle is what makes it a bee.
  assert.match(field, /const HOVERING = 0/);
  assert.match(field, /const DARTING = 1/);
  assert.match(field, /const LANDED = 3/);
  assert.match(field, /function beginHover/);
  assert.match(field, /function beginDart/);
  assert.match(field, /stationX/);
  assert.match(field, /bobAmount/);
  assert.match(field, /shortestTurn/);

  // Per-frame cost guards. drop-shadow/shadowBlur are what made the old DOM
  // swarm slow; the canvas.width guard stops a 33MB realloc per keystroke.
  assert.doesNotMatch(field, /shadowBlur|ctx\.filter|drop-shadow/);
  assert.doesNotMatch(field, /addEventListener\(["']pointer|clientX|clientY/);
  assert.match(field, /if \(canvas\.width !== pixelWidth\)/);
  assert.match(field, /if \(bee\.y < simTop \|\| bee\.y > simBottom\) continue/);

  // The atlas is baked once, never per frame.
  assert.match(sprites, /bakeBeeAtlas/);
  assert.match(sprites, /export const CELL/);
  assert.match(sprites, /FOLDED_FRAME/);
  assert.match(sprites, /beeTints/);
  assert.doesNotMatch(sprites, /requestAnimationFrame/);

  // No per-bee DOM rules left in the stylesheet.
  assert.match(styles, /\.bee-drift-field[\s\S]*pointer-events: none/);
  assert.match(styles, /\.bee-drift-canvas/);
  assert.doesNotMatch(styles, /\.drift-bee|\.bee-wing|\.bee-stripe|\.bee-body/);
});

test("keeps the page cheap to ship", async () => {
  const [styles, page, packageJson] = await Promise.all([
    read("app/globals.css"),
    read("app/page.tsx"),
    read("package.json"),
  ]);

  // No CSS framework: the markup uses zero utility classes, so importing one
  // only ever shipped its preflight.
  assert.doesNotMatch(styles, /@import ["']tailwindcss["']/);
  assert.doesNotMatch(page, /className="[^"]*\b(?:flex|grid-cols-\d|p-\d|text-(?:xs|sm|lg|xl))\b/);

  // One gutter and one vertical rhythm for every section.
  assert.match(styles, /--gutter: clamp\(/);
  assert.match(styles, /--section-y: clamp\(/);
  assert.match(styles, /padding: var\(--section-y\) var\(--gutter\)/);

  // Base rules that a careless block delete has removed before.
  assert.match(styles, /^\.hero-copy \{/m);
  assert.match(styles, /^\.section-index \{/m);

  // Two thirds of the cards are offscreen at first paint.
  assert.match(styles, /content-visibility: auto/);
  assert.doesNotMatch(styles, /text-rendering: optimizeLegibility/);

  assert.match(styles, /@media \(hover: none\)/);
  assert.match(styles, /@media \(max-width: 980px\)/);
  assert.match(styles, /@media \(max-width: 420px\)/);

  // Runtime deps stay at exactly next + react + react-dom.
  const { dependencies } = JSON.parse(packageJson);
  assert.deepEqual(Object.keys(dependencies).sort(), [
    "next",
    "react",
    "react-dom",
  ]);
});

test("catalog and deployment contract", async () => {
  const [page, communityData, layout, nextConfig, workflow, readme] =
    await Promise.all([
      read("app/page.tsx"),
      read("app/communities.ts"),
      read("app/layout.tsx"),
      read("next.config.ts"),
      read(".github/workflows/deploy-pages.yml"),
      read("README.md"),
    ]);

  assert.match(page, /from "\.\/communities"/);
  assert.match(page, /Search communities/);
  assert.match(page, /<BeeDrift \/>/);
  assert.match(page, /role="status"/);
  assert.match(page, /id="contribute"/);
  assert.match(page, /rel="noreferrer noopener"/);
  assert.match(page, /encodeURIComponent\(community\.relay\)/);
  assert.match(page, /encodeURIComponent\(community\.name\)/);
  // The wss:// template-literal type is erased at runtime.
  assert.match(page, /community\.relay\.startsWith\("wss:\/\/"\)/);

  // Placeholders must never reach production: an unclaimed GitHub namespace is
  // a takeover waiting to happen, and a fake relay is a dead call to action.
  assert.doesNotMatch(
    page,
    /REPLACE-ME/,
    "Set GITHUB_URL and BUZZDIR_RELAY in app/page.tsx before deploying — " +
      "github.com/REPLACE-ME is an unclaimed namespace anyone could register.",
  );
  assert.match(
    page,
    /const GITHUB_URL = "https:\/\/github\.com\/pavlenex\/buzz-directory"/,
  );
  assert.match(
    page,
    /const BUZZDIR_RELAY = "wss:\/\/flint\.communities\.buzz\.xyz"/,
  );

  const relays = [...communityData.matchAll(/relay: "(wss:\/\/[^"]+)"/g)].map(
    ([, relay]) => relay,
  );
  assert.equal(relays.length, 34);
  assert.equal(new Set(relays).size, 34);
  assert.match(communityData, /name: "meshllm"/);
  assert.match(communityData, /name: "presidiobitcoin"/);
  // Access legend: /invite/ share → public; bare wss → invite.
  assert.match(
    communityData,
    /name: "Cashu"[\s\S]{0,200}access: "invite"/,
  );
  assert.match(
    communityData,
    /name: "bitcoiners"[\s\S]{0,200}access: "public"/,
  );
  assert.match(
    communityData,
    /name: "meshllm"[\s\S]{0,200}access: "invite"/,
  );
  assert.match(
    communityData,
    /name: "presidiobitcoin"[\s\S]{0,200}access: "invite"/,
  );
  // Directory grid sorts A–Z; featured hero order stays independent.
  assert.match(page, /localeCompare/);
  assert.ok(relays.every((relay) => relay.startsWith("wss://")));
  assert.equal([...communityData.matchAll(/name: "creatormagic"/g)].length, 1);
  assert.match(
    communityData,
    /name: "creatormagic"[\s\S]{0,240}featured: \{ icon: "✺"/,
  );
  assert.doesNotMatch(communityData, /name: "monero"[\s\S]{0,200}featured:/);

  assert.match(layout, /buzzdir/);
  assert.match(layout, /\.\/og\.png/);
  assert.match(layout, /width: 1200/);
  assert.match(layout, /Content-Security-Policy/);
  assert.match(layout, /referrer: "strict-origin-when-cross-origin"/);

  assert.match(nextConfig, /output: "export"/);
  assert.match(nextConfig, /basePath: pagesBasePath/);
  assert.match(nextConfig, /hasConfiguredBasePath/);

  for (const action of [
    "actions/checkout@v7",
    "actions/setup-node@v7",
    "actions/configure-pages@v6",
    "actions/upload-pages-artifact@v5",
    "actions/deploy-pages@v5",
  ]) {
    assert.match(workflow, new RegExp(action.replace("/", "\\/")));
  }
  assert.match(workflow, /path: out/);
  assert.match(workflow, /steps\.pages\.outputs\.base_path/);
  assert.doesNotMatch(workflow, /vars\.PAGES_BASE_PATH/);
  assert.doesNotMatch(workflow, /pull_request_target/);

  assert.match(readme, /One-click `buzz:\/\/add-community` links/);
  assert.match(readme, /Add Community dialog/);
});
