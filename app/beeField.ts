/**
 * The swarm engine.
 *
 * One <canvas>, one composited layer, one requestAnimationFrame loop. Bees
 * live in document coordinates and are drawn through a fixed viewport-sized
 * canvas, so only the ~third of the swarm that is actually on screen costs
 * anything to draw.
 *
 * Flight model is hover-and-boil rather than steer-and-cruise: each bee picks
 * a point near a page element and springs at it hard, then picks another
 * before it has settled. Continuous heading interpolation - what the previous
 * version did - is how birds fly, and it is why the old swarm read as birds.
 */

import {
  bakeBeeAtlas,
  beeTints,
  CELL,
  FLIGHT_FRAMES,
  FOLDED_FRAME,
  type BeeAtlas,
} from "./beeSprites";

/**
 * A real bee does not drift. It holds a point in the air with almost no net
 * translation - wings blurring, body yawing, bobbing a couple of pixels - and
 * then snaps to a new point in a burst of a few hundred milliseconds. Continuous
 * motion at ANY constant speed is wrong: fast reads as a hornet, slow reads as
 * an ant crawling. The duty cycle is what makes it a bee, and it is roughly
 * 85% stationary.
 */
const HOVERING = 0;
const DARTING = 1;
const APPROACHING = 2;
const LANDED = 3;

type AnchorGroup = {
  selector: string;
  /** Share of the swarm this group attracts, split across its elements. */
  share: number;
  /** How far outside the element bees orbit. */
  pad: number;
  /** Whether bees are allowed to settle on its top edge. */
  land: boolean;
};

const anchorGroups: readonly AnchorGroup[] = [
  { selector: ".hero h1", share: 5, pad: 52, land: false },
  { selector: ".hero-deck", share: 1.2, pad: 36, land: false },
  { selector: ".hero-actions .button", share: 1.8, pad: 24, land: true },
  { selector: ".cluster-label", share: 0.6, pad: 20, land: true },
  { selector: ".feature-cell", share: 2, pad: 26, land: true },
  { selector: ".scroll-cue", share: 0.6, pad: 18, land: false },
  { selector: ".buzz-ticker", share: 3, pad: 22, land: true },
  { selector: ".section-heading h2", share: 4, pad: 32, land: false },
  { selector: ".search-box", share: 3, pad: 22, land: true },
  { selector: ".community-card", share: 22, pad: 18, land: true },
  { selector: ".manifesto h2", share: 3, pad: 32, land: false },
  { selector: ".manifesto-actions .button", share: 3, pad: 20, land: true },
  { selector: ".manifesto article", share: 5, pad: 22, land: true },
  { selector: ".list-hive h2", share: 3, pad: 30, land: false },
  { selector: ".cta-comb", share: 2, pad: 20, land: true },
  { selector: ".footer-links a", share: 2, pad: 18, land: true },
];

type Anchor = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  top: number;
  halfWidth: number;
  land: boolean;
  weight: number;
};

type ExclusionZone = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

type Bee = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  anchor: number;
  size: number;
  tint: number;
  angle: number;
  yaw: number;
  shiverPhase: number;
  shiverAmount: number;
  wingPhase: number;
  wingRate: number;
  orbit: number;
  hopRange: number;
  /** The point in the air this bee is currently holding. */
  stationX: number;
  stationY: number;
  bobPhase: number;
  bobRate: number;
  bobAmount: number;
  state: number;
  hoverUntil: number;
  nextMigrate: number;
  nextLandCheck: number;
  deadline: number;
  landAngle: number;
};

const TAU = Math.PI * 2;

function shortestTurn(from: number, to: number) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

function clamp(value: number, min: number, max: number) {
  return value < min ? min : value > max ? max : value;
}

export type BeeField = { destroy: () => void };

