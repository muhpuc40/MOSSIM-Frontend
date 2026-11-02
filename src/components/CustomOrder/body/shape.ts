/**
 * Procedural doll / mannequin — no GLB needed.
 *
 * Units are metres for a ~1.72 m figure standing on y = 0, facing +Z.
 *  - Torso: custom surface built from cross-sections (superellipses with a
 *    separate front and back depth), so chest, shoulder blades and glutes read.
 *  - Arms / legs: tubes swept along a gently bent path with a radius profile.
 *  - Markers for every measurement are derived from the same functions, so
 *    rings and lines sit exactly on the surface.
 */
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export type Gender = "male" | "female";
export type BodyType = "top" | "bottom";
export type MeasureKey =
  | "chest"
  | "shoulder"
  | "waist"
  | "sleeve_length"
  | "arm_hole"
  | "hip"
  | "thigh"
  | "front_rise"
  | "back_rise";

export const TOP_FIELDS: MeasureKey[] = ["chest", "shoulder", "waist", "sleeve_length", "arm_hole"];
export const BOTTOM_FIELDS: MeasureKey[] = ["waist", "hip", "thigh", "front_rise", "back_rise"];

export const MEASURE_LABEL: Record<MeasureKey, string> = {
  chest: "Chest",
  shoulder: "Shoulder",
  waist: "Waist",
  sleeve_length: "Sleeve Length",
  arm_hole: "Arm Hole",
  hip: "Hip",
  thigh: "Thigh",
  front_rise: "Front Rise",
  back_rise: "Back Rise",
};

type V3 = [number, number, number];

export interface BodyShape {
  /** [y, halfWidth, frontDepth, backDepth, squareness] — bottom (crotch) to top (neck base) */
  torso: [number, number, number, number, number][];
  shoulder: { x: number; y: number; r: number };
  armTilt: number;
  /** arm path in the arm's local space (origin = shoulder joint, hanging along -y) */
  armPath: V3[];
  /** [t 0..1 along the arm, radius] */
  armRadius: [number, number][];
  handScale: number;
  legPath: V3[];
  legRadius: [number, number][];
  neck: { r: number; y0: number; y1: number };
  head: { r: number; y: number };
  bust?: { x: number; y: number; z: number; r: number };
  hair: "short" | "bun";
  chestY: number;
  waistY: number;
  hipY: number;
  thighY: number;
}

