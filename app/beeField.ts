/**
 * The swarm engine.
 *
 * One <canvas>, one composited layer, one requestAnimationFrame loop. Bees
 * live in document coordinates and are drawn through a fixed viewport-sized
 * canvas, so only the ~third of the swarm that is actually on screen costs
 * anything to draw.
 *
 * Flight model is hold-then-dart, and the dart is kinematic, not physical:
 * each flight is an eased curve from the current station to the next, with
 * the body facing the path tangent. The previous spring model produced the
 * three classic tells of a fake insect - slow crawling drift between bursts
 * (reads as an ant), overshoot that dragged a bee backwards against its own
 * heading, and constant-speed cruising (reads as a bird). A scripted arc can
 * do none of those: it starts still, commits, arrives, and holds.
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
 * A real bee alternates between holding a point in the air and short, visible
 * darts. Continuous motion at a constant speed reads as a bird; overly long
 * pauses read as walking. The short hover duty cycle below keeps wings moving
 * while making the swarm visibly airborne. LANDED keeps its slot (and the
 * folded sprite frame) but no anchor currently opts into settling, so the
 * swarm stays airborne end to end.
 */
const HOVERING = 0;
const DARTING = 1;
const LANDED = 3;

type AnchorGroup = {
  selector: string;
  /** Share of the swarm this group attracts, split across its elements. */
  share: number;
  /** How far outside the element bees orbit. */
  pad: number;
};

const anchorGroups: readonly AnchorGroup[] = [
  { selector: ".hero h1", share: 5, pad: 52 },
  { selector: ".hero-deck", share: 1.2, pad: 36 },
  { selector: ".hero-actions .button", share: 1.8, pad: 24 },
  { selector: ".cluster-label", share: 0.6, pad: 20 },
  { selector: ".feature-cell", share: 2, pad: 26 },
  { selector: ".scroll-cue", share: 0.6, pad: 18 },
  { selector: ".buzz-ticker", share: 3, pad: 22 },
  { selector: ".section-heading h2", share: 4, pad: 32 },
  { selector: ".search-box", share: 3, pad: 22 },
  { selector: ".community-card", share: 22, pad: 18 },
  { selector: ".manifesto h2", share: 3, pad: 32 },
  { selector: ".manifesto-actions .button", share: 3, pad: 20 },
  { selector: ".manifesto article", share: 5, pad: 22 },
  { selector: ".list-hive h2", share: 3, pad: 30 },
  { selector: ".listing-form", share: 4, pad: 24 },
  { selector: ".cta-comb", share: 2, pad: 20 },
  { selector: ".footer-links a", share: 2, pad: 18 },
];

