/**
 * Procedural mannequin — no GLB needed.
 * All numbers are in metres for a ~1.75 m figure facing +Z.
 * Profiles are [y, radius] pairs, smoothed with a Catmull-Rom spline.
 */
import * as THREE from "three";

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

export interface BodyShape {
  torso: [number, number][];
  depth: number; // z scale of the torso cross-section
  shoulder: { x: number; y: number; r: number };
  trapR: number;
  armTilt: number;
  upperArm: [number, number][]; // local y (≤0), radius
  forearm: [number, number][];
  legX: number;
  leg: [number, number][];
  neck: { r: number; y0: number; y1: number };
  head: { r: number; y: number };
  bust?: { x: number; y: number; z: number; r: number };
  chestY: number;
  waistY: number;
  hipY: number;
  thighY: number;
}

export const SHAPES: Record<Gender, BodyShape> = {
  male: {
    torso: [
      [0.775, 0.02], [0.8, 0.11], [0.85, 0.16], [0.92, 0.172], [0.99, 0.158],
      [1.06, 0.146], [1.14, 0.155], [1.22, 0.172], [1.3, 0.18], [1.37, 0.176],
      [1.42, 0.158], [1.455, 0.1], [1.475, 0.05],
    ],
    depth: 0.62,
    shoulder: { x: 0.195, y: 1.405, r: 0.062 },
    trapR: 0.046,
    armTilt: 0.2,
    upperArm: [[0, 0.05], [-0.05, 0.048], [-0.15, 0.043], [-0.27, 0.037], [-0.3, 0.034]],
    forearm: [[-0.3, 0.034], [-0.36, 0.04], [-0.46, 0.034], [-0.54, 0.028], [-0.56, 0.026]],
    legX: 0.088,
    leg: [
      [0.06, 0.032], [0.1, 0.036], [0.2, 0.048], [0.32, 0.058], [0.4, 0.052],
      [0.47, 0.048], [0.55, 0.058], [0.65, 0.075], [0.74, 0.088], [0.82, 0.095], [0.88, 0.085],
    ],
    neck: { r: 0.05, y0: 1.44, y1: 1.58 },
    head: { r: 0.098, y: 1.665 },
    chestY: 1.29,
    waistY: 1.06,
    hipY: 0.92,
    thighY: 0.72,
  },
  female: {
    torso: [
      [0.775, 0.02], [0.8, 0.12], [0.86, 0.168], [0.92, 0.18], [0.99, 0.159],
      [1.05, 0.128], [1.12, 0.137], [1.2, 0.15], [1.27, 0.155], [1.34, 0.15],
      [1.4, 0.14], [1.44, 0.09], [1.46, 0.045],
    ],
    depth: 0.64,
    shoulder: { x: 0.172, y: 1.385, r: 0.052 },
    trapR: 0.036,
    armTilt: 0.17,
    upperArm: [[0, 0.043], [-0.05, 0.042], [-0.15, 0.038], [-0.26, 0.032], [-0.29, 0.03]],
    forearm: [[-0.29, 0.03], [-0.35, 0.034], [-0.45, 0.029], [-0.52, 0.024], [-0.54, 0.023]],
    legX: 0.085,
    leg: [
      [0.06, 0.029], [0.1, 0.033], [0.2, 0.045], [0.32, 0.055], [0.4, 0.05],
      [0.47, 0.047], [0.55, 0.06], [0.65, 0.08], [0.74, 0.096], [0.82, 0.104], [0.88, 0.09],
    ],
    neck: { r: 0.043, y0: 1.42, y1: 1.56 },
    head: { r: 0.093, y: 1.64 },
    bust: { x: 0.056, y: 1.24, z: 0.072, r: 0.07 },
    chestY: 1.25,
    waistY: 1.05,
    hipY: 0.92,
    thighY: 0.72,
  },
};

/* ── Geometry helpers ─────────────────────────────── */

