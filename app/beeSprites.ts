/**
 * Offscreen sprite atlas for the swarm.
 *
 * Everything expensive about drawing a bee - the fuzz, the ink outline, the
 * neon glow, the motion-blurred wings - is rasterised exactly once here, at
 * mount. The render loop then only ever calls drawImage, so per-frame cost is
 * a texture blit instead of a few hundred vector ops.
 *
 * Geometry is authored in a 96x96 box with the bee facing +X (to the right)
 * and its pivot at the centre of the cell.
 */

export const CELL = 96;

/** 3 blurred flight frames + 1 crisp folded frame used when a bee lands. */
export const FLIGHT_FRAMES = 3;
export const FOLDED_FRAME = 3;
const FRAME_COUNT = FLIGHT_FRAMES + 1;

const INK = "#11120f";

export type BeeTint = {
  body: string;
  fuzz: string;
  wing: string;
  glow: string;
};

/** Amber first, then the brand accents. Honeybee amber leads because the brand
 *  acid-yellow vanishes into the hero background. Index order is load-bearing:
 *  beeField weights index 0 at 45%. */
export const beeTints: readonly BeeTint[] = [
  {
    body: "#ffc400",
    fuzz: "#ffe89a",
    wing: "#fffdf2",
    glow: "255, 196, 0",
  },
  {
    body: "#f2ff3d",
    fuzz: "#fdffc4",
    wing: "#fffef8",
    glow: "230, 255, 0",
  },
  {
    body: "#ff5cbe",
    fuzz: "#ffc7e9",
    wing: "#ffeaf7",
    glow: "255, 92, 190",
  },
  {
    body: "#6075ff",
    fuzz: "#c6cfff",
    wing: "#e9edff",
    glow: "96, 117, 255",
  },
  {
    body: "#37d67a",
    fuzz: "#adf3cc",
    wing: "#e4fff1",
    glow: "55, 214, 122",
  },
];

export type BeeAtlas = {
  canvas: HTMLCanvasElement;
  /** Device-pixel scale the atlas was baked at. */
  scale: number;
};

function ellipsePath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

/**
 * One wing, rooted at the thorax and swept out to the side. Flight frames
 * stack three low-alpha copies at slightly different angles, which bakes a
 * convincing 200Hz blur into a still image - the thing that separates a bee
 * from a bird, which flaps in poses you can actually see.
 */
function drawWing(
  ctx: CanvasRenderingContext2D,
  rootX: number,
  rootY: number,
  degrees: number,
  length: number,
  width: number,
  fill: string,
  alpha: number,
  crisp: boolean,
) {
  ctx.save();
  ctx.translate(rootX, rootY);
  ctx.rotate((degrees * Math.PI) / 180);
  ctx.fillStyle = fill;

  if (crisp) {
    ctx.globalAlpha = alpha;
    ellipsePath(ctx, length / 2, 0, length / 2, width / 2);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.7;
    ctx.stroke();
  } else {
    ctx.globalAlpha = alpha;
    for (let smear = -1; smear <= 1; smear += 1) {
      ctx.save();
      ctx.rotate((smear * 8 * Math.PI) / 180);
      ellipsePath(ctx, length / 2, 0, length / 2, width / 2);
      ctx.fill();
      ctx.restore();
    }
    // A whisper of an outline. Without it a pale wing disappears against the
    // acid-yellow hero and the bee loses half its silhouette.
    ctx.globalAlpha = alpha * 0.5;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.2;
    ellipsePath(ctx, length / 2, 0, length / 2, width / 2);
    ctx.stroke();
  }

  ctx.restore();
}

/** Legs only appear on the parked frame - a bee in flight tucks them away. */
function drawParkedLegs(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = INK;
  ctx.lineCap = "round";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(56, 55);
  ctx.lineTo(50, 65);
  ctx.moveTo(62, 55);
  ctx.lineTo(62, 66);
  ctx.moveTo(48, 56);
  ctx.lineTo(42, 64);
  ctx.moveTo(56, 41);
  ctx.lineTo(50, 31);
  ctx.moveTo(62, 41);
  ctx.lineTo(62, 30);
  ctx.moveTo(48, 40);
  ctx.lineTo(42, 32);
  ctx.stroke();
}

