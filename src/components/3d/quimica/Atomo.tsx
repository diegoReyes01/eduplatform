"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { SceneInfo } from "@/hooks/use3DScene";

interface ElectronProps {
  radio: number;
  velocidad: number;
  color: string;
  angulo: number;
}

function Electron({ radio, velocidad, color, angulo }: ElectronProps) {
  const ref = useRef<THREE.Mesh>(null);
  const t = useRef(angulo);

  useFrame((_, delta) => {
    t.current += delta * velocidad;
    if (ref.current) {
      ref.current.position.x = Math.cos(t.current) * radio;
      ref.current.position.z = Math.sin(t.current) * radio;
    }
  });

  return (
    <Sphere ref={ref} args={[0.08, 16, 16]}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </Sphere>
  );
}

function OrbitaRing({ radio }: { radio: number }) {
  const points = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radio, 0, Math.sin(angle) * radio));
  }
  return <Line points={points} color="#ffffff" lineWidth={0.5} opacity={0.2} transparent />;
}

interface NucleoProps {
  onHover: (info: SceneInfo | null) => void;
}

function Nucleo({ onHover }: NucleoProps) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.5;
  });

  return (
    <Sphere
      ref={ref}
      args={[0.35, 32, 32]}
      onPointerEnter={() => onHover({
        titulo: "Núcleo atómico",
        descripcion: "Centro del átomo que contiene protones y neutrones.",
        propiedades: { Protones: "6", Neutrones: "6", Carga: "+6" },
      })}
      onPointerLeave={() => onHover(null)}
    >
      <meshStandardMaterial color="#ff6b35" emissive="#ff3500" emissiveIntensity={0.4} roughness={0.3} />
    </Sphere>
  );
}

function AtomoScene({ onHover }: { onHover: (info: SceneInfo | null) => void }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.5} />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#4488ff" />

      <Nucleo onHover={onHover} />

      {/* Órbitas */}
      <OrbitaRing radio={0.8} />
      <OrbitaRing radio={1.3} />
      <OrbitaRing radio={1.8} />

      {/* Electrones capa 1 */}
      <Electron radio={0.8} velocidad={2.0} color="#4fc3f7" angulo={0} />
      <Electron radio={0.8} velocidad={2.0} color="#4fc3f7" angulo={Math.PI} />

      {/* Electrones capa 2 */}
      <Electron radio={1.3} velocidad={1.4} color="#81c784" angulo={0} />
      <Electron radio={1.3} velocidad={1.4} color="#81c784" angulo={Math.PI * 0.5} />
      <Electron radio={1.3} velocidad={1.4} color="#81c784" angulo={Math.PI} />
      <Electron radio={1.3} velocidad={1.4} color="#81c784" angulo={Math.PI * 1.5} />

      {/* Electrones capa 3 */}
      <Electron radio={1.8} velocidad={1.0} color="#ce93d8" angulo={0} />
      <Electron radio={1.8} velocidad={1.0} color="#ce93d8" angulo={Math.PI * 0.67} />

      <OrbitControls enablePan={false} minDistance={2} maxDistance={8} />
    </>
  );
}

interface AtomoProps {
  onHover: (info: SceneInfo | null) => void;
}

export default function Atomo({ onHover }: AtomoProps) {
  return (
    <Canvas camera={{ position: [0, 2, 4], fov: 50 }} style={{ background: "transparent" }}>
      <AtomoScene onHover={onHover} />
    </Canvas>
  );
}