export const SHAPES: Record<Gender, BodyShape> = {
  male: {
    torso: [
      [0.775, 0.05, 0.03, 0.035, 2.0],
      [0.79, 0.12, 0.065, 0.08, 2.1],
      [0.83, 0.152, 0.085, 0.105, 2.2],
      [0.89, 0.165, 0.092, 0.116, 2.25],
      [0.95, 0.166, 0.093, 0.113, 2.25],
      [1.01, 0.156, 0.092, 0.097, 2.25],
      [1.07, 0.148, 0.093, 0.086, 2.3],
      [1.15, 0.153, 0.097, 0.086, 2.35],
      [1.23, 0.168, 0.106, 0.091, 2.4],
      [1.3, 0.178, 0.113, 0.096, 2.4],
      [1.36, 0.182, 0.103, 0.099, 2.4],
      [1.395, 0.178, 0.086, 0.091, 2.35],
      [1.42, 0.15, 0.069, 0.075, 2.2],
      [1.445, 0.104, 0.056, 0.06, 2.1],
      [1.465, 0.068, 0.048, 0.05, 2.0],
      [1.48, 0.05, 0.044, 0.046, 2.0],
    ],
    shoulder: { x: 0.192, y: 1.395, r: 0.058 },
    armTilt: 0.19,
    armPath: [[0, 0.02, 0], [0, -0.15, 0.004], [0, -0.3, 0.012], [0, -0.43, 0.026], [0, -0.555, 0.036]],
    armRadius: [[0, 0.05], [0.1, 0.049], [0.35, 0.042], [0.53, 0.034], [0.62, 0.038], [0.78, 0.032], [0.95, 0.025], [1, 0.024]],
    handScale: 1,
    legPath: [[0.084, 0.96, -0.006], [0.089, 0.7, 0.005], [0.087, 0.47, 0.013], [0.085, 0.26, -0.004], [0.083, 0.072, -0.012]],
    legRadius: [[0, 0.058], [0.06, 0.072], [0.13, 0.089], [0.25, 0.08], [0.42, 0.061], [0.5, 0.051], [0.58, 0.054], [0.68, 0.058], [0.85, 0.041], [1, 0.031]],
    neck: { r: 0.05, y0: 1.42, y1: 1.6 },
    head: { r: 0.1, y: 1.64 },
    hair: "short",
    chestY: 1.3,
    waistY: 1.07,
    hipY: 0.93,
    thighY: 0.72,
  },
  female: {
    torso: [
      [0.775, 0.05, 0.03, 0.035, 2.0],
      [0.79, 0.125, 0.066, 0.084, 2.1],
      [0.83, 0.162, 0.087, 0.112, 2.2],
      [0.89, 0.18, 0.094, 0.126, 2.25],
      [0.94, 0.182, 0.094, 0.127, 2.25],
      [1.0, 0.162, 0.088, 0.101, 2.2],
      [1.055, 0.13, 0.081, 0.079, 2.2],
      [1.12, 0.136, 0.083, 0.078, 2.25],
      [1.18, 0.146, 0.09, 0.081, 2.3],
      [1.215, 0.151, 0.112, 0.084, 2.25],
      [1.245, 0.154, 0.124, 0.086, 2.2],
      [1.28, 0.153, 0.114, 0.088, 2.25],
      [1.32, 0.152, 0.09, 0.088, 2.3],
      [1.355, 0.157, 0.074, 0.083, 2.35],
      [1.385, 0.157, 0.064, 0.074, 2.3],
      [1.41, 0.13, 0.055, 0.062, 2.2],
      [1.435, 0.085, 0.045, 0.049, 2.05],
      [1.452, 0.055, 0.04, 0.042, 2.0],
      [1.465, 0.043, 0.038, 0.04, 2.0],
    ],
    shoulder: { x: 0.17, y: 1.378, r: 0.049 },
    armTilt: 0.17,
    armPath: [[0, 0.018, 0], [0, -0.14, 0.004], [0, -0.285, 0.012], [0, -0.41, 0.025], [0, -0.53, 0.034]],
    armRadius: [[0, 0.043], [0.1, 0.042], [0.35, 0.036], [0.53, 0.029], [0.62, 0.032], [0.78, 0.028], [0.95, 0.022], [1, 0.021]],
    handScale: 0.9,
    legPath: [[0.081, 0.96, -0.01], [0.086, 0.7, 0.004], [0.083, 0.47, 0.013], [0.08, 0.26, -0.004], [0.078, 0.072, -0.012]],
    legRadius: [[0, 0.062], [0.06, 0.078], [0.13, 0.095], [0.25, 0.084], [0.42, 0.062], [0.5, 0.05], [0.58, 0.052], [0.68, 0.055], [0.85, 0.038], [1, 0.028]],
    neck: { r: 0.042, y0: 1.405, y1: 1.585 },
    head: { r: 0.094, y: 1.618 },
    hair: "bun",
    chestY: 1.24,
    waistY: 1.055,
    hipY: 0.92,
    thighY: 0.72,
  },
};

/* ══════════ Math helpers ══════════ */

/** Monotone cubic interpolation (Fritsch–Carlson) — smooth, never overshoots. */
export function monotone(xs: number[], ys: number[]): (x: number) => number {
  const n = xs.length;
  const d: number[] = [];
  const m: number[] = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * d[i];
      m[i + 1] = t * b * d[i];
    }
  }
  return (x: number) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i];
    const t = (x - xs[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
  };
}

export interface Section { rx: number; f: number; b: number; n: number }

/** Torso cross-section at height y. */
export function torsoSection(s: BodyShape): (y: number) => Section {
  const ys = s.torso.map((k) => k[0]);
  const rx = monotone(ys, s.torso.map((k) => k[1]));
  const f = monotone(ys, s.torso.map((k) => k[2]));
  const b = monotone(ys, s.torso.map((k) => k[3]));
  const n = monotone(ys, s.torso.map((k) => k[4]));
  return (y) => ({ rx: rx(y), f: f(y), b: b(y), n: n(y) });
}

