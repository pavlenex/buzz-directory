import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("exports the buzzdir catalog for static hosting", async () => {
  const html = await read("out/index.html");

  assert.match(html, /<title>buzzdir: publicly shared Buzz communities<\/title>/i);
  assert.match(html, /Find your/);
  assert.match(html, /hive\./);
  assert.match(html, /Explore all hives/);
  // The hero's primary action is listing a hive; exploring is secondary.
  assert.match(
    html,
    /<button(?=[^>]*class="button button-dark button-big")[^>]*>List your hive/,
  );
  assert.match(
    html,
    /class="button button-ghost button-big" href="#directory">Explore all hives/,
  );
  assert.match(html, /Pick a frequency\./);
  assert.match(html, /List your hive/);
  assert.match(html, /bento-comb/);
  assert.match(html, /og\.png/);
  assert.match(html, /class="card-category">Builders/);
  assert.match(html, /aria-live="polite" aria-atomic="true"/);
  assert.match(html, /<kbd aria-hidden="true">TYPE<\/kbd>/);
  assert.match(html, /<dialog class="listing-modal"/);
  assert.match(html, /<form class="listing-form"/);
  assert.match(
    html,
    /<input(?=[^>]*name="community-name")(?=[^>]*required)[^>]*>/,
  );
  assert.match(
    html,
    /<input(?=[^>]*name="community-url")(?=[^>]*required)[^>]*>/,
  );
  assert.match(
    html,
    /<textarea(?=[^>]*name="community-description")(?=[^>]*required)[^>]*>/,
  );
  assert.match(html, /Three required fields/);
  assert.match(html, /List on GitHub/);
  assert.match(html, /Build on Buzz/);
  assert.match(html, /Open prefilled GitHub issue/);
  for (const name of [
    "Cashu",
    "LDK",
    "monero",
    "bitcoiners",
    "vibecoding",
    "Virtual Oranges",
    "Los Angeles Buzzers",
    "ProductClank",
  ]) {
    assert.match(html, new RegExp(name));
  }

  // The swarm is a client-side canvas: no bee markup, and no <canvas> either,
  // because the engine creates it after mount.
  assert.match(html, /<div class="bee-drift-field" aria-hidden="true"><\/div>/);
  assert.doesNotMatch(html, /drift-bee/);
  assert.doesNotMatch(html, /<canvas/i);

  // Deep-link contract:
  // - Invite cards use buzz://add-community with the relay and name
  // - Public cards use the original HTTPS invite page
  // - No raw wss:// or bare host hrefs
  assert.match(html, /card-access-public[^>]*>Public/);
  assert.match(html, /card-access-invite[^>]*>Invite/);
  const cards = [
    ...html.matchAll(
      /<a class="community-card" href="([^"]+)"[\s\S]*?<span class="card-access card-access-(public|invite)">/g,
    ),
  ];
  assert.equal(cards.length, 39);
  for (const [, href, access] of cards) {
    if (access === "public") {
      assert.match(href, /^https:\/\//);
    } else {
      assert.match(href, /^buzz:\/\/add-community\?/);
    }
  }
  assert.match(
    html,
    /<a class="community-card" href="https:\/\/buzz\.cashu\.space" aria-label="Open Cashu" title="Open Cashu"/,
  );
  // Public cards visit the invite page so policy acceptance can mint the
  // receipt required by relays that enforce a join policy.
  assert.ok(
    html.includes(
      'href="https://bitcoiners.communities.buzz.xyz/invite/',
    ),
  );
  assert.ok(
    html.includes(
      'href="https://creatormagic.communities.buzz.xyz/invite/',
    ),
  );
  assert.doesNotMatch(html, /href="buzz:\/\/join\?/);
  assert.doesNotMatch(html, /href="wss:\/\//);
  assert.doesNotMatch(
    html,
    /href="https:\/\/(?:[\w-]+\.)?communities\.buzz\.xyz\/?"/,
  );

  const addLinks = [
    ...html.matchAll(
      /href="buzz:\/\/add-community\?relay=(wss%3A%2F%2F[^&"]+)&amp;name=([^"]+)"/g,
    ),
  ].map(([, relay, name]) => ({
    relay: decodeURIComponent(relay),
    name: decodeURIComponent(name),
  }));
  const inviteLinks = [
    ...html.matchAll(
      /href="(https:\/\/[\w.-]+\/invite\/[^"]+)"/g,
    ),
  ].map(([, url]) => url);

  assert.ok(addLinks.length >= 19);
  assert.ok(inviteLinks.length >= 16);
  assert.equal(new Set(inviteLinks).size, 15);
  assert.ok(
    addLinks.every(
      ({ relay, name }) => relay.startsWith("wss://") && name.length > 0,
    ),
  );
  // Relay-only entries must never be wired as a join without an invite.
  assert.ok(!addLinks.some(({ name }) => name === "bitcoiners"));
  assert.ok(!addLinks.some(({ name }) => name === "Cashu"));
  assert.ok(addLinks.some(({ name }) => name === "monero"));
  assert.ok(
    addLinks.some(
      ({ name, relay }) =>
        name === "LDK" &&
        relay === "wss://lightningdevkit.communities.buzz.xyz",
    ),
  );
  assert.ok(
    addLinks.some(
      ({ name, relay }) =>
        name === "Los Angeles Buzzers" &&
        relay === "wss://la.communities.buzz.xyz",
    ),
  );
  assert.ok(
    addLinks.some(
      ({ name, relay }) =>
        name === "ProductClank" &&
        relay === "wss://productclank.communities.buzz.xyz",
    ),
  );
  assert.ok(
    addLinks.some(
      ({ name, relay }) =>
        name === "gtmelite" &&
        relay === "wss://gtmelite.communities.buzz.xyz",
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

  const featured = [
    ...html.matchAll(
      /<a class="feature-cell [^"]+" href="([^"]+)"[\s\S]*?<span class="feature-name">([^<]+)<\/span>[\s\S]*?<span class="feature-signal">\s*(Public|Invite)/g,
    ),
  ];
  assert.equal(featured.length, 5);
  assert.ok(
    featured.every(
      ([, href, , access]) =>
        access === "Public" && href.startsWith("https://"),
    ),
  );
  assert.equal(featured[0][2], "buzzdir");
  assert.ok(featured.some(([, , name]) => name === "Cashu"));

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
  assert.doesNotMatch(field, /land: true/);
  assert.match(field, /area \/ 91_000/);
  assert.match(field, /clamp\(area \/ 91_000, 37, 154\)/);
  assert.match(field, /hoverUntil = now \+ 0\.45/);

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

test("does not publish expired invite tokens", async () => {
  const communityData = await read("app/communities.ts");
  const blocks = [
    ...communityData.matchAll(/\{\n    name: "([^"]+)"[\s\S]*?\n  \},?/g),
  ];
  const now = Math.floor(Date.now() / 1000);
  let decodedTokens = 0;
  let opaqueTokens = 0;

  for (const block of blocks) {
    const name = block[1];
    const inviteUrl = block[0].match(
      /inviteUrl:\s*\n?\s*"(https:\/\/[^"]+)"/,
    )?.[1];
    if (!inviteUrl) continue;

    const url = new URL(inviteUrl);
    const code = url.pathname.split("/invite/")[1];
    assert.ok(code, `${name} has an invalid invite URL`);

    if (code.startsWith("v2.")) {
      assert.match(code, /^v2\.[A-Za-z0-9_-]+$/);
      opaqueTokens += 1;
      continue;
    }

    const [payload, signature] = code.split(".");
    assert.ok(payload && signature, `${name} has a malformed invite token`);
    const claims = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    assert.ok(
      Number.isInteger(claims.e),
      `${name} invite has no numeric expiry`,
    );
    assert.ok(
      claims.e > now,
      `${name} invite expired at ${new Date(claims.e * 1000).toISOString()}`,
    );
    decodedTokens += 1;
  }

  assert.ok(decodedTokens > 0);
  assert.ok(opaqueTokens > 0);
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
  assert.match(styles, /--comb-clip: polygon\(/);
  assert.match(styles, /clip-path: var\(--comb-card-clip\)/);
  assert.match(styles, /container-type: inline-size/);
  assert.match(styles, /8\.25cqi/);
  assert.match(styles, /\.search-box \{[\s\S]*position: sticky/);
  assert.match(
    styles,
    /\.bento-comb \{[\s\S]*grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/,
  );
  assert.match(styles, /\.feature-cell-1 \{[\s\S]*top: 25%;[\s\S]*left: 0/);
  assert.match(styles, /\.feature-cell-4 \{[\s\S]*top: 25%;[\s\S]*left: 46%/);
  assert.match(styles, /\.feature-cell-5 \{[\s\S]*top: 50%;[\s\S]*left: 69%/);
  assert.doesNotMatch(styles, /\.featured-cluster \{[\s\S]{0,300}rotate\(/);

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
  assert.match(page, /community\.inviteUrl \?\? community\.publicUrl/);
  assert.match(page, /if \(publicUrl\) return publicUrl/);
  assert.doesNotMatch(page, /buzz:\/\/join\?/);
  assert.doesNotMatch(page, /inviteCodeFromUrl/);
  // The wss:// template-literal type is erased at runtime.
  assert.match(page, /community\.relay\.startsWith\("wss:\/\/"\)/);
  assert.match(page, /classifyListingUrl/);
  assert.match(page, /parsed\.pathname[\s\S]*includes\("invite"\)/);
  assert.match(page, /parsed\.protocol === "wss:"/);
  assert.match(page, /parsed\.protocol === "http:"/);
  assert.match(page, /parsed\.protocol === "https:"/);
  assert.match(page, /Web link \/ redirect/);
  assert.match(page, /LISTING_DESCRIPTION_LIMIT = 140/);
  assert.match(page, /new URL\(`\$\{GITHUB_URL\}\/issues\/new`\)/);
  assert.match(page, /window\.open/);
  assert.match(page, /Open \{BUZZDIR_NAME\} in Buzz/);

  // An unclaimed GitHub namespace is a takeover waiting to happen.
  assert.doesNotMatch(
    page,
    /REPLACE-ME/,
    "Set GITHUB_URL in app/page.tsx before deploying. " +
      "github.com/REPLACE-ME is an unclaimed namespace anyone could register.",
  );
  assert.match(
    page,
    /const GITHUB_URL = "https:\/\/github\.com\/pavlenex\/buzz-directory"/,
  );
  assert.doesNotMatch(page, /BUZZDIR_RELAY|flint\.communities\.buzz\.xyz/);

  const relays = [...communityData.matchAll(/relay: "(wss:\/\/[^"]+)"/g)].map(
    ([, relay]) => relay,
  );
  const inviteUrls = [
    ...communityData.matchAll(/inviteUrl:\s*\n?\s*"(https:\/\/[^"]+)"/g),
  ].map(([, url]) => url);
  const publicUrls = [
    ...communityData.matchAll(/publicUrl:\s*\n?\s*"(https:\/\/[^"]+)"/g),
  ].map(([, url]) => url);
  assert.equal(relays.length, 39);
  assert.equal(new Set(relays).size, 39);
  assert.equal(inviteUrls.length, 15);
  assert.equal(new Set(inviteUrls).size, 15);
  assert.ok(inviteUrls.every((url) => url.includes("/invite/")));
  assert.deepEqual(publicUrls, ["https://buzz.cashu.space"]);
  assert.match(communityData, /name: "meshllm"/);
  assert.match(communityData, /name: "presidiobitcoin"/);
  assert.match(
    communityData,
    /name: "Virtual Oranges"[\s\S]{0,320}relay: "wss:\/\/virtualoranges\.communities\.buzz\.xyz"/,
  );
  assert.match(
    communityData,
    /name: "Los Angeles Buzzers"[\s\S]{0,320}relay: "wss:\/\/la\.communities\.buzz\.xyz"/,
  );
  assert.match(
    communityData,
    /name: "ProductClank"[\s\S]{0,320}category: "GTM"[\s\S]{0,160}relay: "wss:\/\/productclank\.communities\.buzz\.xyz"/,
  );
  // inviteUrl itself is the source of truth. There is no duplicate access flag.
  assert.doesNotMatch(communityData, /CommunityAccess|access:/);
  assert.match(
    communityData,
    /name: "Cashu"[\s\S]{0,320}publicUrl: "https:\/\/buzz\.cashu\.space"[\s\S]{0,100}featured:/,
  );
  assert.match(
    communityData,
    /name: "bitcoiners"[\s\S]{0,400}inviteUrl:/,
  );
  assert.match(
    communityData,
    /name: "buzzdir"[\s\S]{0,400}relay: "wss:\/\/buzzdir\.communities\.buzz\.xyz"[\s\S]{0,120}inviteUrl:\s*"https:\/\/buzzdir\.communities\.buzz\.xyz\/invite\/v2\./,
  );
  // Directory grid sorts A–Z; featured hero order stays independent.
  assert.match(page, /localeCompare/);
  assert.ok(relays.every((relay) => relay.startsWith("wss://")));
  assert.equal([...communityData.matchAll(/name: "creatormagic"/g)].length, 1);
  assert.match(
    communityData,
    /name: "creatormagic"[\s\S]{0,500}featured: \{ icon: "✺"/,
  );
  assert.doesNotMatch(communityData, /name: "monero"[\s\S]{0,200}featured:/);

  assert.match(layout, /buzzdir/);
  assert.match(layout, /\.\/og\.png/);
  assert.match(layout, /width: 1200/);
  assert.match(layout, /Content-Security-Policy/);
  assert.match(layout, /referrer: "strict-origin-when-cross-origin"/);
  assert.match(layout, /alternates: \{ canonical: "\.\/" \}/);
  assert.match(layout, /themeColor: "#f7ff00"/);

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

  assert.match(readme, /Safe join routes/);
  assert.match(readme, /original HTTPS invite page/);
  assert.match(readme, /Add\s+Community dialog/);
  assert.match(readme, /prefilled GitHub issue/);
  // Catalog source still documents invite and relay routes for maintainers.
  assert.match(communityData, /inviteUrl\?/);
  assert.match(communityData, /publicUrl\?/);
  for (const source of [page, communityData, layout, workflow, readme]) {
    assert.doesNotMatch(source, /\u2014/);
  }
});
