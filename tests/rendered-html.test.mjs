import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

test("exports the Buzz public-community directory for static hosting", async () => {
  const html = await readFile(
    new URL("../out/index.html", import.meta.url),
    "utf8",
  );
  assert.match(html, /<title>Find your hive — Buzz public communities<\/title>/i);
  assert.match(html, /Find your/);
  assert.match(html, /hive\./);
  assert.match(html, /Explore all hives/);
  assert.match(html, /Pick a frequency\./);
  assert.match(html, /Cashu/);
  assert.match(html, /monero/);
  assert.match(html, /bitcoiners/);
  assert.match(html, /vibecoding/);
  assert.match(html, /List your hive/);
  assert.match(html, /bento-comb/);
  assert.match(html, /bee-drift-field/);
  assert.match(html, /drift-bee-pink/);
  assert.equal([...html.matchAll(/class="drift-bee /g)].length, 24);
  assert.doesNotMatch(html, /empty-cell/);
  assert.match(html, /card-access-public[^>]*>Public/);
  assert.match(html, /card-access-invite[^>]*>Invite/);
  assert.match(
    html,
    /<button class="community-card " type="button" aria-label="Copy Cashu relay and show Buzz join instructions" title="Copy wss:\/\/buzz\.cashu\.space"/,
  );
  assert.doesNotMatch(
    html,
    /href="(?:wss|https):\/\/(?:[\w-]+\.)?communities\.buzz\.xyz"/,
  );
  const renderedRelayCopies = [
    ...html.matchAll(/title="Copy (wss:\/\/[^"]+)"/g),
  ].map(
    ([, relay]) => relay,
  );
  assert.equal(renderedRelayCopies.length, 36);
  assert.equal(new Set(renderedRelayCopies).size, 32);
  assert.doesNotMatch(html, /class="notice"|class="join-guide"/);
  assert.doesNotMatch(html, /public hives buzzing now/i);
  assert.doesNotMatch(html, /sonarprivacy|SV2-Fleet|building-buzz-inside|test2/);
  assert.match(html, /og\.png/);
  assert.doesNotMatch(html, /<canvas/i);
  assert.doesNotMatch(html, /card-topline|card-icon|card-footer|hive-drawer/);
  assert.doesNotMatch(html, /THE PUBLIC SQUARES OF BUZZ/i);
  assert.doesNotMatch(html, /MOVE TO CONDUCT THE SWARM/i);
  assert.doesNotMatch(html, /04\s*\/\s*28/);
  assert.doesNotMatch(html, /codex-preview/);
  assert.doesNotMatch(html, /Your site is taking shape/);
});

test("includes CSS bee drift and the GitHub Pages deployment contract", async () => {
  const [
    page,
    communityData,
    drift,
    styles,
    layout,
    packageJson,
    nextConfig,
    workflow,
    readme,
  ] =
    await Promise.all([
      readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/communities.ts", import.meta.url), "utf8"),
      readFile(new URL("../app/BeeDrift.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
      readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
      readFile(new URL("../package.json", import.meta.url), "utf8"),
      readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
      readFile(
        new URL("../.github/workflows/deploy-pages.yml", import.meta.url),
        "utf8",
      ),
      readFile(new URL("../README.md", import.meta.url), "utf8"),
    ]);

  assert.match(page, /from "\.\/communities"/);
  assert.match(page, /Search communities/);
  assert.match(page, /role="status"/);
  assert.match(page, /<BeeDrift \/>/);
  assert.match(page, /navigator\.clipboard\.writeText/);
  assert.match(page, /document\.execCommand\("copy"\)/);
  assert.match(page, /Copy relay/);
  assert.match(page, /\+ Add community/);
  assert.match(page, /Paste into <strong>Relay URL/);
  assert.match(page, /Automatic copy was blocked/);
  assert.match(page, /className="join-guide"/);
  assert.doesNotMatch(page, /href=\{community\.relay\}/);
  assert.doesNotMatch(page, /buzz:\/\/join/);
  assert.match(drift, /bee-drift-field/);
  assert.match(drift, /beeCount = 24/);
  assert.match(drift, /<svg viewBox="0 0 64 48"/);
  assert.match(drift, /drift-bee-\$\{tones/);
  assert.doesNotMatch(drift, /🐝/);
  assert.doesNotMatch(
    `${page}\n${drift}\n${styles}`,
    /fragmentShaderSource|getContext\(["']webgl|WebGLRenderingContext|u_pointer|pointermove|<canvas/i,
  );
  assert.match(drift, /requestAnimationFrame/);
  assert.match(drift, /Math\.atan2/);
  assert.match(drift, /ResizeObserver/);
  assert.match(drift, /visibilitychange/);
  assert.match(drift, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(drift, /addEventListener\(["']pointer|clientX|clientY/);
  assert.match(styles, /@keyframes bee-wing-buzz/);
  assert.doesNotMatch(styles, /@keyframes bee-fly-|drift-bee-left|bee-route-/);
  assert.match(styles, /\.drift-bee-(?:acid|pink|blue|mint)/);
  assert.match(styles, /\.card-access-invite/);
  assert.match(styles, /\.join-guide/);
  assert.match(styles, /\.community-card-copied/);
  assert.match(styles, /\.bee-drift-field[\s\S]*pointer-events: none/);
  assert.match(page, /notice \? \([\s\S]*className="notice" role="status"/);
  assert.doesNotMatch(page, /notice-visible/);
  assert.match(styles, /@keyframes notice-in/);
  assert.doesNotMatch(styles, /\.notice-visible/);
  assert.match(styles, /grid-template-columns: repeat\(3/);
  assert.match(styles, /--comb-pattern:/);
  assert.doesNotMatch(`${page}\n${styles}`, /empty-cell/);
  assert.doesNotMatch(styles, /\.hero::after|\.honeycomb-field|\.grain/);
  assert.doesNotMatch(styles, /community-card-inner::after/);
  const relays = [...communityData.matchAll(/relay: "(wss:\/\/[^"]+)"/g)].map(
    ([, relay]) => relay,
  );
  assert.equal(relays.length, 32);
  assert.equal(new Set(relays).size, 32);
  assert.ok(relays.every((relay) => relay.startsWith("wss://")));
  assert.doesNotMatch(page, /replace\(\^wss|communitySource/);
  assert.doesNotMatch(communityData, /\b(?:id|size|signal):/);
  assert.match(layout, /Find your hive/);
  assert.match(layout, /\.\/og\.png/);
  assert.match(nextConfig, /output: "export"/);
  assert.match(nextConfig, /basePath: pagesBasePath/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /path: out/);
  assert.match(readme, /One-click relay copying/);
  assert.match(readme, /\+ Add community/);
  assert.doesNotMatch(readme, /Direct `wss:\/\/` community links/);
  assert.doesNotMatch(layout, /Starter Project|codex-preview|_sites-preview/);
  assert.doesNotMatch(
    packageJson,
    /"(?:vinext|wrangler|@cloudflare\/vite-plugin|react-loading-skeleton)"\s*:/,
  );

  await assert.rejects(
    access(new URL("../app/_sites-preview", templateRoot)),
  );
  await assert.rejects(
    access(new URL("../app/BeeSwarm.tsx", templateRoot)),
  );
  await assert.rejects(
    access(new URL("../.openai/hosting.json", templateRoot)),
  );
});