/** Point on a superellipse cross-section; +z is the front. */
function sectionPoint(sec: Section, theta: number, scale = 1, pad = 0): [number, number] {
  const c = Math.cos(theta);
  const sn = Math.sin(theta);
  const e = 2 / sec.n;
  const x = (sec.rx * scale + pad) * Math.sign(c) * Math.pow(Math.abs(c), e);
  const depth = sn >= 0 ? sec.f : sec.b;
  const z = (depth * scale + pad) * Math.sign(sn) * Math.pow(Math.abs(sn), e);
  return [x, z];
}

const vec = (p: V3) => new THREE.Vector3(p[0], p[1], p[2]);

export const armCurve = (s: BodyShape) => new THREE.CatmullRomCurve3(s.armPath.map(vec), false, "centripetal");
export const legCurve = (s: BodyShape) => new THREE.CatmullRomCurve3(s.legPath.map(vec), false, "centripetal");
export const armRadiusFn = (s: BodyShape) => monotone(s.armRadius.map((k) => k[0]), s.armRadius.map((k) => k[1]));
export const legRadiusFn = (s: BodyShape) => monotone(s.legRadius.map((k) => k[0]), s.legRadius.map((k) => k[1]));

/** Arm local → world (shoulder joint + A-pose tilt) for the right arm (+x). */
export function armToWorld(s: BodyShape, p: THREE.Vector3): THREE.Vector3 {
  const c = Math.cos(s.armTilt);
  const sn = Math.sin(s.armTilt);
  return new THREE.Vector3(s.shoulder.x + p.x * c - p.y * sn, s.shoulder.y + p.x * sn + p.y * c, p.z);
}

/* ══════════ Geometry builders ══════════ */

