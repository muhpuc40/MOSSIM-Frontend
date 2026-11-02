"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Html, OrbitControls } from "@react-three/drei";
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
  buildMarkers,
  latheGeometry,
} from "./shape";

const ACCENT = "#ECB018"; // theme "yellow" — MOSSIM gold
const SKIN = "#ebe5dc";

/* ══════════ Mannequin ══════════ */

function Mannequin({ gender }: { gender: Gender }) {
  const s = SHAPES[gender];

  const geo = useMemo(
    () => ({
      torso: latheGeometry(s.torso, 64),
      upper: latheGeometry(s.upperArm),
      fore: latheGeometry(s.forearm),
      leg: latheGeometry(s.leg),
    }),
    [s],
  );
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);

  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.6, metalness: 0.02 }),
    [],
  );

  const elbowY = s.upperArm[s.upperArm.length - 1][0];
  const elbowR = s.upperArm[s.upperArm.length - 1][1];
  const wristY = s.forearm[s.forearm.length - 1][0];

  return (
    <group>
      {/* Torso — circular lathe squashed front-to-back */}
      <mesh geometry={geo.torso} material={mat} scale={[1, 1, s.depth]} />

      {s.bust &&
        [-1, 1].map((side) => (
          <mesh key={`bust${side}`} material={mat} position={[side * s.bust!.x, s.bust!.y, s.bust!.z]} scale={[1.05, 0.88, 0.68]}>
            <sphereGeometry args={[s.bust!.r, 32, 24]} />
          </mesh>
        ))}

      {/* Neck + head */}
      <mesh material={mat} position={[0, (s.neck.y0 + s.neck.y1) / 2, 0]}>
        <cylinderGeometry args={[s.neck.r * 0.92, s.neck.r * 1.1, s.neck.y1 - s.neck.y0, 32]} />
      </mesh>
      <mesh material={mat} position={[0, s.head.y, 0.008]} scale={[0.82, 1, 0.92]}>
        <sphereGeometry args={[s.head.r, 48, 32]} />
      </mesh>

      {[-1, 1].map((side) => (
        <group key={side}>
          {/* Shoulder cap + trapezius */}
          <mesh material={mat} position={[side * s.shoulder.x, s.shoulder.y, 0]} scale={[1, 0.95, 0.85]}>
            <sphereGeometry args={[s.shoulder.r, 32, 24]} />
          </mesh>
          <mesh
            material={mat}
            position={[(side * s.shoulder.x) / 2, s.shoulder.y + 0.028, -0.006]}
            rotation={[0, 0, side * (Math.PI / 2 - 0.26)]}
            scale={[1, 1, 0.8]}>
            <capsuleGeometry args={[s.trapR, s.shoulder.x * 0.8, 8, 16]} />
          </mesh>

          {/* Arm (A-pose) */}
          <group position={[side * s.shoulder.x, s.shoulder.y, 0]} rotation={[0, 0, side * s.armTilt]}>
            <mesh geometry={geo.upper} material={mat} />
            <mesh material={mat} position={[0, elbowY, 0]}>
              <sphereGeometry args={[elbowR, 24, 16]} />
            </mesh>
            <mesh geometry={geo.fore} material={mat} />
            <mesh material={mat} position={[0, wristY - 0.045, 0.004]} scale={[0.62, 1.25, 0.4]}>
              <sphereGeometry args={[0.042, 24, 16]} />
            </mesh>
          </group>

          {/* Leg + foot */}
          <group position={[side * s.legX, 0, 0]}>
            <mesh geometry={geo.leg} material={mat} />
            <mesh material={mat} position={[0, 0.034, 0.045]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.72]}>
              <capsuleGeometry args={[0.033, 0.12, 8, 16]} />
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
}

export default function BodyViewer({ gender, bodyType, active }: Props) {
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
        <hemisphereLight args={["#ffffff", "#d9d1c5", 1.15]} />
        <directionalLight position={[2, 3.2, 2.6]} intensity={1.55} />
        <directionalLight position={[-2.6, 2, -2.2]} intensity={0.75} />
        <directionalLight position={[0, 1, 3]} intensity={0.25} />

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
          {gender} · {bodyType}
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