function drawAntennae(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = INK;
  ctx.lineCap = "round";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(73, 44);
  ctx.quadraticCurveTo(79, 40, 81, 36);
  ctx.moveTo(73, 52);
  ctx.quadraticCurveTo(79, 56, 81, 60);
  ctx.stroke();
}

function drawBody(ctx: CanvasRenderingContext2D, tint: BeeTint) {
  // Abdomen: short, fat, faintly tapered. The old side-view bee was long and
  // pointed, which is the silhouette of an ant.
  ctx.beginPath();
  ctx.moveTo(20, 48);
  ctx.bezierCurveTo(20, 37, 28, 35.5, 38, 35.5);
  ctx.bezierCurveTo(49, 35.5, 55, 40, 55, 48);
  ctx.bezierCurveTo(55, 56, 49, 60.5, 38, 60.5);
  ctx.bezierCurveTo(28, 60.5, 20, 59, 20, 48);
  ctx.closePath();

  ctx.fillStyle = tint.body;
  ctx.fill();

  ctx.save();
  ctx.clip();
  ctx.fillStyle = INK;
  ctx.fillRect(18, 33, 6, 30); // dark tail tip
  ctx.fillRect(28, 33, 4.4, 30);
  ctx.fillRect(37, 33, 4.4, 30);
  ctx.fillRect(46, 33, 4.4, 30);
  ctx.restore();

  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.3;
  ctx.lineJoin = "round";
  ctx.stroke();

  // Fuzzy thorax.
  ellipsePath(ctx, 58, 48, 10.5, 10);
  ctx.fillStyle = tint.fuzz;
  ctx.fill();
  ctx.stroke();

  // Dark head.
  ellipsePath(ctx, 70, 48, 7.5, 8);
  ctx.fillStyle = INK;
  ctx.fill();
}

function drawGlow(ctx: CanvasRenderingContext2D, tint: BeeTint) {
  const glow = ctx.createRadialGradient(48, 48, 4, 48, 48, 46);
  glow.addColorStop(0, `rgba(${tint.glow}, 0.38)`);
  glow.addColorStop(0.45, `rgba(${tint.glow}, 0.16)`);
  glow.addColorStop(1, `rgba(${tint.glow}, 0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CELL, CELL);
}

function drawBeeCell(
  ctx: CanvasRenderingContext2D,
  tint: BeeTint,
  frame: number,
) {
  drawGlow(ctx, tint);

  if (frame === FOLDED_FRAME) {
    // Wings laid flat along the abdomen, the way a bee parks them.
    drawWing(ctx, 56, 45, 174, 26, 8.5, tint.wing, 0.85, true);
    drawWing(ctx, 56, 51, 186, 26, 8.5, tint.wing, 0.85, true);
    drawParkedLegs(ctx);
    drawAntennae(ctx);
    drawBody(ctx, tint);
    return;
  }

  drawAntennae(ctx);
  drawBody(ctx, tint);

  // Wings sweep backwards and ride over the abdomen, translucent enough that
  // the bands still read through them.
  const sweep = (frame - 1) * 13;
  const stretch = frame === 1 ? 1 : 0.94;
  const alpha = frame === 1 ? 0.5 : 0.34;

  drawWing(ctx, 57, 52, 126 + sweep, 34 * stretch, 13, tint.wing, alpha, false);
  drawWing(ctx, 53, 53, 150 + sweep, 22 * stretch, 9.5, tint.wing, alpha, false);
  drawWing(ctx, 57, 44, -126 - sweep, 34 * stretch, 13, tint.wing, alpha, false);
  drawWing(ctx, 53, 43, -150 - sweep, 22 * stretch, 9.5, tint.wing, alpha, false);
}

export function bakeBeeAtlas(devicePixelRatio: number): BeeAtlas {
  const scale = Math.min(Math.max(devicePixelRatio, 1), 2);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(FRAME_COUNT * CELL * scale);
  canvas.height = Math.round(beeTints.length * CELL * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) return { canvas, scale };

  ctx.scale(scale, scale);

  for (let tint = 0; tint < beeTints.length; tint += 1) {
    for (let frame = 0; frame < FRAME_COUNT; frame += 1) {
      ctx.save();
      ctx.translate(frame * CELL, tint * CELL);
      ctx.beginPath();
      ctx.rect(0, 0, CELL, CELL);
      ctx.clip();
      drawBeeCell(ctx, beeTints[tint], frame);
      ctx.restore();
    }
  }

  return { canvas, scale };
}
