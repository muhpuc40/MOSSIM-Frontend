"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Html, OrbitControls } from "@react-three/drei";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  BOTTOM_FIELDS,
  BodyType,
  Gender,
  MEASURE_LABEL,
  MarkerDef,
  MeasureKey,
  OVERVIEW,
  SHAPES,
  TOP_FIELDS,
  armCurve,
  armRadiusFn,
  buildMarkers,
  hairGeometry,
  headGeometry,
  legCurve,
  legRadiusFn,
  neckGeometry,
  sweepGeometry,
  torsoGeometry,
} from "./shape";

const ACCENT = "#ECB018"; // theme "yellow" — MOSSIM gold
const SKIN = "#f0e4d7"; // warm porcelain
const HAIR = "#3b2f2a";

/* ══════════ Studio lighting (no network: built-in room environment) ══════════ */

function StudioEnvironment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.55;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

/* ══════════ Doll ══════════ */

function Mannequin({ gender }: { gender: Gender }) {
  const s = SHAPES[gender];

  const geo = useMemo(
    () => ({
      torso: torsoGeometry(s),
      arm: sweepGeometry(armCurve(s), armRadiusFn(s)),
      leg: sweepGeometry(legCurve(s), legRadiusFn(s), 96, 32),
      neck: neckGeometry(s),
      head: headGeometry(s.head.r, gender),
      hair: hairGeometry(s.head.r, gender),
    }),
    [s, gender],
  );
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);

  const skin = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: SKIN,
        roughness: 0.42,
        metalness: 0,
        clearcoat: 0.35,
        clearcoatRoughness: 0.45,
        sheen: 0.4,
        sheenRoughness: 0.6,
        sheenColor: new THREE.Color("#fff1e4"),
      }),
    [],
  );
  const hair = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: HAIR, roughness: 0.55, clearcoat: 0.5, clearcoatRoughness: 0.35 }),
    [],
  );
  useEffect(() => () => { skin.dispose(); hair.dispose(); }, [skin, hair]);

  const arm = useMemo(() => armCurve(s), [s]);
  const wrist = arm.getPointAt(1);
  const elbow = arm.getPointAt(0.53);
  const legEnd = s.legPath[s.legPath.length - 1];
  const h = s.head;

  return (
    <group>
      {/* Torso */}
      <mesh geometry={geo.torso} material={skin} />

      {/* Bust (female) — overlapping, flattened so it reads as one soft shape */}
      {s.bust &&
        [-1, 1].map((side) => (
          <mesh key={`bust${side}`} material={skin} position={[side * s.bust!.x, s.bust!.y, s.bust!.z]} scale={[1.05, 0.9, 0.72]}>
            <sphereGeometry args={[s.bust!.r, 40, 28]} />
          </mesh>
        ))}

      {/* Neck + sculpted head + hair */}
      <mesh geometry={geo.neck} material={skin} position={[0, 0, 0.004]} scale={[1, 1, 0.92]} />
      <group position={[0, h.y, 0.006]}>
        <mesh geometry={geo.head} material={skin} />
        {[-1, 1].map((side) => (
          <mesh key={`ear${side}`} material={skin} position={[side * h.r * 0.77, -h.r * 0.1, -h.r * 0.04]} rotation={[0, side * 0.25, 0]} scale={[0.34, 1, 0.62]}>
            <sphereGeometry args={[h.r * 0.21, 20, 14]} />
          </mesh>
        ))}
        <mesh geometry={geo.hair} material={hair} />
        {s.hair === "bun" && (
          <mesh material={hair} position={[0, h.r * 0.5, -h.r * 0.98]} scale={[1, 0.9, 0.88]}>
            <sphereGeometry args={[h.r * 0.4, 32, 24]} />
          </mesh>
        )}
      </group>

      {[-1, 1].map((side) => (
        <group key={side} scale={[side, 1, 1]}>
          {/* Shoulder cap + trapezius slope */}
          <mesh material={skin} position={[s.shoulder.x - 0.004, s.shoulder.y, -0.004]} scale={[0.96, 1.02, 0.88]}>
            <sphereGeometry args={[s.shoulder.r, 36, 28]} />
          </mesh>
          <mesh
            material={skin}
            position={[s.shoulder.x * 0.52, s.shoulder.y + 0.03, -0.01]}
            rotation={[0, 0, Math.PI / 2 - 0.3]}
            scale={[1, 1, 0.75]}>
            <capsuleGeometry args={[s.shoulder.r * 0.72, s.shoulder.x * 0.62, 10, 20]} />
          </mesh>

          {/* Arm (A-pose, soft elbow) + mitten hand with thumb */}
          <group position={[s.shoulder.x, s.shoulder.y, 0]} rotation={[0, 0, s.armTilt]}>
            <mesh geometry={geo.arm} material={skin} />
            <mesh material={skin} position={elbow}>
              <sphereGeometry args={[armRadiusFn(s)(0.53) * 1.02, 24, 18]} />
            </mesh>
            <group position={[wrist.x, wrist.y - 0.006, wrist.z + 0.004]} scale={s.handScale}>
              <mesh material={skin} position={[0, -0.05, 0.004]} rotation={[0.08, 0, 0]} scale={[0.42, 1.18, 0.88]}>
                <sphereGeometry args={[0.045, 32, 24]} />
              </mesh>
              <mesh material={skin} position={[0.004, -0.032, 0.03]} rotation={[0.55, 0, -0.15]} scale={[0.42, 1, 0.48]}>
                <sphereGeometry args={[0.024, 20, 14]} />
              </mesh>
            </group>
          </group>

          {/* Leg + knee + foot */}
          <mesh geometry={geo.leg} material={skin} />
          <group position={[legEnd[0], 0, legEnd[2]]}>
            <mesh material={skin} position={[0, 0.036, -0.012]} scale={[0.82, 0.78, 0.95]}>
              <sphereGeometry args={[0.04, 24, 18]} />
            </mesh>
            <mesh material={skin} position={[0, 0.03, 0.05]} rotation={[0.08, 0, 0]} scale={[0.74, 0.55, 2.0]}>
              <sphereGeometry args={[0.048, 32, 24]} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

/* ══════════ Measurement marker ══════════ */

function Marker({ def, active }: { def: MarkerDef; active: boolean }) {
  const segs = def.closed ? 160 : 96;
  const line = useMemo(
    () => new THREE.TubeGeometry(def.curve, segs, active ? 0.0058 : 0.003, 8, def.closed),
    [def, active, segs],
  );
  const glow = useMemo(() => new THREE.TubeGeometry(def.curve, segs, 0.012, 10, def.closed), [def, segs]);
  useEffect(() => () => { line.dispose(); glow.dispose(); }, [line, glow]);

  const glowMat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (glowMat.current) glowMat.current.opacity = 0.2 + 0.14 * Math.sin(clock.elapsedTime * 4);
  });

  const ends = useMemo(
    () => (def.closed ? [] : [def.curve.getPoint(0), def.curve.getPoint(1)]),
    [def],
  );

  return (
    <group>
      <mesh geometry={line} renderOrder={active ? 3 : 1}>
        <meshBasicMaterial
          color={active ? ACCENT : "#1F1F1F"}
          transparent
          opacity={active ? 1 : 0.22}
          depthWrite={false}
        />
      </mesh>

      {active && (
        <>
          <mesh geometry={glow} renderOrder={2}>
            <meshBasicMaterial ref={glowMat} color={ACCENT} transparent opacity={0.25} depthWrite={false} />
          </mesh>
          {ends.map((p, i) => (
            <mesh key={i} position={p} renderOrder={3}>
              <sphereGeometry args={[0.012, 16, 12]} />
              <meshBasicMaterial color={ACCENT} />
            </mesh>
          ))}
          <Html position={def.label} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
            <div
              style={{
                background: "#1F1F1F",
                color: "#fff",
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "nowrap",
                boxShadow: "0 4px 14px rgba(0,0,0,.18)",
              }}>
              {MEASURE_LABEL[def.key]}
            </div>
          </Html>
        </>
      )}
    </group>
  );
}

/* ══════════ Camera rig ══════════ */

type Goal = { target: THREE.Vector3; camera: THREE.Vector3 };

function CameraRig({ goal }: { goal: Goal }) {
  const { camera, controls, size } = useThree() as any;
  const animating = useRef(true);

  // narrow (mobile) canvases need the camera further back
  const scaled = useMemo(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const k = aspect < 0.75 ? 1.35 : aspect < 1 ? 1.15 : 1;
    const dir = goal.camera.clone().sub(goal.target).multiplyScalar(k);
    return { target: goal.target, camera: goal.target.clone().add(dir) };
  }, [goal, size.width, size.height]);

  useEffect(() => {
    animating.current = true;
  }, [scaled]);

  useEffect(() => {
    if (!controls) return;
    const stop = () => (animating.current = false);
    controls.addEventListener("start", stop);
    return () => controls.removeEventListener("start", stop);
  }, [controls]);

  useFrame((_, dt) => {
    if (!animating.current || !controls) return;
    const k = 1 - Math.exp(-dt * 4.5);
    camera.position.lerp(scaled.camera, k);
    controls.target.lerp(scaled.target, k);
    controls.update();
    if (camera.position.distanceTo(scaled.camera) < 0.002 && controls.target.distanceTo(scaled.target) < 0.002) {
      animating.current = false;
    }
  });

  return null;
}

/* ══════════ Viewer ══════════ */

interface Props {
  gender: Gender;
  bodyType: BodyType;
  active: MeasureKey | null;
  /** optional prefix for the chip, e.g. "Item 2" */
  label?: string;
}

export default function BodyViewer({ gender, bodyType, active, label }: Props) {
  const markers = useMemo(() => buildMarkers(gender), [gender]);
  const fields = bodyType === "top" ? TOP_FIELDS : BOTTOM_FIELDS;
  const visible = markers.filter((m) => fields.includes(m.key));
  const activeDef = active && fields.includes(active) ? markers.find((m) => m.key === active) ?? null : null;

  // manual view buttons override the auto focus until the next field change
  const [view, setView] = useState<"auto" | "front" | "back" | "overview">("auto");
  const [nonce, setNonce] = useState(0);
  useEffect(() => setView("auto"), [active, bodyType, gender]);

  const goal = useMemo<Goal>(() => {
    const o = OVERVIEW[bodyType];
    if (view === "front") return { target: o.target, camera: new THREE.Vector3(0, o.camera.y, o.camera.z) };
    if (view === "back") return { target: o.target, camera: new THREE.Vector3(0, o.camera.y, -o.camera.z) };
    if (view === "overview") return { target: o.target, camera: o.camera.clone() };
    if (activeDef) return { target: activeDef.target, camera: activeDef.camera };
    return o;
    // nonce forces a new goal object so "Reset" re-runs the animation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, activeDef, bodyType, nonce]);

  const btn =
    "caption2 font-semibold px-3 py-1.5 rounded-full border border-line bg-white/90 hover:bg-black hover:text-white hover:border-black duration-200";

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-b from-white to-surface border border-line">
      <Canvas
        camera={{ fov: 30, position: [0.55, 1.35, 2.15], near: 0.05, far: 20 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        fallback={
          <div className="w-full h-full flex items-center justify-center caption1 text-secondary p-6 text-center">
            3D preview is not supported on this device.
          </div>
        }>
        <StudioEnvironment />
        <hemisphereLight args={["#ffffff", "#e3d8ca", 0.75]} />
        <directionalLight position={[2.2, 3.4, 2.8]} intensity={1.35} />
        <directionalLight position={[-2.8, 2.2, -2.2]} intensity={0.8} color="#fff4ea" />
        <directionalLight position={[-1.5, 1.2, 2.5]} intensity={0.35} />

        <Mannequin gender={gender} />
        {visible.map((m) => (
          <Marker key={`${gender}-${m.key}`} def={m} active={activeDef?.key === m.key} />
        ))}

        <ContactShadows position={[0, 0.001, 0]} opacity={0.35} scale={2.2} blur={2.4} far={1.2} resolution={512} />
        <OrbitControls makeDefault enablePan={false} minDistance={0.55} maxDistance={3.6} minPolarAngle={0.2} maxPolarAngle={Math.PI - 0.35} />
        <CameraRig goal={goal} />
      </Canvas>

      {/* Overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none">
        <div className="caption2 font-semibold bg-white/90 border border-line rounded-full px-3 py-1 capitalize">
          {label ? `${label} · ` : ""}{gender} · {bodyType}
        </div>
        {activeDef && (
          <div className="caption2 font-semibold bg-black text-white rounded-full px-3 py-1">
            Measuring: {MEASURE_LABEL[activeDef.key]}
          </div>
        )}
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-2">
          <button type="button" className={btn} onClick={() => setView("front")}>Front</button>
          <button type="button" className={btn} onClick={() => setView("back")}>Back</button>
          <button type="button" className={btn} onClick={() => { setView("overview"); setNonce((n) => n + 1); }}>Reset</button>
        </div>
        <div className="caption2 text-secondary max-sm:hidden">Drag to rotate · Scroll to zoom</div>
      </div>
    </div>
  );
}
