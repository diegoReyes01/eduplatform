"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Html } from "@react-three/drei";
import * as THREE from "three";
import { SceneInfo } from "@/hooks/use3DScene";

function Organelo({
  position, color, radio, label, info, onHover,
}: {
  position: [number, number, number];
  color: string;
  radio: number;
  label: string;
  info: SceneInfo;
  onHover: (info: SceneInfo | null) => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <group position={position}>
      <Sphere
        args={[radio, 24, 24]}
        onPointerEnter={() => { setHovered(true); onHover(info); }}
        onPointerLeave={() => { setHovered(false); onHover(null); }}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.6 : 0.15}
          transparent
          opacity={0.85}
          roughness={0.3}
        />
      </Sphere>
      {hovered && (
        <Html center distanceFactor={5}>
          <div className="bg-black/70 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap">
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

function CelulaScene({ onHover }: { onHover: (info: SceneInfo | null) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.15;
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1.5} />
      <pointLight position={[-5, -5, 5]} intensity={0.5} color="#44aaff" />

      <group ref={groupRef}>
        {/* Membrana celular */}
        <Sphere args={[2, 32, 32]}>
          <meshStandardMaterial color="#81c784" transparent opacity={0.15} roughness={0.8} />
        </Sphere>

        {/* Núcleo */}
        <Organelo
          position={[0, 0, 0]} color="#1565c0" radio={0.55} label="Núcleo"
          info={{ titulo: "Núcleo", descripcion: "Centro de control de la célula. Contiene el ADN.", propiedades: { Función: "Control celular", Contenido: "ADN, ARN" } }}
          onHover={onHover}
        />

        {/* Mitocondria */}
        <Organelo
          position={[1.0, 0.4, 0.3]} color="#ff7043" radio={0.28} label="Mitocondria"
          info={{ titulo: "Mitocondria", descripcion: "Genera energía (ATP) para la célula.", propiedades: { Función: "Respiración celular", Producto: "ATP" } }}
          onHover={onHover}
        />
        <Organelo
          position={[-0.9, 0.6, -0.4]} color="#ff7043" radio={0.24} label="Mitocondria"
          info={{ titulo: "Mitocondria", descripcion: "Genera energía (ATP) para la célula.", propiedades: { Función: "Respiración celular", Producto: "ATP" } }}
          onHover={onHover}
        />

        {/* Retículo endoplasmático */}
        <Organelo
          position={[0.6, -0.7, 0.5]} color="#ce93d8" radio={0.32} label="Retículo ER"
          info={{ titulo: "Retículo Endoplasmático", descripcion: "Sintetiza y transporta proteínas y lípidos.", propiedades: { Tipo: "Rugoso / Liso", Función: "Síntesis" } }}
          onHover={onHover}
        />

        {/* Aparato de Golgi */}
        <Organelo
          position={[-0.5, -0.5, 0.8]} color="#ffb74d" radio={0.3} label="Golgi"
          info={{ titulo: "Aparato de Golgi", descripcion: "Procesa y empaqueta proteínas para exportar.", propiedades: { Función: "Empaquetado", Destino: "Membrana/exterior" } }}
          onHover={onHover}
        />

        {/* Lisosoma */}
        <Organelo
          position={[0.9, -0.5, -0.6]} color="#ef5350" radio={0.18} label="Lisosoma"
          info={{ titulo: "Lisosoma", descripcion: "Digiere material de desecho dentro de la célula.", propiedades: { Función: "Digestión celular", Contenido: "Enzimas hidrolíticas" } }}
          onHover={onHover}
        />

        {/* Vacuola */}
        <Organelo
          position={[-1.0, -0.3, 0.5]} color="#4dd0e1" radio={0.35} label="Vacuola"
          info={{ titulo: "Vacuola", descripcion: "Almacena agua, nutrientes y desechos.", propiedades: { Función: "Almacenamiento", Contenido: "Agua, sales" } }}
          onHover={onHover}
        />

        {/* Ribosomas pequeños */}
        {[[0.3, 0.8, 0.6], [-0.7, 0.3, 0.9], [1.1, -0.1, 0.1], [-0.2, -1.0, 0.3]].map((pos, i) => (
          <Organelo
            key={i}
            position={pos as [number, number, number]}
            color="#fff176" radio={0.1} label="Ribosoma"
            info={{ titulo: "Ribosoma", descripcion: "Sintetiza proteínas a partir del ARN mensajero.", propiedades: { Función: "Síntesis proteica", Tamaño: "~20nm" } }}
            onHover={onHover}
          />
        ))}
      </group>

      <OrbitControls enablePan={false} minDistance={3} maxDistance={9} />
    </>
  );
}

export default function Celula({ onHover }: { onHover: (info: SceneInfo | null) => void }) {
  return (
    <Canvas camera={{ position: [0, 2, 5], fov: 60 }} style={{ background: "transparent" }}>
      <CelulaScene onHover={onHover} />
    </Canvas>
  );
}