/** Torso surface from cross-sections, closed at both ends, no seam. */
export function torsoGeometry(s: BodyShape, rings = 120, seg = 80): THREE.BufferGeometry {
  const section = torsoSection(s);
  const y0 = s.torso[0][0];
  const y1 = s.torso[s.torso.length - 1][0];
  const pos: number[] = [];
  const idx: number[] = [];

  for (let i = 0; i <= rings; i++) {
    const y = y0 + ((y1 - y0) * i) / rings;
    const sec = section(y);
    for (let j = 0; j < seg; j++) {
      const [x, z] = sectionPoint(sec, (j / seg) * Math.PI * 2);
      pos.push(x, y, z);
    }
  }
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < seg; j++) {
      const a = i * seg + j;
      const b = i * seg + ((j + 1) % seg);
      const c = (i + 1) * seg + j;
      const d = (i + 1) * seg + ((j + 1) % seg);
      idx.push(a, c, b, b, c, d);
    }
  }
  // caps
  const bottom = pos.length / 3;
  pos.push(0, y0 - 0.004, 0);
  const top = pos.length / 3;
  pos.push(0, y1 + 0.004, 0);
  for (let j = 0; j < seg; j++) {
    const jn = (j + 1) % seg;
    idx.push(bottom, j, jn);
    idx.push(top, rings * seg + jn, rings * seg + j);
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Tube swept along a curve with a varying radius, capped at both ends. */
export function sweepGeometry(curve: THREE.Curve<THREE.Vector3>, radius: (t: number) => number, tubular = 72, radial = 28): THREE.BufferGeometry {
  const frames = curve.computeFrenetFrames(tubular, false);
  const pos: number[] = [];
  const idx: number[] = [];
  const p = new THREE.Vector3();
  for (let i = 0; i <= tubular; i++) {
    const t = i / tubular;
    curve.getPointAt(t, p);
    const N = frames.normals[i];
    const B = frames.binormals[i];
    const r = radius(t);
    for (let j = 0; j < radial; j++) {
      const v = (j / radial) * Math.PI * 2;
      const cx = Math.cos(v) * r;
      const cy = Math.sin(v) * r;
      pos.push(p.x + N.x * cx + B.x * cy, p.y + N.y * cx + B.y * cy, p.z + N.z * cx + B.z * cy);
    }
  }
  for (let i = 0; i < tubular; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * radial + j;
      const b = i * radial + ((j + 1) % radial);
      const c = (i + 1) * radial + j;
      const d = (i + 1) * radial + ((j + 1) % radial);
      idx.push(a, b, c, b, d, c);
    }
  }
  const start = pos.length / 3;
  const s0 = curve.getPointAt(0);
  pos.push(s0.x, s0.y, s0.z);
  const end = pos.length / 3;
  const s1 = curve.getPointAt(1);
  pos.push(s1.x, s1.y, s1.z);
  for (let j = 0; j < radial; j++) {
    const jn = (j + 1) % radial;
    idx.push(start, jn, j);
    idx.push(end, tubular * radial + j, tubular * radial + jn);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/* ══════════ Head, hair, neck ══════════ */

const gauss = (x: number, y: number, sx: number, sy: number) => Math.exp(-((x / sx) ** 2 + (y / sy) ** 2));

/** Sculpt a unit-sphere direction into a doll head (faceless, soft features). */
function sculptHead(u: THREE.Vector3, gender: Gender): THREE.Vector3 {
  const { x, y, z } = u;
  const female = gender === "female";
  let sx = female ? 0.78 : 0.8;
  const sy = 1.0;
  let sz = 0.93;
  if (y < 0) {
    const k = Math.pow(-y, 1.6);
    sx *= 1 - (female ? 0.34 : 0.28) * k; // jaw narrows towards the chin
    sz *= 1 - 0.1 * k;
  }
  if (z < 0 && y > -0.35) sz *= 1.07; // fuller back of the skull

  let X = x * sx;
  const Y = y * sy;
  let Z = z * sz;
  if (Z > 0.6) Z = 0.6 + (Z - 0.6) * 0.55; // flatter face plane

  const front = Math.max(0, z);
  Z += 0.055 * gauss(x, y + 0.8, 0.22, 0.14) * front; // chin
  const noseLen = Math.min(1.6, Math.max(0, 1 - (y + 0.02) * 2.2)); // tip lower than the bridge
  Z += (female ? 0.11 : 0.14) * gauss(x, y + 0.1, 0.07, 0.19) * front * noseLen; // nose
  Z += 0.02 * gauss(x, y - 0.17, 0.42, 0.07) * front; // brow
  for (const side of [-1, 1]) Z -= 0.032 * gauss(x - side * 0.3, y - 0.04, 0.13, 0.085) * front; // eye hollows
  Z += 0.012 * gauss(x, y + 0.5, 0.15, 0.045) * front; // lips
  X *= 1 + 0.03 * gauss(0, y + 0.15, 1, 0.25); // cheekbones

  return new THREE.Vector3(X, Y, Z);
}

/** Hairline height (in unit-sphere y) by azimuth: high at the forehead, low at the nape.
 *  h(θ) = a + b·cosθ + c·cos2θ, solved so h(0)=front, h(±π/2)=side, h(π)=back. */
function hairline(u: THREE.Vector3, gender: Gender): number {
  const theta = Math.atan2(u.x, u.z); // 0 = front
  const [front, side, back] = gender === "female" ? [0.4, 0.02, -0.6] : [0.44, 0.14, -0.32];
  const b = (front - back) / 2;
  const a = ((front + back) / 2 + side) / 2;
  const c = ((front + back) / 2 - side) / 2;
  return a + b * Math.cos(theta) + c * Math.cos(2 * theta);
}

function sphereGrid(widthSeg = 96, heightSeg = 72) {
  const g = new THREE.SphereGeometry(1, widthSeg, heightSeg);
  g.deleteAttribute("normal");
  g.deleteAttribute("uv");
  return mergeVertices(g);
}

export function headGeometry(r: number, gender: Gender): THREE.BufferGeometry {
  const g = sphereGrid();
  const pos = g.getAttribute("position") as THREE.BufferAttribute;
  const u = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    u.fromBufferAttribute(pos, i).normalize();
    const p = sculptHead(u, gender).multiplyScalar(r);
    pos.setXYZ(i, p.x, p.y, p.z);
  }
  g.computeVertexNormals();
  return g;
}

/** Sculpted hair shell. Vertices below the hairline are slid up onto it, so the edge is a
 *  smooth curve (no jagged triangles), and the shell thins to the skin at the hairline. */
export function hairGeometry(r: number, gender: Gender): THREE.BufferGeometry {
  const g = sphereGrid(128, 96);
  const pos = g.getAttribute("position") as THREE.BufferAttribute;
  const u = new THREE.Vector3();
  const female = gender === "female";
  for (let i = 0; i < pos.count; i++) {
    u.fromBufferAttribute(pos, i).normalize();
    const h = hairline(u, gender);
    if (u.y < h) {
      // keep the azimuth, move up to the hairline
      const ring = Math.sqrt(Math.max(0, 1 - h * h));
      const horiz = Math.hypot(u.x, u.z) || 1;
      u.set((u.x / horiz) * ring, h, (u.z / horiz) * ring);
    }
    const above = THREE.MathUtils.smoothstep(u.y - h, 0, 0.16); // 0 at the hairline → 1 inside
    const lift = 1.002 + above * (0.028 + 0.03 * Math.max(0, u.y) + (female ? 0.012 : 0));
    const p = sculptHead(u, gender).multiplyScalar(r * lift);
    pos.setXYZ(i, p.x, p.y, p.z);
  }
  g.computeVertexNormals();
  return g;
}

/** Neck that flares into the trapezius at the base. */
export function neckGeometry(s: BodyShape): THREE.BufferGeometry {
  const { r, y0, y1 } = s.neck;
  const prof: [number, number][] = [
    [y0, r * 1.75], [y0 + 0.02, r * 1.3], [y0 + 0.05, r * 1.08], [y0 + 0.1, r], [y1 - 0.03, r * 0.94], [y1, r * 0.9],
  ];
  const pts = prof.map(([y, rr]) => new THREE.Vector2(rr, y));
  const curve = new THREE.SplineCurve(pts);
  const g = new THREE.LatheGeometry(curve.getPoints(40), 48);
  g.computeVertexNormals();
  return g;
}

/* ══════════ Measurement markers ══════════ */

export interface MarkerDef {
  key: MeasureKey;
  curve: THREE.Curve<THREE.Vector3>;
  closed: boolean;
  /** world position for the floating label */
  label: THREE.Vector3;
  /** camera focus: orbit target and camera position */
  target: THREE.Vector3;
  camera: THREE.Vector3;
}

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Ring hugging the torso at height y. */
function torsoRing(s: BodyShape, y: number, frontOverride?: number) {
  const sec = { ...torsoSection(s)(y) };
  if (frontOverride) sec.f = Math.max(sec.f, frontOverride);
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < 96; i++) {
    const [x, z] = sectionPoint(sec, (i / 96) * Math.PI * 2, 1.02, 0.004);
    pts.push(v(x, y, z));
  }
  return new THREE.CatmullRomCurve3(pts, true);
}