/** Smooth a [y, r] profile into lathe points (ascending y). */
export function smoothProfile(points: [number, number][], samples = 72): THREE.Vector2[] {
  const sorted = [...points].sort((a, b) => a[0] - b[0]);
  const curve = new THREE.CatmullRomCurve3(
    sorted.map(([y, r]) => new THREE.Vector3(r, y, 0)),
    false,
    "centripetal",
  );
  return curve.getPoints(samples).map((p) => new THREE.Vector2(Math.max(p.x, 0.001), p.y));
}

/** Radius of a smoothed profile at height y (linear interpolation). */
export function radiusAt(profile: THREE.Vector2[], y: number): number {
  if (y <= profile[0].y) return profile[0].x;
  for (let i = 1; i < profile.length; i++) {
    const a = profile[i - 1];
    const b = profile[i];
    if (y <= b.y) {
      const t = (y - a.y) / (b.y - a.y || 1);
      return a.x + (b.x - a.x) * t;
    }
  }
  return profile[profile.length - 1].x;
}

export function latheGeometry(points: [number, number][], segments = 48) {
  const geo = new THREE.LatheGeometry(smoothProfile(points), segments);
  geo.computeVertexNormals();
  return geo;
}

/* ── Measurement markers ──────────────────────────── */

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

function ellipseRing(cx: number, y: number, cz: number, rx: number, rz: number) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < 64; i++) {
    const t = (i / 64) * Math.PI * 2;
    pts.push(v(cx + rx * Math.cos(t), y, cz + rz * Math.sin(t)));
  }
  return new THREE.CatmullRomCurve3(pts, true);
}

/** Arm-hole loop: vertical ellipse around the shoulder joint. */
function armHoleRing(cx: number, cy: number, ry: number, rz: number, tilt: number) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < 64; i++) {
    const t = (i / 64) * Math.PI * 2;
    const y = ry * Math.sin(t);
    const z = rz * Math.cos(t);
    // lean the loop slightly with the arm
    pts.push(v(cx + y * Math.sin(tilt) * 0.6, cy + y, z));
  }
  return new THREE.CatmullRomCurve3(pts, true);
}

