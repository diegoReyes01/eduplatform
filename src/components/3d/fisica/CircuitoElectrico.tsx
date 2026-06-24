"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { SceneInfo } from "@/hooks/use3DScene";

interface ComponenteProps {
  position: [number, number, number];
  info: SceneInfo;
  onHover: (info: SceneInfo | null) => void;
}

function Bateria({ position, info, onHover }: ComponenteProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <group position={position}>
      <mesh
        onPointerEnter={() => { setHovered(true); onHover(info); }}
        onPointerLeave={() => { setHovered(false); onHover(null); }}
      >
        <boxGeometry args={[0.5, 0.9, 0.5]} />
        <meshStandardMaterial color="#2d6a4f" emissive="#2d6a4f" emissiveIntensity={hovered ? 0.5 : 0.15} roughness={0.4} />
      </mesh>
      <Html center distanceFactor={6}>
        <div className="text-white text-xs font-bold bg-black/50 px-1 rounded pointer-events-none">
          Bateria
        </div>
      </Html>
    </group>
  );
}

function Resistencia({ position, info, onHover }: ComponenteProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <mesh
        onPointerEnter={() => { setHovered(true); onHover(info); }}
        onPointerLeave={() => { setHovered(false); onHover(null); }}
      >
        <cylinderGeometry args={[0.18, 0.18, 0.7, 16]} />
        <meshStandardMaterial color="#d4a017" emissive="#d4a017" emissiveIntensity={hovered ? 0.5 : 0.15} roughness={0.5} />
      </mesh>
      <Html center distanceFactor={6}>
        <div className="text-white text-xs font-bold bg-black/50 px-1 rounded pointer-events-none" style={{ transform: "rotate(0deg)" }}>
          Resistencia
        </div>
      </Html>
    </group>
  );
}

function LED({ position, info, onHover, encendido }: ComponenteProps & { encendido: boolean }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current && encendido) {
      const mat = ref.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.8 + Math.sin(Date.now() * 0.005) * 0.2;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={ref}
        onPointerEnter={() => { setHovered(true); onHover(info); }}
        onPointerLeave={() => { setHovered(false); onHover(null); }}
      >
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial
          color={encendido ? "#ff3b3b" : "#660000"}
          emissive={encendido ? "#ff3b3b" : "#330000"}
          emissiveIntensity={hovered ? 1 : 0.8}
          roughness={0.3}
        />
      </mesh>
      <Html center distanceFactor={6}>
        <div className="text-white text-xs font-bold bg-black/50 px-1 rounded pointer-events-none">
          LED
        </div>
      </Html>
    </group>
  );
}

function Cable({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
  const startV = new THREE.Vector3(...start);
  const endV = new THREE.Vector3(...end);
  const dir = endV.clone().sub(startV);
  const length = dir.length();
  const mid = startV.clone().add(dir.clone().multiplyScalar(0.5));
  const up = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());

  return (
    <mesh position={mid} quaternion={quaternion}>
      <cylinderGeometry args={[0.04, 0.04, length, 8]} />
      <meshStandardMaterial color="#333333" roughness={0.6} />
    </mesh>
  );
}

function CircuitoScene({ onHover }: { onHover: (info: SceneInfo | null) => void }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.15;
  });

  const posBateria: [number, number, number] = [-1.4, 0, 0];
  const posResistencia: [number, number, number] = [0, 0.9, 0];
  const posLed: [number, number, number] = [1.4, 0, 0];

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={posLed} intensity={1.5} color="#ff3b3b" distance={3} />

      <group ref={groupRef}>
        <Bateria
          position={posBateria}
          onHover={onHover}
          info={{
            titulo: "Bateria",
            descripcion: "Fuente de energia electrica que impulsa la corriente por el circuito.",
            propiedades: { Voltaje: "9V", Tipo: "DC" },
          }}
        />
        <Resistencia
          position={posResistencia}
          onHover={onHover}
          info={{
            titulo: "Resistencia",
            descripcion: "Limita el flujo de corriente para proteger el LED de quemarse.",
            propiedades: { Valor: "220 ohms", Funcion: "Limitar corriente" },
          }}
        />
        <LED
          position={posLed}
          encendido={true}
          onHover={onHover}
          info={{
            titulo: "LED",
            descripcion: "Diodo emisor de luz. Se enciende cuando la corriente fluye en el sentido correcto.",
            propiedades: { Color: "Rojo", "Voltaje directo": "2V" },
          }}
        />

        <Cable start={posBateria} end={[posBateria[0], 0.9, 0]} />
        <Cable start={[posBateria[0], 0.9, 0]} end={posResistencia} />
        <Cable start={posResistencia} end={[posLed[0], 0.9, 0]} />
        <Cable start={[posLed[0], 0.9, 0]} end={posLed} />
        <Cable start={posLed} end={posBateria} />
      </group>

      <OrbitControls enablePan={false} minDistance={3} maxDistance={10} />
    </>
  );
}

interface CircuitoElectricoProps {
  onHover: (info: SceneInfo | null) => void;
}

export default function CircuitoElectrico({ onHover }: CircuitoElectricoProps) {
  return (
    <Canvas camera={{ position: [0, 1.5, 5], fov: 60 }} style={{ background: "transparent" }}>
      <CircuitoScene onHover={onHover} />
    </Canvas>
  );
}