type Anchor = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
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
  /**
   * Drawn opacity, eased in on spawn and toward 0 when the quality valve
   * idles the bee. Popping in and out read as bees randomly vanishing; a
   * short fade does not.
   */
  alpha: number;
  /** The point in the air this bee is currently holding. */
  stationX: number;
  stationY: number;
  bobPhase: number;
  bobRate: number;
  bobAmount: number;
  state: number;
  hoverStart: number;
  hoverUntil: number;
  nextMigrate: number;
  /** Current dart: eased quadratic arc from `dartFrom` to `station`. */
  dartFromX: number;
  dartFromY: number;
  dartCtrlX: number;
  dartCtrlY: number;
  dartStart: number;
  dartTime: number;
  /** Small perpendicular waver along the arc, zeroed at both endpoints. */
  weaveAmp: number;
  weaveCycles: number;
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
        weight: 1,
      });
    }

    anchors = next;
    anchorTotalWeight = next.reduce((sum, anchor) => sum + anchor.weight, 0);

    // Keep the swarm's *stations* in the negative space around copy and
    // controls: a bee may cross these rects mid-dart, but it never stops over
    // them. Hiding bees inside the rects instead - what earlier versions did -
    // made bees blink out mid-flight, which reads as a bug, not politeness.
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
        ".listing-form",
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

  function insideExclusion(x: number, y: number) {
    for (const zone of exclusionZones) {
      if (x >= zone.left && x <= zone.right && y >= zone.top && y <= zone.bottom) {
        return true;
      }
    }
    return false;
  }

  // ------------------------------------------------------------------- bees

  function desiredBeeCount() {
    const docHeight = Math.max(
      document.documentElement.scrollHeight,
      viewHeight,
    );
    const area = viewWidth * docHeight;
    // One bee per ~260k document pixels: a garden's worth, not a swarm's.
    // The old 91k density put a hundred-plus bees on a desktop page, which
    // overwhelmed the content they were meant to decorate.
    let count = Math.round(clamp(area / 260_000, 12, 48));
    if (coarse.matches) count = Math.round(count * 0.45);
    const cores = navigator.hardwareConcurrency ?? 8;
    if (cores <= 4) count = Math.round(count * 0.6);
    return Math.max(count, coarse.matches ? 8 : 14);
  }

  /** Pick the next point in the air for this bee to hold. */
  function chooseStation(bee: Bee) {
    const anchor = anchors[bee.anchor] ?? anchors[0];

    // A handful of samples, keeping the first station that is not on top of
    // protected copy, so a bee never parks over something the visitor is
    // trying to read.
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const theta = Math.random() * TAU;
      const spread = 1.05 + Math.random() * 0.75;
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
      if (!insideExclusion(bee.stationX, bee.stationY)) break;
    }
  }

  function beginHover(bee: Bee, now: number) {
    bee.state = HOVERING;
    bee.hoverStart = now;
    bee.hoverUntil = now + 0.45 + Math.random() * 0.75;
  }

  /** Script the next flight: an eased arc from here to a fresh station. */
  function beginDart(bee: Bee, now: number) {
    const fromX = bee.x;
    const fromY = bee.y;
    chooseStation(bee);

    const deltaX = bee.stationX - fromX;
    const deltaY = bee.stationY - fromY;
    const distance = Math.hypot(deltaX, deltaY) || 1;

    // Bow the control point sideways so flights are arcs, not rails.
    const bow =
      distance * (0.1 + Math.random() * 0.2) * (Math.random() < 0.5 ? -1 : 1);
    bee.dartFromX = fromX;
    bee.dartFromY = fromY;
    bee.dartCtrlX = fromX + deltaX * 0.5 - (deltaY / distance) * bow;
    bee.dartCtrlY = fromY + deltaY * 0.5 + (deltaX / distance) * bow;

    bee.dartStart = now;
    // Duration scales with distance: standing start, quick middle, soft stop.
    bee.dartTime = clamp(distance / (240 + Math.random() * 140), 0.28, 1.1);
    bee.weaveAmp = (2 + Math.random() * 4) * (Math.random() < 0.5 ? -1 : 1);
    bee.weaveCycles = 1 + Math.random() * 1.5;
    bee.state = DARTING;
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
    bee.nextMigrate = now + 9 + Math.random() * 20;
  }

  function spawnBee(now: number): Bee {
    const anchorIndex = pickWeightedAnchor();
    const anchor = anchors[anchorIndex];
    let theta = Math.random() * TAU;
    let x = anchor.cx + Math.cos(theta) * anchor.rx;
    let y = anchor.cy + Math.sin(theta) * anchor.ry;

    // The spawn point doubles as the first hover station, so give it the same
    // stay-off-the-copy treatment chooseStation applies.
    for (let attempt = 0; attempt < 4 && insideExclusion(x, y); attempt += 1) {
      theta = Math.random() * TAU;
      x = anchor.cx + Math.cos(theta) * anchor.rx;
      y = anchor.cy + Math.sin(theta) * anchor.ry;
    }

    const bee: Bee = {
      x,
      y,
      anchor: anchorIndex,
      size: 19 + Math.random() * Math.random() * 26,
      tint:
        Math.random() < 0.45
          ? 0
          : 1 + Math.floor(Math.random() * (beeTints.length - 1)),
      angle: theta,
      yaw: (Math.random() - 0.5) * 0.8,
      shiverPhase: Math.random() * TAU,
      shiverAmount: 0.02 + Math.random() * 0.04,
      wingPhase: Math.random() * FLIGHT_FRAMES,
      wingRate: 52 + Math.random() * 28,
      orbit: 18 + Math.random() * 50,
      hopRange: 80 + Math.random() * 120,
      alpha: 0,
      stationX: x,
      stationY: y,
      bobPhase: Math.random() * TAU,
      bobRate: 1.5 + Math.random() * 1.9,
      bobAmount: 1.4 + Math.random() * 3.1,
      state: HOVERING,
      hoverStart: 0,
      hoverUntil: 0,
      nextMigrate: now + Math.random() * 20,
      dartFromX: x,
      dartFromY: y,
      dartCtrlX: x,
      dartCtrlY: y,
      dartStart: 0,
      dartTime: 1,
      weaveAmp: 0,
      weaveCycles: 1,
    };

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
    // Never truncate the pool mid-session: chopping the array made whole
    // clusters of drawn bees vanish in one frame whenever filtering shrank
    // the page. Surplus bees just fade out through the activeCount valve.
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
    if (bee.state === HOVERING) {
      if (now >= bee.hoverUntil) {
        if (now >= bee.nextMigrate) migrate(bee, now);
        beginDart(bee, now);
      } else {
        // Hold station on a small two-axis bob. Position is written directly,
        // not steered: springs left residual drift and jitter at walking
        // speed, which is exactly how an ant crosses a page. The ramp keeps
        // the bob from snapping sideways on the first hover frame.
        const ramp = clamp((now - bee.hoverStart) * 3, 0, 1);
        bee.x =
          bee.stationX +
          Math.sin(now * bee.bobRate + bee.bobPhase) * bee.bobAmount * ramp;
        bee.y =
          bee.stationY +
          Math.sin(now * bee.bobRate * 0.71 + bee.bobPhase * 1.7) *
            bee.bobAmount *
            0.8 *
            ramp;

        // Idle heading wanders a few degrees at most; a parked insect
        // pirouetting in place is another ant tell.
        bee.angle += bee.yaw * dt;
        if (Math.random() < dt * 0.4) bee.yaw = (Math.random() - 0.5) * 0.8;
      }
    }

    if (bee.state === DARTING) {
      const t = clamp((now - bee.dartStart) / bee.dartTime, 0, 1);
      // Smoothstep: still at launch, fastest mid-arc, gentle arrival.
      const eased = t * t * (3 - 2 * t);
      const inv = 1 - eased;

      const arcX =
        inv * inv * bee.dartFromX +
        2 * inv * eased * bee.dartCtrlX +
        eased * eased * bee.stationX;
      const arcY =
        inv * inv * bee.dartFromY +
        2 * inv * eased * bee.dartCtrlY +
        eased * eased * bee.stationY;

      // Perpendicular waver, enveloped to zero at both endpoints so it never
      // kinks the launch or the arrival.
      const spanX = bee.stationX - bee.dartFromX;
      const spanY = bee.stationY - bee.dartFromY;
      const span = Math.hypot(spanX, spanY) || 1;
      const weave =
        Math.sin(t * Math.PI * bee.weaveCycles * 2) *
        Math.sin(t * Math.PI) *
        bee.weaveAmp;
      bee.x = arcX - (spanY / span) * weave;
      bee.y = arcY + (spanX / span) * weave;

      // Face the arc tangent. Heading and motion share one source of truth,
      // so a bee can no longer translate against its own facing - the
      // "flying backwards" artefact the spring model produced.
      const tangentX =
        inv * (bee.dartCtrlX - bee.dartFromX) +
        eased * (bee.stationX - bee.dartCtrlX);
      const tangentY =
        inv * (bee.dartCtrlY - bee.dartFromY) +
        eased * (bee.stationY - bee.dartCtrlY);
      const course = Math.atan2(tangentY, tangentX);
      bee.angle += shortestTurn(bee.angle, course) * Math.min(1, dt * 12);

      if (t >= 1) beginHover(bee, now);
    }

    bee.wingPhase += bee.wingRate * dt;
  }

  // ---------------------------------------------------------------- render

  function draw(scrollX: number, scrollY: number, dt: number) {
    const cellSource = CELL * atlas.scale;
    const fade = Math.min(1, dt * 7);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let index = 0; index < bees.length; index += 1) {
      const bee = bees[index];

      // A bee is shown unless the quality valve idled it, and it eases out
      // and back instead of popping. It is never hidden for overlapping the
      // page: mid-flight bees may cross copy, and blinking them out there is
      // what used to read as bees randomly vanishing.
      const shown = index < activeCount;
      bee.alpha += ((shown ? 1 : 0) - bee.alpha) * fade;
      if (bee.alpha < 0.03) continue;

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

      ctx.globalAlpha = bee.alpha;
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

    ctx.globalAlpha = 1;
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
    // dt of 1 collapses the fade so the single still frame is exact.
    draw(window.scrollX, window.scrollY, 1);
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
    draw(scrollX, scrollY, dt);

    // Adaptive valve: if we are consistently missing frames, thin the swarm
    // rather than let the page stutter.
    smoothedFrame += (raw - smoothedFrame) * 0.05;
    if (clock - lastQualityCheck > 2.5) {
      lastQualityCheck = clock;
      const floor = Math.max(8, Math.round(targetCount * 0.35));
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
