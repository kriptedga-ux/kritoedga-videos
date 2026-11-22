import { useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useState } from "react";
import { continueRender, delayRender } from "remotion";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export const Env: React.FC = () => {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const tex = pm.fromScene(new RoomEnvironment(), 0.02).texture;
    scene.environment = tex;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.35;
    return () => {
      tex.dispose();
      pm.dispose();
    };
  }, [gl, scene]);
  return null;
};

// Superellipse cross-section rotated around Y -> ceramic ring band
const ringGeometry = () => {
  const pts: THREE.Vector2[] = [];
  const r0 = 1.0;
  const a = 0.11; // radial half-thickness
  const b = 0.36; // band half-height
  const n = 4.5;
  const N = 160;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const x = r0 + a * Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
    const y = b * Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
    pts.push(new THREE.Vector2(x, y));
  }
  const g = new THREE.LatheGeometry(pts, 256);
  g.computeVertexNormals();
  return g;
};

export const Ring: React.FC<{
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}> = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) => {
  const geo = useMemo(ringGeometry, []);
  return (
    <mesh geometry={geo} position={position} rotation={rotation} scale={scale}>
      <meshPhysicalMaterial
        color="#1c1c24"
        metalness={0.35}
        roughness={0.14}
        clearcoat={1}
        clearcoatRoughness={0.05}
        reflectivity={0.8}
      />
    </mesh>
  );
};

const cardTexture = (variant: number) => {
  const W = 1712;
  const H = 1080;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const x = c.getContext("2d")!;
  const g = x.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, variant === 0 ? "#1d1d24" : "#24242c");
  g.addColorStop(1, "#0b0b0f");
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  // subtle diagonal sheen lines
  x.globalAlpha = 0.05;
  x.strokeStyle = "#ffffff";
  for (let i = -H; i < W; i += 26) {
    x.beginPath();
    x.moveTo(i, 0);
    x.lineTo(i + H, H);
    x.stroke();
  }
  x.globalAlpha = 1;
  // chip
  const cg = x.createLinearGradient(170, 380, 420, 600);
  cg.addColorStop(0, "#f3d58a");
  cg.addColorStop(1, "#b88a2c");
  x.fillStyle = cg;
  x.beginPath();
  x.roundRect(170, 390, 250, 200, 34);
  x.fill();
  x.strokeStyle = "rgba(90,60,10,0.55)";
  x.lineWidth = 6;
  x.beginPath();
  x.moveTo(170, 490);
  x.lineTo(420, 490);
  x.moveTo(295, 390);
  x.lineTo(295, 590);
  x.stroke();
  // NFC arcs
  x.strokeStyle = "rgba(255,255,255,0.85)";
  x.lineWidth = 16;
  x.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    x.beginPath();
    x.arc(1380, 490, 60 + i * 55, -0.7, 0.7);
    x.stroke();
  }
  x.fillStyle = "rgba(255,255,255,0.75)";
  x.font = "600 62px Poppins";
  x.fillText(variant === 0 ? "HARDWARE WALLET" : "BACKUP CARD", 170, 930);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const cardShape = (w: number, h: number, r: number) => {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return s;
};

export const Card: React.FC<{
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  variant?: number;
}> = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, variant = 0 }) => {
  const W = 1.712;
  const H = 1.08;
  const D = 0.02;
  const body = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(cardShape(W, H, 0.09), {
      depth: D,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      bevelSegments: 4,
      curveSegments: 24,
    });
    g.translate(0, 0, -D / 2);
    return g;
  }, []);
  const face = useMemo(() => new THREE.ShapeGeometry(cardShape(W - 0.004, H - 0.004, 0.088), 24), []);
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("card font"));
  const { advance } = useThree();
  useEffect(() => {
    document.fonts.load('600 62px Poppins').then(() => setReady(true));
  }, []);
  const tex = useMemo(() => (ready ? cardTexture(variant) : null), [variant, ready]);
  useEffect(() => {
    if (!tex) return;
    requestAnimationFrame(() => {
      advance(performance.now());
      continueRender(handle);
    });
  }, [tex, advance, handle]);
  // ShapeGeometry UVs are in shape coordinates; remap to 0..1
  useMemo(() => {
    const uv = face.attributes.uv as THREE.BufferAttribute;
    const pos = face.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, pos.getX(i) / W + 0.5, pos.getY(i) / H + 0.5);
    }
    uv.needsUpdate = true;
  }, [face]);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={body}>
        <meshPhysicalMaterial color="#0e0e12" metalness={0.2} roughness={0.45} clearcoat={0.4} envMapIntensity={0.3} />
      </mesh>
      {tex ? (
        <mesh geometry={face} position={[0, 0, D / 2 + 0.0095]}>
          <meshPhysicalMaterial map={tex} metalness={0.1} roughness={0.4} clearcoat={0.6} clearcoatRoughness={0.15} envMapIntensity={0.28} />
        </mesh>
      ) : null}
    </group>
  );
};
