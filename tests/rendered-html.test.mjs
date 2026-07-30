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
  assert.match(html, /sonarprivacy/);
  assert.match(html, /SV2-Fleet/);
  assert.match(html, /List your hive/);
  assert.match(html, /bento-comb/);
  assert.match(html, /og\.png/);
  assert.doesNotMatch(html, /THE PUBLIC SQUARES OF BUZZ/i);
  assert.doesNotMatch(html, /codex-preview/);
  assert.doesNotMatch(html, /Your site is taking shape/);
});

test("includes the shader swarm and GitHub Pages deployment contract", async () => {
  const [page, swarm, layout, packageJson, nextConfig, workflow] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/BeeSwarm.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
    readFile(
      new URL("../.github/workflows/deploy-pages.yml", import.meta.url),
      "utf8",
    ),
  ]);

  assert.match(page, /const communities/);
  assert.match(page, /Search communities/);
  assert.match(page, /prefers-reduced-motion|aria-live/);
  assert.match(swarm, /fragmentShaderSource/);
  assert.match(swarm, /getContext\("webgl"/);
  assert.match(swarm, /IntersectionObserver/);
  assert.match(swarm, /prefers-reduced-motion: reduce/);
  assert.match(layout, /Find your hive/);
  assert.match(layout, /\.\/og\.png/);
  assert.match(nextConfig, /output: "export"/);
  assert.match(nextConfig, /basePath: pagesBasePath/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /path: out/);
  assert.doesNotMatch(layout, /Starter Project|codex-preview|_sites-preview/);
  assert.doesNotMatch(
    packageJson,
    /"(?:vinext|wrangler|@cloudflare\/vite-plugin|react-loading-skeleton)"\s*:/,
  );

  await assert.rejects(
    access(new URL("../app/_sites-preview", templateRoot)),
  );
  await assert.rejects(
    access(new URL("../.openai/hosting.json", templateRoot)),
  );
});