export function createBeeField(host: HTMLElement): BeeField {
  const canvas = document.createElement("canvas");
  canvas.className = "bee-drift-canvas";
  host.appendChild(canvas);

  const context = canvas.getContext("2d", { alpha: true });
  if (!context) {
    return { destroy: () => canvas.remove() };
  }
  const ctx = context;

  let dpr = clamp(window.devicePixelRatio || 1, 1, 2);
  let atlas: BeeAtlas = bakeBeeAtlas(dpr);
  let viewWidth = window.innerWidth;
  let viewHeight = window.innerHeight;

  let anchors: Anchor[] = [];
  let exclusionZones: ExclusionZone[] = [];
  let anchorTotalWeight = 0;
  const bees: Bee[] = [];
  /** Bees beyond this index are asleep - the adaptive quality valve. */
  let activeCount = 0;
  let targetCount = 0;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarse = window.matchMedia("(max-width: 620px)");

  // ---------------------------------------------------------------- anchors

  function measureAnchors() {
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const next: Anchor[] = [];

    for (const group of anchorGroups) {
      const elements = document.querySelectorAll<HTMLElement>(group.selector);
      if (elements.length === 0) continue;
      const weight = group.share / elements.length;

      for (const element of elements) {
        const rect = element.getBoundingClientRect();
        if (rect.width < 4 || rect.height < 4) continue;
        next.push({
          cx: rect.left + scrollX + rect.width / 2,
          cy: rect.top + scrollY + rect.height / 2,
          rx: rect.width / 2 + group.pad,
          ry: rect.height / 2 + group.pad,
          top: rect.top + scrollY - 4,
          halfWidth: rect.width / 2,
          land: group.land,
          weight,
        });
      }
    }

    if (next.length === 0) {
      next.push({
        cx: viewWidth / 2,
        cy: viewHeight / 2,
        rx: viewWidth / 2.4,
        ry: viewHeight / 2.4,
        top: viewHeight / 2,
        halfWidth: viewWidth / 3,
        land: false,
        weight: 1,
      });
    }

    anchors = next;
    anchorTotalWeight = next.reduce((sum, anchor) => sum + anchor.weight, 0);

    // Keep the swarm in the negative space around copy and controls. This is
    // especially important on phones, where the gutters are barely bee-wide,
    // but it also prevents desktop bees from obscuring labels mid-flight.
    exclusionZones = [];
    const protectedElements = document.querySelectorAll<HTMLElement>(
      [
        ".hero-copy",
        ".featured-cluster",
        ".buzz-ticker",
        ".section-heading",
        ".search-box",
        ".filters",
        ".results-line",
        ".community-card-inner",
        ".empty-state",
        ".manifesto > .section-index",
        ".manifesto > h2",
        ".manifesto-lede",
        ".manifesto-grid",
        ".list-hive > div:not(.cta-comb)",
        ".list-hive > .button",
        "footer",
      ].join(","),
    );

    for (const element of protectedElements) {
      const rect = element.getBoundingClientRect();
      const padding = coarse.matches ? 6 : 10;
      exclusionZones.push({
        left: rect.left + scrollX - padding,
        right: rect.right + scrollX + padding,
        top: rect.top + scrollY - padding,
        bottom: rect.bottom + scrollY + padding,
      });
    }
  }

  function pickWeightedAnchor() {
    let ticket = Math.random() * anchorTotalWeight;
    for (let index = 0; index < anchors.length; index += 1) {
      ticket -= anchors[index].weight;
      if (ticket <= 0) return index;
    }
    return anchors.length - 1;
  }

  // ------------------------------------------------------------------- bees

  function desiredBeeCount() {
    const docHeight = Math.max(
      document.documentElement.scrollHeight,
      viewHeight,
    );
    const area = viewWidth * docHeight;
    let count = Math.round(clamp(area / 135_000, 26, 110));
    if (coarse.matches) count = Math.round(count * 0.32);
    const cores = navigator.hardwareConcurrency ?? 8;
    if (cores <= 4) count = Math.round(count * 0.6);
    return Math.max(count, coarse.matches ? 8 : 16);
  }

  /** Pick the next point in the air for this bee to hold. */
  function chooseStation(bee: Bee) {
    const anchor = anchors[bee.anchor] ?? anchors[0];
    const theta = Math.random() * TAU;
    const spread = 0.55 + Math.random() * 0.75;
    const aimX =
      anchor.cx + Math.cos(theta) * (anchor.rx * spread + bee.orbit * 0.4);
    const aimY =
      anchor.cy + Math.sin(theta) * (anchor.ry * spread + bee.orbit * 0.4);

    // Hop only part of the way. Aiming straight at a point on the anchor
    // ellipse meant a bee beside the huge hero headline could be handed a
    // target 700px away and would streak across it.
    const deltaX = aimX - bee.x;
    const deltaY = aimY - bee.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY) || 1;
    const hop = Math.min(distance, 30 + Math.random() * bee.hopRange);

    bee.stationX = bee.x + (deltaX / distance) * hop;
    bee.stationY = bee.y + (deltaY / distance) * hop;
  }

  function beginHover(bee: Bee, now: number) {
    bee.state = HOVERING;
    bee.hoverUntil = now + 0.8 + Math.random() * 2.9;
  }

  function beginDart(bee: Bee, now: number) {
    chooseStation(bee);
    bee.state = DARTING;
    // Hard cap on burst length. Whatever distance is left when it expires gets
    // absorbed by the hover spring, which reads as the bee arriving and
    // settling rather than braking.
    bee.deadline = now + 0.24 + Math.random() * 0.22;
  }

  function migrate(bee: Bee, now: number) {
    // Sample a few candidates and take the nearest, so bees mostly drift to
    // neighbouring elements instead of teleporting across the whole page.
    let best = bee.anchor;
    let bestDistance = Infinity;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const candidate = pickWeightedAnchor();
      if (candidate === bee.anchor) continue;
      const anchor = anchors[candidate];
      const distance = Math.hypot(anchor.cx - bee.x, anchor.cy - bee.y);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = candidate;
      }
    }
    bee.anchor = best;
    bee.nextMigrate = now + 14 + Math.random() * 26;
  }

  function spawnBee(now: number): Bee {
    const anchorIndex = pickWeightedAnchor();
    const anchor = anchors[anchorIndex];
    const theta = Math.random() * TAU;

    const bee: Bee = {
      x: anchor.cx + Math.cos(theta) * anchor.rx,
      y: anchor.cy + Math.sin(theta) * anchor.ry,
      vx: 0,
      vy: 0,
      anchor: anchorIndex,
      size: 19 + Math.random() * Math.random() * 26,
      tint:
        Math.random() < 0.45
          ? 0
          : 1 + Math.floor(Math.random() * (beeTints.length - 1)),
      angle: theta,
      yaw: (Math.random() - 0.5) * 1.6,
      shiverPhase: Math.random() * TAU,
      shiverAmount: 0.02 + Math.random() * 0.04,
      wingPhase: Math.random() * FLIGHT_FRAMES,
      wingRate: 44 + Math.random() * 26,
      orbit: 15 + Math.random() * 45,
      hopRange: 45 + Math.random() * 85,
      stationX: 0,
      stationY: 0,
      bobPhase: Math.random() * TAU,
      bobRate: 1.5 + Math.random() * 1.9,
      bobAmount: 1.4 + Math.random() * 3.1,
      state: HOVERING,
      hoverUntil: 0,
      nextMigrate: now + Math.random() * 20,
      nextLandCheck: now + 3 + Math.random() * 14,
      deadline: 0,
      landAngle: 0,
    };

    bee.stationX = bee.x;
    bee.stationY = bee.y;
    beginHover(bee, now + Math.random() * 2);
    return bee;
  }

  function resizeSwarm(now: number) {
    for (const bee of bees) {
      if (bee.anchor >= anchors.length) {
        bee.anchor = pickWeightedAnchor();
        beginDart(bee, now);
      }
    }

    targetCount = desiredBeeCount();
    while (bees.length < targetCount) bees.push(spawnBee(now));
    if (bees.length > targetCount) bees.length = targetCount;
    activeCount = Math.min(activeCount || targetCount, targetCount);
  }

  // ---------------------------------------------------------------- canvas

  function resizeCanvas() {
    viewWidth = window.innerWidth;
    viewHeight = window.innerHeight;
    dpr = clamp(window.devicePixelRatio || 1, 1, 2);

    const pixelWidth = Math.round(viewWidth * dpr);
    const pixelHeight = Math.round(viewHeight * dpr);

    // Assigning canvas.width reallocates and clears the backing store even
    // when the value is identical, and the body ResizeObserver fires on every
    // keystroke that changes the result count. Guard the write.
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
    canvas.style.width = `${viewWidth}px`;
    canvas.style.height = `${viewHeight}px`;

    if (Math.abs(atlas.scale - Math.min(dpr, 2)) > 0.01) {
      atlas = bakeBeeAtlas(dpr);
    }
  }

  // ------------------------------------------------------------ simulation

  function step(bee: Bee, dt: number, now: number) {
    const anchor = anchors[bee.anchor] ?? anchors[0];

    if (bee.state === LANDED) {
      if (now >= bee.deadline) {
        const kick = 60 + Math.random() * 80;
        const away = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
        bee.vx = Math.cos(away) * kick;
        bee.vy = Math.sin(away) * kick;
        bee.nextLandCheck = now + 9 + Math.random() * 16;
        beginDart(bee, now);
      }
      return;
    }

    if (bee.state === HOVERING && now >= bee.hoverUntil) {
      if (now >= bee.nextMigrate) migrate(bee, now);

      const mayLand = now >= bee.nextLandCheck;
      if (mayLand) bee.nextLandCheck = now + 8 + Math.random() * 16;

      if (mayLand && anchor.land && Math.random() < 0.5) {
        bee.state = APPROACHING;
        bee.stationX = anchor.cx + (Math.random() - 0.5) * anchor.halfWidth * 1.5;
        bee.stationY = anchor.top - bee.size * 0.16;
        bee.deadline = now + 1.8;
        bee.landAngle =
          (Math.random() - 0.5) * 0.5 + (Math.random() < 0.5 ? 0 : Math.PI);
      } else {
        beginDart(bee, now);
      }
    } else if (bee.state === DARTING && now >= bee.deadline) {
      beginHover(bee, now);
    }

    const hovering = bee.state === HOVERING;
    const approaching = bee.state === APPROACHING;

    // While holding station the bee aims at its point plus a small two-axis
    // bob, which is what keeps a stationary bee from looking frozen.
    const targetX = hovering
      ? bee.stationX + Math.sin(now * bee.bobRate + bee.bobPhase) * bee.bobAmount
      : bee.stationX;
    const targetY = hovering
      ? bee.stationY +
        Math.sin(now * bee.bobRate * 0.71 + bee.bobPhase * 1.7) *
          bee.bobAmount *
          0.8
      : bee.stationY;

    const deltaX = targetX - bee.x;
    const deltaY = targetY - bee.y;

    // Hover is a stiff, nearly critically damped spring: it parks the bee.
    // Dart is loose and underdamped: it throws the bee at the new station.
    let stiffness = 24;
    let damping = 5.2;
    let jitter = 240;
    let limit = 430;
    if (hovering) {
      stiffness = 34;
      damping = 9.6;
      jitter = 300;
      limit = 210;
    } else if (approaching) {
      stiffness = 17;
      damping = 8.2;
      jitter = 150;
      limit = 230;
    }

    bee.vx +=
      (deltaX * stiffness - bee.vx * damping + (Math.random() - 0.5) * jitter) *
      dt;
    bee.vy +=
      (deltaY * stiffness - bee.vy * damping + (Math.random() - 0.5) * jitter) *
      dt;

    const speed = Math.sqrt(bee.vx * bee.vx + bee.vy * bee.vy);
    if (speed > limit) {
      const scale = limit / speed;
      bee.vx *= scale;
      bee.vy *= scale;
    }

    bee.x += bee.vx * dt;
    bee.y += bee.vy * dt;

    if (approaching) {
      if (deltaX * deltaX + deltaY * deltaY < 64 && speed < 60) {
        bee.state = LANDED;
        bee.x = bee.stationX;
        bee.y = bee.stationY;
        bee.vx = 0;
        bee.vy = 0;
        bee.angle = bee.landAngle;
        bee.deadline = now + 1.1 + Math.random() * 2.8;
        return;
      }
      if (now >= bee.deadline) beginHover(bee, now);
    }

    // Body heading. Below the threshold the velocity angle is pure noise, so
    // the bee keeps its last heading and yaws slowly instead of spinning -
    // that slow idle yaw while holding station is most of what says "bee".
    if (speed > 55) {
      const course = Math.atan2(bee.vy, bee.vx);
      bee.angle += shortestTurn(bee.angle, course) * Math.min(1, dt * 9);
    } else {
      bee.angle += bee.yaw * dt;
      if (Math.random() < dt * 0.45) bee.yaw = (Math.random() - 0.5) * 1.5;
    }

    bee.wingPhase += bee.wingRate * dt;
  }

  // ---------------------------------------------------------------- render

  function draw(scrollX: number, scrollY: number) {
    const cellSource = CELL * atlas.scale;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let index = 0; index < activeCount; index += 1) {
      const bee = bees[index];
      const screenX = bee.x - scrollX;
      const screenY = bee.y - scrollY;
      const margin = bee.size;

      if (
        screenX < -margin ||
        screenX > viewWidth + margin ||
        screenY < -margin ||
        screenY > viewHeight + margin
      ) {
        continue;
      }

      let overlapsContent = false;
      for (const zone of exclusionZones) {
        if (
          bee.x >= zone.left &&
          bee.x <= zone.right &&
          bee.y >= zone.top &&
          bee.y <= zone.bottom
        ) {
          overlapsContent = true;
          break;
        }
      }
      if (overlapsContent) continue;

      const frame =
        bee.state === LANDED
          ? FOLDED_FRAME
          : Math.floor(bee.wingPhase) % FLIGHT_FRAMES;

      const angle =
        bee.state === LANDED
          ? bee.angle
          : bee.angle +
            Math.sin(bee.shiverPhase + bee.wingPhase * 0.35) * bee.shiverAmount;

      const k = (bee.size / CELL) * dpr;
      const cos = Math.cos(angle) * k;
      const sin = Math.sin(angle) * k;

      ctx.setTransform(cos, sin, -sin, cos, screenX * dpr, screenY * dpr);
      ctx.drawImage(
        atlas.canvas,
        frame * cellSource,
        bee.tint * cellSource,
        cellSource,
        cellSource,
        -CELL / 2,
        -CELL / 2,
        CELL,
        CELL,
      );
    }
  }

  function drawStill() {
    resizeCanvas();
    measureAnchors();
    resizeSwarm(0);
    activeCount = Math.min(bees.length, 26);
    for (const bee of bees) {
      bee.state = HOVERING;
      bee.wingPhase = 1;
    }
    draw(window.scrollX, window.scrollY);
  }

  // ------------------------------------------------------------------ loop

  let frameHandle = 0;
  let running = false;
  let lastTime = 0;
  let clock = 0;
  let smoothedFrame = 1 / 60;
  let lastQualityCheck = 0;

  function tick(time: number) {
    const raw = (time - lastTime) / 1000;
    lastTime = time;
    const dt = clamp(raw, 0.001, 0.04);
    clock += dt;

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    // draw() already culls offscreen bees; simulating them was ~2/3 wasted
    // work. One viewport of slack either side so nothing pops in mid-dart.
    const simTop = scrollY - viewHeight;
    const simBottom = scrollY + viewHeight * 2;

    for (let index = 0; index < activeCount; index += 1) {
      const bee = bees[index];
      if (bee.y < simTop || bee.y > simBottom) continue;
      step(bee, dt, clock);
    }
    draw(scrollX, scrollY);

    // Adaptive valve: if we are consistently missing frames, thin the swarm
    // rather than let the page stutter.
    smoothedFrame += (raw - smoothedFrame) * 0.05;
    if (clock - lastQualityCheck > 2.5) {
      lastQualityCheck = clock;
      const floor = Math.max(14, Math.round(targetCount * 0.35));
      if (smoothedFrame > 0.0235 && activeCount > floor) {
        activeCount = Math.max(floor, Math.round(activeCount * 0.78));
      } else if (smoothedFrame < 0.018 && activeCount < targetCount) {
        activeCount = Math.min(targetCount, activeCount + 6);
      }
    }

    frameHandle = window.requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    lastTime = performance.now();
    frameHandle = window.requestAnimationFrame(tick);
  }

  function stop() {
    if (!running) return;
    running = false;
    window.cancelAnimationFrame(frameHandle);
  }

  // --------------------------------------------------------------- wiring

  let remeasureHandle = 0;
  function scheduleRemeasure() {
    window.clearTimeout(remeasureHandle);
    remeasureHandle = window.setTimeout(() => {
      resizeCanvas();
      measureAnchors();
      resizeSwarm(clock);
      if (!running && !reduceMotion.matches) start();
      if (reduceMotion.matches) drawStill();
    }, 120);
  }

  const onVisibility = () => {
    if (document.hidden) stop();
    else if (!reduceMotion.matches) start();
  };

  const onMotionPreference = () => {
    if (reduceMotion.matches) {
      stop();
      drawStill();
    } else {
      start();
    }
  };

  const bodyObserver = new ResizeObserver(scheduleRemeasure);
  bodyObserver.observe(document.body);
  window.addEventListener("resize", scheduleRemeasure, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  reduceMotion.addEventListener("change", onMotionPreference);

  resizeCanvas();
  measureAnchors();
  resizeSwarm(0);
  activeCount = bees.length;

  if (reduceMotion.matches) drawStill();
  else start();

  return {
    destroy() {
      stop();
      window.clearTimeout(remeasureHandle);
      bodyObserver.disconnect();
      window.removeEventListener("resize", scheduleRemeasure);
      document.removeEventListener("visibilitychange", onVisibility);
      reduceMotion.removeEventListener("change", onMotionPreference);
      canvas.remove();
    },
  };
}