/** Point on the leg path at height y, with the leg radius there. */
function legAt(s: BodyShape, y: number) {
  const curve = legCurve(s);
  const r = legRadiusFn(s);
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i <= 200; i++) {
    const t = i / 200;
    const d = Math.abs(curve.getPointAt(t).y - y);
    if (d < bestD) { bestD = d; best = t; }
  }
  return { p: curve.getPointAt(best), r: r(best) };
}

export function buildMarkers(gender: Gender): MarkerDef[] {
  const s = SHAPES[gender];
  const section = torsoSection(s);
  const sx = s.shoulder.x;
  const sy = s.shoulder.y;
  const front = (y: number) => section(y).f + 0.006;
  const back = (y: number) => section(y).b + 0.006;

  // chest tape passes over the bust on the female figure
  const bustFront = s.bust ? s.bust.z + s.bust.r * 0.75 : undefined;
  const chest = section(s.chestY);

  // sleeve: shoulder tip → down the outer side of the arm → wrist
  const arm = armCurve(s);
  const armR = armRadiusFn(s);
  const sleevePts: THREE.Vector3[] = [armToWorld(s, v(-0.012, s.shoulder.r * 0.95, 0))];
  for (let i = 1; i <= 10; i++) {
    const t = i / 10;
    const p = arm.getPointAt(t);
    sleevePts.push(armToWorld(s, v(p.x + armR(t) + 0.006, p.y, p.z)));
  }

  const thigh = legAt(s, s.thighY);
  const thighRing: THREE.Vector3[] = [];
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    thighRing.push(v(thigh.p.x + Math.cos(a) * (thigh.r + 0.006), s.thighY, thigh.p.z + Math.sin(a) * (thigh.r + 0.006)));
  }

  const riseYs = (from: number) => [from, (from + s.hipY) / 2, s.hipY, 0.86, 0.82];

  return [
    {
      key: "chest",
      curve: torsoRing(s, s.chestY, bustFront),
      closed: true,
      label: v(chest.rx + 0.09, s.chestY + 0.03, chest.f),
      target: v(0, s.chestY, 0),
      camera: v(0.42, s.chestY + 0.1, 1.2),
    },
    {
      key: "shoulder",
      curve: new THREE.CatmullRomCurve3([
        v(-(sx + 0.05), sy + 0.02, 0),
        v(-sx, sy + 0.048, -0.035),
        v(-0.1, sy + 0.055, -back(sy + 0.03) * 0.95),
        v(0, sy + 0.06, -back(sy + 0.03)),
        v(0.1, sy + 0.055, -back(sy + 0.03) * 0.95),
        v(sx, sy + 0.048, -0.035),
        v(sx + 0.05, sy + 0.02, 0),
      ]),
      closed: false,
      label: v(0, sy + 0.13, -back(sy)),
      target: v(0, sy, 0),
      camera: v(0.35, sy + 0.25, -1.15),
    },
    {
      key: "waist",
      curve: torsoRing(s, s.waistY),
      closed: true,
      label: v(section(s.waistY).rx + 0.09, s.waistY + 0.03, front(s.waistY)),
      target: v(0, s.waistY, 0),
      camera: v(0.4, s.waistY + 0.08, 1.25),
    },
    {
      key: "sleeve_length",
      curve: new THREE.CatmullRomCurve3(sleevePts),
      closed: false,
      label: armToWorld(s, v(0.12, -0.25, 0)),
      target: armToWorld(s, v(0, -0.26, 0)),
      camera: v(1.05, 1.22, 0.95),
    },
    {
      key: "arm_hole",
      curve: (() => {
        const pts: THREE.Vector3[] = [];
        const ry = s.shoulder.r * 1.45;
        const rz = section(sy - 0.06).f * 0.92;
        for (let i = 0; i < 64; i++) {
          const a = (i / 64) * Math.PI * 2;
          const y = ry * Math.sin(a);
          pts.push(v(sx - 0.012 + y * Math.sin(s.armTilt) * 0.6, sy - 0.05 + y, rz * Math.cos(a)));
        }
        return new THREE.CatmullRomCurve3(pts, true);
      })(),
      closed: true,
      label: v(sx + 0.13, sy + 0.08, 0.05),
      target: v(sx, sy - 0.05, 0),
      camera: v(1.0, sy + 0.08, 0.55),
    },
    {
      key: "hip",
      curve: torsoRing(s, s.hipY),
      closed: true,
      label: v(section(s.hipY).rx + 0.09, s.hipY + 0.03, front(s.hipY)),
      target: v(0, s.hipY, 0),
      camera: v(0.45, s.hipY + 0.08, 1.35),
    },
    {
      key: "thigh",
      curve: new THREE.CatmullRomCurve3(thighRing, true),
      closed: true,
      label: v(thigh.p.x + thigh.r + 0.09, s.thighY + 0.02, 0.05),
      target: v(thigh.p.x * 0.6, s.thighY, 0),
      camera: v(0.65, s.thighY + 0.1, 1.15),
    },
    {
      key: "front_rise",
      curve: new THREE.CatmullRomCurve3([
        ...riseYs(s.waistY).map((y) => v(0, y, front(y))),
        v(0, 0.795, section(0.795).f * 0.7),
        v(0, 0.778, 0.0),
      ]),
      closed: false,
      label: v(0.1, s.hipY + 0.03, front(s.hipY) + 0.05),
      target: v(0, 0.93, 0.05),
      camera: v(0.95, 0.98, 0.95),
    },
    {
      key: "back_rise",
      curve: new THREE.CatmullRomCurve3([
        ...riseYs(s.waistY).map((y) => v(0, y, -back(y))),
        v(0, 0.795, -section(0.795).b * 0.7),
        v(0, 0.778, 0.0),
      ]),
      closed: false,
      label: v(0.1, s.hipY + 0.05, -back(s.hipY) - 0.05),
      target: v(0, 0.93, -0.05),
      camera: v(0.95, 1.0, -1.0),
    },
  ];
}

/** Whole-figure camera views. */
export const OVERVIEW: Record<BodyType, { target: THREE.Vector3; camera: THREE.Vector3 }> = {
  top: { target: v(0, 1.2, 0), camera: v(0.5, 1.32, 1.85) },
  bottom: { target: v(0, 0.8, 0), camera: v(0.5, 0.92, 2.1) },
};
