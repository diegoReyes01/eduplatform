"use client";

import { useRef, type JSX } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Html } from "@react-three/drei";
import * as THREE from "three";
import { SceneInfo } from "@/hooks/use3DScene";

function ADNScene({ onHover }: { onHover: (info: SceneInfo | null) => void }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.3;
  });

  const puntos: JSX.Element[] = [];
  const total = 20;

  for (let i = 0; i < total; i++) {
    const t = (i / total) * Math.PI * 4;
    const y = (i / total) * 4 - 2;
    const r = 0.8;

    // Cadena 1
    const x1 = Math.cos(t) * r;
    const z1 = Math.sin(t) * r;

    // Cadena 2
    const x2 = Math.cos(t + Math.PI) * r;
    const z2 = Math.sin(t + Math.PI) * r;

    const colorPar = i % 4 === 0 ? "#ff6b6b" : i % 4 === 1 ? "#4ecdc4" : i % 4 === 2 ? "#ffe66d" : "#a8e6cf";

    puntos.push(
      // Nodo cadena 1
      <Sphere
        key={`a-${i}`}
        position={[x1, y, z1]}
        args={[0.1, 16, 16]}
        onPointerEnter={() => onHover({
          titulo: "Base nitrogenada",
          descripcion: "Las bases nitrogenadas forman los peldaños de la escalera del ADN.",
          propiedades: { Tipo: colorPar === "#ff6b6b" ? "Adenina" : colorPar === "#4ecdc4" ? "Timina" : colorPar === "#ffe66d" ? "Guanina" : "Citosina" },
        })}
        onPointerLeave={() => onHover(null)}
      >
        <meshStandardMaterial color="#4fc3f7" emissive="#1e88e5" emissiveIntensity={0.3} />
      </Sphere>,

      // Nodo cadena 2
      <Sphere
        key={`b-${i}`}
        position={[x2, y, z2]}
        args={[0.1, 16, 16]}
        onPointerEnter={() => onHover({
          titulo: "Base nitrogenada",
          descripcion: "Par complementario de la cadena opuesta del ADN.",
          propiedades: { Tipo: colorPar === "#ff6b6b" ? "Timina" : colorPar === "#4ecdc4" ? "Adenina" : colorPar === "#ffe66d" ? "Citosina" : "Guanina" },
        })}
        onPointerLeave={() => onHover(null)}
      >
        <meshStandardMaterial color="#ce93d8" emissive="#8e24aa" emissiveIntensity={0.3} />
      </Sphere>,

      // Puente entre cadenas (escalón)
      <mesh key={`bridge-${i}`} position={[(x1 + x2) / 2, y, (z1 + z2) / 2]}>
        <cylinderGeometry args={[0.03, 0.03, Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2), 8]} />
        <meshStandardMaterial color={colorPar} opacity={0.8} transparent />
      </mesh>
    );

    // Enlace entre nodos consecutivos cadena 1
    if (i > 0) {
      const prevT = ((i - 1) / total) * Math.PI * 4;
      const prevY = ((i - 1) / total) * 4 - 2;
      const px1 = Math.cos(prevT) * r;
      const pz1 = Math.sin(prevT) * r;
      const px2 = Math.cos(prevT + Math.PI) * r;
      const pz2 = Math.sin(prevT + Math.PI) * r;

      const len1 = Math.sqrt((x1 - px1) ** 2 + (y - prevY) ** 2 + (z1 - pz1) ** 2);
      const mid1 = new THREE.Vector3((x1 + px1) / 2, (y + prevY) / 2, (z1 + pz1) / 2);
      const dir1 = new THREE.Vector3(x1 - px1, y - prevY, z1 - pz1).normalize();
      const q1 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir1);

      const len2 = Math.sqrt((x2 - px2) ** 2 + (y - prevY) ** 2 + (z2 - pz2) ** 2);
      const mid2 = new THREE.Vector3((x2 + px2) / 2, (y + prevY) / 2, (z2 + pz2) / 2);
      const dir2 = new THREE.Vector3(x2 - px2, y - prevY, z2 - pz2).normalize();
      const q2 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir2);

      puntos.push(
        <mesh key={`backbone1-${i}`} position={mid1} quaternion={q1}>
          <cylinderGeometry args={[0.04, 0.04, len1, 8]} />
          <meshStandardMaterial color="#4fc3f7" />
        </mesh>,
        <mesh key={`backbone2-${i}`} position={mid2} quaternion={q2}>
          <cylinderGeometry args={[0.04, 0.04, len2, 8]} />
          <meshStandardMaterial color="#ce93d8" />
        </mesh>
      );
    }
  }

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.5} />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#aa44ff" />
      <group ref={groupRef}>{puntos}</group>
      <OrbitControls enablePan={false} minDistance={3} maxDistance={10} />
    </>
  );
}

interface ADNProps {
  onHover: (info: SceneInfo | null) => void;
}

export default function ADN({ onHover }: ADNProps) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 60 }} style={{ background: "transparent" }}>
      <ADNScene onHover={onHover} />
    </Canvas>
  );
}