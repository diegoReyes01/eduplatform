"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { SceneInfo } from "@/hooks/use3DScene";

interface PlanetaProps {
  radio: number;
  tamano: number;
  color: string;
  velocidad: number;
  nombre: string;
  info: SceneInfo;
  onHover: (info: SceneInfo | null) => void;
  inclinacion?: number;
}

function Orbita({ radio, inclinacion = 0 }: { radio: number; inclinacion?: number }) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    points.push(
      new THREE.Vector3(
        Math.cos(angle) * radio,
        Math.sin(angle) * inclinacion,
        Math.sin(angle) * radio
      )
    );
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return (
    <line geometry={geometry}>
      <lineBasicMaterial color="#ffffff" transparent opacity={0.15} />
    </line>
  );
}

function Planeta({ radio, tamano, color, velocidad, info, onHover, inclinacion = 0 }: PlanetaProps) {
  const ref = useRef<THREE.Mesh>(null);
  const t = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    t.current += delta * velocidad;
    if (ref.current) {
      ref.current.position.x = Math.cos(t.current) * radio;
      ref.current.position.z = Math.sin(t.current) * radio;
      ref.current.position.y = Math.sin(t.current) * inclinacion;
      ref.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <>
      <Orbita radio={radio} inclinacion={inclinacion} />
      <mesh
        ref={ref}
        onPointerEnter={() => onHover(info)}
        onPointerLeave={() => onHover(null)}
      >
        <sphereGeometry args={[tamano, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    </>
  );
}

function Sol({ onHover }: { onHover: (info: SceneInfo | null) => void }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.1;
  });

  return (
    <mesh
      ref={ref}
      onPointerEnter={() => onHover({
        titulo: "Sol",
        descripcion: "Estrella central del sistema solar. Representa el 99.86% de la masa total.",
        propiedades: { Tipo: "Estrella G", Temperatura: "5.778 K", Masa: "1.989 × 10³⁰ kg" },
      })}
      onPointerLeave={() => onHover(null)}
    >
      <sphereGeometry args={[0.6, 32, 32]} />
      <meshStandardMaterial color="#FDB813" emissive="#FF8C00" emissiveIntensity={0.8} />
    </mesh>
  );
}

const planetas: PlanetaProps[] = [
  {
    radio: 1.2, tamano: 0.08, color: "#b5b5b5", velocidad: 4.7,
    nombre: "Mercurio", inclinacion: 0.1,
    info: { titulo: "Mercurio", descripcion: "Planeta más cercano al Sol. Sin atmósfera.", propiedades: { Distancia: "57.9M km", Período: "88 días" } },
    onHover: () => {},
  },
  {
    radio: 1.8, tamano: 0.14, color: "#e8cda0", velocidad: 3.5,
    nombre: "Venus", inclinacion: 0.05,
    info: { titulo: "Venus", descripcion: "El planeta más caliente del sistema solar.", propiedades: { Distancia: "108M km", Temperatura: "465°C" } },
    onHover: () => {},
  },
  {
    radio: 2.5, tamano: 0.15, color: "#4fa3e0", velocidad: 2.9,
    nombre: "Tierra", inclinacion: 0.08,
    info: { titulo: "Tierra", descripcion: "Nuestro hogar. Único planeta con vida conocida.", propiedades: { Distancia: "150M km", Satélites: "1 (Luna)" } },
    onHover: () => {},
  },
  {
    radio: 3.2, tamano: 0.11, color: "#c1440e", velocidad: 2.4,
    nombre: "Marte", inclinacion: 0.1,
    info: { titulo: "Marte", descripcion: "El planeta rojo. Tiene los volcanes más altos.", propiedades: { Distancia: "228M km", Satélites: "2" } },
    onHover: () => {},
  },
  {
    radio: 4.5, tamano: 0.4, color: "#c88b3a", velocidad: 1.3,
    nombre: "Júpiter", inclinacion: 0.02,
    info: { titulo: "Júpiter", descripcion: "El planeta más grande del sistema solar.", propiedades: { Distancia: "778M km", Satélites: "95" } },
    onHover: () => {},
  },
  {
    radio: 5.8, tamano: 0.32, color: "#e4d191", velocidad: 0.9,
    nombre: "Saturno", inclinacion: 0.04,
    info: { titulo: "Saturno", descripcion: "Famoso por sus anillos de hielo y roca.", propiedades: { Distancia: "1.4B km", Satélites: "146" } },
    onHover: () => {},
  },
];

function SistemaSolarScene({ onHover }: { onHover: (info: SceneInfo | null) => void }) {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 0, 0]} intensity={3} color="#FDB813" />
      <pointLight position={[10, 10, 10]} intensity={0.3} />
      <Sol onHover={onHover} />
      {planetas.map((p) => (
        <Planeta key={p.nombre} {...p} onHover={onHover} />
      ))}
      <OrbitControls enablePan={false} minDistance={3} maxDistance={20} />
    </>
  );
}

export default function SistemaSolar({ onHover }: { onHover: (info: SceneInfo | null) => void }) {
  return (
    <Canvas camera={{ position: [0, 6, 12], fov: 60 }} style={{ background: "transparent" }}>
      <SistemaSolarScene onHover={onHover} />
    </Canvas>
  );
}