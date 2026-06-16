"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { SceneInfo } from "@/hooks/use3DScene";

interface ProyectilProps {
  velocidad: number;
  angulo: number;
  onHover: (info: SceneInfo | null) => void;
}

function Proyectil({ velocidad, angulo, onHover }: ProyectilProps) {
  const ref = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  const [activo, setActivo] = useState(true);

  const g = 9.8;
  const rad = (angulo * Math.PI) / 180;
  const vx = velocidad * Math.cos(rad);
  const vy = velocidad * Math.sin(rad);
  const tTotal = (2 * vy) / g;

  useFrame((_, delta) => {
    if (!activo) return;
    t.current += delta * 0.8;
    if (t.current > tTotal) {
      t.current = 0;
    }
    if (ref.current) {
      ref.current.position.x = vx * t.current * 0.5;
      ref.current.position.y = (vy * t.current - 0.5 * g * t.current * t.current) * 0.5;
      ref.current.position.z = 0;
    }
  });

  // Trayectoria
  const puntos: THREE.Vector3[] = [];
  const pasos = 60;
  for (let i = 0; i <= pasos; i++) {
    const ti = (i / pasos) * tTotal;
    const x = vx * ti * 0.5;
    const y = (vy * ti - 0.5 * g * ti * ti) * 0.5;
    if (y >= 0) puntos.push(new THREE.Vector3(x, y, 0));
  }

  const alcanceMax = (vx * tTotal * 0.5).toFixed(1);
  const alturaMax = ((vy * vy) / (2 * g) * 0.5).toFixed(1);

  return (
    <>
      {puntos.length > 1 && (
        <Line points={puntos} color="#4fc3f7" lineWidth={1.5} opacity={0.5} transparent />
      )}
      <mesh
        ref={ref}
        onPointerEnter={() => onHover({
          titulo: "Proyectil",
          descripcion: "Objeto en movimiento parabólico bajo la influencia de la gravedad.",
          propiedades: {
            Velocidad: `${velocidad} m/s`,
            Ángulo: `${angulo}°`,
            "Alcance máx": `${alcanceMax} m`,
            "Altura máx": `${alturaMax} m`,
          },
        })}
        onPointerLeave={() => onHover(null)}
      >
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#ff6b35" emissive="#ff3500" emissiveIntensity={0.5} />
      </mesh>

      {/* Vectores */}
      <Html position={[0.5, 0.3, 0]}>
        <div className="text-xs text-yellow-300 font-mono pointer-events-none whitespace-nowrap">
          v₀ = {velocidad} m/s | θ = {angulo}°
        </div>
      </Html>
    </>
  );
}

function Suelo() {
  const points: THREE.Vector3[] = [
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(10, 0, 0),
  ];
  return <Line points={points} color="#81c784" lineWidth={2} />;
}

function EjesCoord() {
  return (
    <>
      <Line
        points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(8, 0, 0)]}
        color="#ff5252" lineWidth={1} opacity={0.5} transparent
      />
      <Line
        points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 4, 0)]}
        color="#69f0ae" lineWidth={1} opacity={0.5} transparent
      />
      <Html position={[8.2, 0, 0]}>
        <span className="text-red-400 text-xs font-mono">X</span>
      </Html>
      <Html position={[0, 4.2, 0]}>
        <span className="text-green-400 text-xs font-mono">Y</span>
      </Html>
    </>
  );
}

function ParabolaScene({
  velocidad,
  angulo,
  onHover,
}: {
  velocidad: number;
  angulo: number;
  onHover: (info: SceneInfo | null) => void;
}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={1.2} />
      <Suelo />
      <EjesCoord />
      <Proyectil velocidad={velocidad} angulo={angulo} onHover={onHover} />
      <OrbitControls enablePan={false} minDistance={3} maxDistance={20} />
    </>
  );
}

export default function MovimientoParabolico({
  onHover,
}: {
  onHover: (info: SceneInfo | null) => void;
}) {
  const [velocidad, setVelocidad] = useState(10);
  const [angulo, setAngulo] = useState(45);

  return (
    <div className="flex flex-col h-full">
      {/* Controles */}
      <div className="flex gap-4 px-4 py-2 bg-gray-900/80 rounded-xl mb-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Velocidad:</span>
          <input
            type="range" min={5} max={20} value={velocidad}
            onChange={e => setVelocidad(Number(e.target.value))}
            className="w-24 accent-blue-500"
          />
          <span className="text-xs text-white font-mono w-8">{velocidad}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Ángulo:</span>
          <input
            type="range" min={10} max={80} value={angulo}
            onChange={e => setAngulo(Number(e.target.value))}
            className="w-24 accent-orange-500"
          />
          <span className="text-xs text-white font-mono w-8">{angulo}°</span>
        </div>
      </div>

      <div className="flex-1">
        <Canvas camera={{ position: [4, 3, 8], fov: 60 }} style={{ background: "transparent" }}>
          <ParabolaScene velocidad={velocidad} angulo={angulo} onHover={onHover} />
        </Canvas>
      </div>
    </div>
  );
}