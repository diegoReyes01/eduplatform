"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Html } from "@react-three/drei";
import * as THREE from "three";
import { SceneInfo } from "@/hooks/use3DScene";

interface CamaraProps {
  position: [number, number, number];
  color: string;
  escala?: [number, number, number];
  label: string;
  info: SceneInfo;
  onHover: (info: SceneInfo | null) => void;
}

function Camara({ position, color, escala = [0.55, 0.55, 0.55], label, info, onHover }: CamaraProps) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const pulso = useRef(0);

  useFrame((_, delta) => {
    pulso.current += delta * 2;
    if (ref.current) {
      const s = 1 + Math.sin(pulso.current) * 0.04;
      ref.current.scale.set(escala[0] * s, escala[1] * s, escala[2] * s);
    }
  });

  return (
    <group position={position}>
      <Sphere
        ref={ref}
        args={[1, 32, 32]}
        onPointerEnter={() => { setHovered(true); onHover(info); }}
        onPointerLeave={() => { setHovered(false); onHover(null); }}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.6 : 0.2}
          roughness={0.4}
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

function Vaso({
  start,
  end,
  radio = 0.12,
  color = "#990000",
}: {
  start: [number, number, number];
  end: [number, number, number];
  radio?: number;
  color?: string;
}) {
  const startV = new THREE.Vector3(...start);
  const endV = new THREE.Vector3(...end);
  const dir = endV.clone().sub(startV);
  const length = dir.length();
  const mid = startV.clone().add(dir.clone().multiplyScalar(0.5));
  const up = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());

  return (
    <mesh position={mid} quaternion={quaternion}>
      <cylinderGeometry args={[radio, radio, length, 12]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
  );
}

function CorazonScene({ onHover }: { onHover: (info: SceneInfo | null) => void }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.25;
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1.4} />

      <group ref={groupRef}>
        {/* Auricula derecha */}
        <Camara
          position={[-0.6, 0.6, 0]}
          color="#3b82f6"
          escala={[0.45, 0.45, 0.45]}
          label="AD"
          info={{
            titulo: "Auricula Derecha",
            descripcion: "Recibe sangre venosa pobre en oxigeno desde el cuerpo.",
            propiedades: { Tipo: "Camara superior", Sangre: "Venosa" },
          }}
          onHover={onHover}
        />
        {/* Auricula izquierda */}
        <Camara
          position={[0.6, 0.6, 0]}
          color="#ef4444"
          escala={[0.45, 0.45, 0.45]}
          label="AI"
          info={{
            titulo: "Auricula Izquierda",
            descripcion: "Recibe sangre oxigenada proveniente de los pulmones.",
            propiedades: { Tipo: "Camara superior", Sangre: "Oxigenada" },
          }}
          onHover={onHover}
        />
        {/* Ventriculo derecho */}
        <Camara
          position={[-0.55, -0.5, 0]}
          color="#2563eb"
          escala={[0.6, 0.65, 0.6]}
          label="VD"
          info={{
            titulo: "Ventriculo Derecho",
            descripcion: "Bombea sangre venosa hacia los pulmones para oxigenarse.",
            propiedades: { Tipo: "Camara inferior", Destino: "Pulmones" },
          }}
          onHover={onHover}
        />
        {/* Ventriculo izquierdo */}
        <Camara
          position={[0.55, -0.5, 0]}
          color="#dc2626"
          escala={[0.65, 0.7, 0.65]}
          label="VI"
          info={{
            titulo: "Ventriculo Izquierdo",
            descripcion: "Bombea sangre oxigenada hacia todo el cuerpo. Camara mas fuerte.",
            propiedades: { Tipo: "Camara inferior", Destino: "Cuerpo entero" },
          }}
          onHover={onHover}
        />

        {/* Vasos principales */}
        <Vaso start={[0.55, -0.5, 0]} end={[0.9, 1.4, 0]} radio={0.14} color="#dc2626" />
        <Vaso start={[-0.55, -0.5, 0]} end={[-0.9, 1.4, 0]} radio={0.14} color="#2563eb" />
        <Vaso start={[-0.6, 0.6, 0]} end={[-1.3, 0.3, 0]} radio={0.13} color="#3b82f6" />
        <Vaso start={[0.6, 0.6, 0]} end={[1.3, 0.3, 0]} radio={0.13} color="#ef4444" />
      </group>

      <OrbitControls enablePan={false} minDistance={2.5} maxDistance={9} />
    </>
  );
}

interface CorazonProps {
  onHover: (info: SceneInfo | null) => void;
}

export default function Corazon({ onHover }: CorazonProps) {
  return (
    <Canvas camera={{ position: [0, 0.5, 4.5], fov: 60 }} style={{ background: "transparent" }}>
      <CorazonScene onHover={onHover} />
    </Canvas>
  );
}