export function buildMarkers(gender: Gender): MarkerDef[] {
  const s = SHAPES[gender];
  const torso = smoothProfile(s.torso);
  const leg = smoothProfile(s.leg);
  const front = (y: number, k = 1) => radiusAt(torso, y) * s.depth * k + 0.007;
  const sx = s.shoulder.x;
  const sy = s.shoulder.y;

  // chest ring must clear the bust on the female figure
  const chestR = radiusAt(torso, s.chestY);
  const chestFront = s.bust ? (s.bust.z + s.bust.r * 0.68) * 1.08 : chestR * s.depth;

  // sleeve: shoulder tip → outer arm → wrist (right arm, +x)
  const c = Math.cos(s.armTilt);
  const sn = Math.sin(s.armTilt);
  const armPoint = (lx: number, ly: number) => v(sx + lx * c - ly * sn, sy + lx * sn + ly * c, 0.0);
  const upperR = s.upperArm[0][1];
  const wristY = s.forearm[s.forearm.length - 1][0];

  const backZ = front(sy) + 0.01;

  return [
    {
      key: "chest",
      curve: ellipseRing(0, s.chestY, 0, chestR * 1.035, chestFront * 1.07),
      closed: true,
      label: v(chestR + 0.08, s.chestY + 0.03, chestFront),
      target: v(0, s.chestY, 0),
      camera: v(0.42, s.chestY + 0.1, 1.2),
    },
    {
      key: "shoulder",
      curve: new THREE.CatmullRomCurve3([
        v(-(sx + 0.05), sy + 0.02, 0),
        v(-sx, sy + 0.045, -0.04),
        v(-0.09, sy + 0.06, -backZ * 0.92),
        v(0, sy + 0.065, -backZ),
        v(0.09, sy + 0.06, -backZ * 0.92),
        v(sx, sy + 0.045, -0.04),
        v(sx + 0.05, sy + 0.02, 0),
      ]),
      closed: false,
      label: v(0, sy + 0.14, -backZ),
      target: v(0, sy, 0),
      camera: v(0.35, sy + 0.25, -1.15),
    },
    {
      key: "waist",
      curve: ellipseRing(0, s.waistY, 0, radiusAt(torso, s.waistY) * 1.04, front(s.waistY) * 1.04),
      closed: true,
      label: v(radiusAt(torso, s.waistY) + 0.08, s.waistY + 0.03, front(s.waistY)),
      target: v(0, s.waistY, 0),
      camera: v(0.4, s.waistY + 0.08, 1.25),
    },
    {
      key: "sleeve_length",
      curve: new THREE.CatmullRomCurve3([
        armPoint(-0.01, s.shoulder.r * 0.95),
        armPoint(upperR + 0.012, -0.04),
        armPoint(upperR + 0.006, -0.16),
        armPoint(s.forearm[0][1] + 0.008, s.forearm[0][0]),
        armPoint(s.forearm[1][1] + 0.008, s.forearm[1][0]),
        armPoint(s.forearm[3][1] + 0.006, s.forearm[3][0]),
        armPoint(0.02, wristY - 0.005),
      ]),
      closed: false,
      label: armPoint(0.12, -0.25),
      target: armPoint(0, -0.26),
      camera: v(1.05, 1.22, 0.95),
    },
    {
      key: "arm_hole",
      curve: armHoleRing(sx - 0.01, sy - 0.05, s.shoulder.r * 1.4, chestR * s.depth * 0.82, s.armTilt),
      closed: true,
      label: v(sx + 0.13, sy + 0.08, 0.05),
      target: v(sx, sy - 0.05, 0),
      camera: v(1.0, sy + 0.08, 0.55),
    },
    {
      key: "hip",
      curve: ellipseRing(0, s.hipY, 0, radiusAt(torso, s.hipY) * 1.04, front(s.hipY, 1.05) * 1.04),
      closed: true,
      label: v(radiusAt(torso, s.hipY) + 0.08, s.hipY + 0.03, front(s.hipY)),
      target: v(0, s.hipY, 0),
      camera: v(0.45, s.hipY + 0.08, 1.35),
    },
    {
      key: "thigh",
      curve: ellipseRing(s.legX, s.thighY, 0, radiusAt(leg, s.thighY) * 1.1, radiusAt(leg, s.thighY) * 1.1),
      closed: true,
      label: v(s.legX + radiusAt(leg, s.thighY) + 0.08, s.thighY + 0.02, 0.05),
      target: v(s.legX * 0.6, s.thighY, 0),
      camera: v(0.65, s.thighY + 0.1, 1.15),
    },
    {
      key: "front_rise",
      curve: new THREE.CatmullRomCurve3([
        v(0, s.waistY, front(s.waistY)),
        v(0, (s.waistY + s.hipY) / 2, front((s.waistY + s.hipY) / 2)),
        v(0, s.hipY, front(s.hipY)),
        v(0, 0.85, front(0.85) * 0.88),
        v(0, 0.805, front(0.805) * 0.55),
        v(0, 0.785, 0.0),
      ]),
      closed: false,
      label: v(0.1, s.hipY + 0.03, front(s.hipY) + 0.05),
      target: v(0, 0.93, 0.05),
      camera: v(0.95, 0.98, 0.95),
    },
    {
      key: "back_rise",
      curve: new THREE.CatmullRomCurve3([
        v(0, s.waistY, -front(s.waistY)),
        v(0, (s.waistY + s.hipY) / 2, -front((s.waistY + s.hipY) / 2, 1.06)),
        v(0, s.hipY, -front(s.hipY, 1.1)),
        v(0, 0.85, -front(0.85, 1.0)),
        v(0, 0.805, -front(0.805) * 0.6),
        v(0, 0.785, 0.0),
      ]),
      closed: false,
      label: v(0.1, s.hipY + 0.05, -front(s.hipY) - 0.05),
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
