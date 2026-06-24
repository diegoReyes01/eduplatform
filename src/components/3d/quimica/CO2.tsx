"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Html } from "@react-three/drei";
import * as THREE from "three";
import { SceneInfo } from "@/hooks/use3DScene";

interface AtomProps {
  position: [number, number, number];
  color: string;
  radio?: number;
  label: string;
  info: SceneInfo;
  onHover: (info: SceneInfo | null) => void;
}

function Atom({ position, color, radio = 0.3, label, info, onHover }: AtomProps) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      <Sphere
        ref={ref}
        args={[radio, 32, 32]}
        onPointerEnter={() => { setHovered(true); onHover(info); }}
        onPointerLeave={() => { setHovered(false); onHover(null); }}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.6 : 0.2}
          roughness={0.3}
        />
      </Sphere>
      <Html center distanceFactor={6}>
        <div className="text-white text-xs font-bold bg-black/50 px-1 rounded pointer-events-none">
          {label}
        </div>
      </Html>
    </group>
  );
}

function DoubleBond({
  start,
  end,
}: {
  start: [number, number, number];
  end: [number, number, number];
}) {
  const startV = new THREE.Vector3(...start);
  const endV = new THREE.Vector3(...end);
  const dir = endV.clone().sub(startV);
  const length = dir.length();
  const mid = startV.clone().add(dir.clone().multiplyScalar(0.5));
  const up = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());

  const normal = new THREE.Vector3(0, 0, 1);

  return (
    <group position={mid} quaternion={quaternion}>
      <mesh position={normal.clone().multiplyScalar(0.08)}>
        <cylinderGeometry args={[0.04, 0.04, length, 8]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.5} />
      </mesh>
      <mesh position={normal.clone().multiplyScalar(-0.08)}>
        <cylinderGeometry args={[0.04, 0.04, length, 8]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.5} />
      </mesh>
    </group>
  );
}

function CO2Scene({ onHover }: { onHover: (info: SceneInfo | null) => void }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.3;
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1.5} />

      <group ref={groupRef}>
        {/* Carbono central */}
        <Atom
          position={[0, 0, 0]}
          color="#444444"
          radio={0.35}
          label="C"
          info={{
            titulo: "Carbono",
            descripcion: "Atomo central de la molecula de dioxido de carbono (CO2).",
            propiedades: { "Numero atomico": "6", "Geometria": "Lineal" },
          }}
          onHover={onHover}
        />

        {/* Oxigenos */}
        <Atom
          position={[-1.1, 0, 0]}
          color="#ff4444"
          radio={0.32}
          label="O"
          info={{
            titulo: "Oxigeno",
            descripcion: "Atomo de oxigeno unido al carbono mediante enlace doble.",
            propiedades: { "Numero atomico": "8", "Angulo de enlace": "180 grados" },
          }}
          onHover={onHover}
        />
        <Atom
          position={[1.1, 0, 0]}
          color="#ff4444"
          radio={0.32}
          label="O"
          info={{
            titulo: "Oxigeno",
            descripcion: "Atomo de oxigeno unido al carbono mediante enlace doble.",
            propiedades: { "Numero atomico": "8", "Angulo de enlace": "180 grados" },
          }}
          onHover={onHover}
        />

        {/* Enlaces dobles */}
        <DoubleBond start={[0, 0, 0]} end={[-1.1, 0, 0]} />
        <DoubleBond start={[0, 0, 0]} end={[1.1, 0, 0]} />
      </group>

      <OrbitControls enablePan={false} minDistance={2} maxDistance={8} />
    </>
  );
}

interface CO2Props {
  onHover: (info: SceneInfo | null) => void;
}

export default function CO2({ onHover }: CO2Props) {
  return (
    <Canvas camera={{ position: [0, 1, 4], fov: 60 }} style={{ background: "transparent" }}>
      <CO2Scene onHover={onHover} />
    </Canvas>
  );
}
