"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Cylinder, Html } from "@react-three/drei";
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

function Bond({
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
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    up,
    dir.clone().normalize()
  );

  return (
    <mesh position={mid} quaternion={quaternion}>
      <cylinderGeometry args={[0.05, 0.05, length, 8]} />
      <meshStandardMaterial color="#aaaaaa" roughness={0.5} />
    </mesh>
  );
}

function AguaScene({ onHover }: { onHover: (info: SceneInfo | null) => void }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.3;
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1.5} />

      <group ref={groupRef}>
        {/* Oxígeno */}
        <Atom
          position={[0, 0, 0]}
          color="#ff4444"
          radio={0.4}
          label="O"
          info={{
            titulo: "Oxígeno",
            descripcion: "Átomo central de la molécula de agua (H₂O).",
            propiedades: { "Número atómico": "8", "Electronegatividad": "3.44" },
          }}
          onHover={onHover}
        />

        {/* Hidrógenos */}
        <Atom
          position={[-0.8, -0.6, 0]}
          color="#ffffff"
          radio={0.25}
          label="H"
          info={{
            titulo: "Hidrógeno",
            descripcion: "Átomo de hidrógeno unido al oxígeno.",
            propiedades: { "Número atómico": "1", "Ángulo de enlace": "104.5°" },
          }}
          onHover={onHover}
        />
        <Atom
          position={[0.8, -0.6, 0]}
          color="#ffffff"
          radio={0.25}
          label="H"
          info={{
            titulo: "Hidrógeno",
            descripcion: "Átomo de hidrógeno unido al oxígeno.",
            propiedades: { "Número atómico": "1", "Ángulo de enlace": "104.5°" },
          }}
          onHover={onHover}
        />

        {/* Enlaces */}
        <Bond start={[0, 0, 0]} end={[-0.8, -0.6, 0]} />
        <Bond start={[0, 0, 0]} end={[0.8, -0.6, 0]} />
      </group>

      <OrbitControls enablePan={false} minDistance={2} maxDistance={8} />
    </>
  );
}

// Necesitamos importar useState
import { useState } from "react";

interface MoleculaProps {
  onHover: (info: SceneInfo | null) => void;
}

export default function Molecula({ onHover }: MoleculaProps) {
  return (
    <Canvas camera={{ position: [0, 1, 4], fov: 60 }} style={{ background: "transparent" }}>
      <AguaScene onHover={onHover} />
    </Canvas>
  );
}
