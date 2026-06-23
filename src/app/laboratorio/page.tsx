"use client";

import { Suspense, lazy, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { use3DScene } from "@/hooks/use3DScene";
import { useXP } from "@/hooks/useXP";
import { FlaskConical, Dna, Atom } from "lucide-react";

const Atomo = lazy(() => import("@/components/3d/quimica/Atomo"));
const Molecula = lazy(() => import("@/components/3d/quimica/Molecula"));
const ADN = lazy(() => import("@/components/3d/biologia/ADN"));
const Celula = lazy(() => import("@/components/3d/biologia/Celula"));
const SistemaSolar = lazy(() => import("@/components/3d/fisica/SistemaSolar"));
const MovimientoParabolico = lazy(() => import("@/components/3d/fisica/MovimientoParabolico"));

function Loader3D() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Cargando modelo 3D...</p>
    </div>
  );
}

const categorias = [
  { id: "quimica", label: "Química", icon: FlaskConical, color: "from-green-500 to-emerald-700" },
  { id: "biologia", label: "Biología", icon: Dna, color: "from-purple-500 to-purple-700" },
  { id: "fisica", label: "Física", icon: Atom, color: "from-blue-500 to-blue-700" },
];

const modelos = {
  quimica: [
    { id: "atomo", label: "Átomo de Carbono", descripcion: "Estructura atómica con núcleo y electrones orbitando." },
    { id: "molecula", label: "Molécula H₂O", descripcion: "Molécula de agua con enlaces covalentes." },
  ],
  biologia: [
    { id: "adn", label: "Doble Hélice ADN", descripcion: "Estructura del ácido desoxirribonucleico." },
    { id: "celula", label: "Célula Animal", descripcion: "Célula eucariota con orgánulos interactivos." },
  ],
  fisica: [
    { id: "sistemasolar", label: "Sistema Solar", descripcion: "Simulación orbital de los planetas." },
    { id: "parabolico", label: "Movimiento Parabólico", descripcion: "Simulación de tiro parabólico con controles." },
  ],
};

function renderModelo(id: string, onHover: (info: any) => void) {
  switch (id) {
    case "atomo": return <Atomo onHover={onHover} />;
    case "molecula": return <Molecula onHover={onHover} />;
    case "adn": return <ADN onHover={onHover} />;
    case "celula": return <Celula onHover={onHover} />;
    case "sistemasolar": return <SistemaSolar onHover={onHover} />;
    case "parabolico": return <MovimientoParabolico onHover={onHover} />;
    default: return null;
  }
}

export default function LaboratorioPage() {
  const [categoria, setCategoria] = useState("quimica");
  const [modeloActivo, setModeloActivo] = useState("atomo");
  const { info, showInfo, hideInfo } = use3DScene();
  const { ganarXP } = useXP();

  const handleHover = (data: any) => {
    if (data) showInfo(data);
    else hideInfo();
  };

  const handleSeleccionarModelo = (id: string, label: string) => {
    setModeloActivo(id);
    hideInfo();
    ganarXP("VER_MODELO_3D", `Exploró modelo 3D: ${label}`);
  };

  const catActual = categorias.find(c => c.id === categoria)!;
  const modelosActuales = modelos[categoria as keyof typeof modelos];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900">Laboratorio 3D</h1>
          <p className="text-gray-500 mt-1">Explora modelos interactivos — rota, zoom y haz clic</p>
        </motion.div>

        <div className="flex gap-2 flex-wrap">
          {categorias.map(cat => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setCategoria(cat.id);
                const primerModelo = modelos[cat.id as keyof typeof modelos][0];
                handleSeleccionarModelo(primerModelo.id, primerModelo.label);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                categoria === cat.id
                  ? `bg-gradient-to-r ${cat.color} text-white shadow-md`
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <cat.icon size={16} />
              {cat.label}
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1 flex flex-col gap-2">
            {modelosActuales.map(m => (
              <motion.button
                key={m.id}
                whileHover={{ x: 4 }}
                onClick={() => handleSeleccionarModelo(m.id, m.label)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  modeloActivo === m.id
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-gray-100 bg-white hover:bg-gray-50"
                }`}
              >
                <p className={`text-sm font-semibold ${modeloActivo === m.id ? "text-blue-700" : "text-gray-800"}`}>
                  {m.label}
                </p>
                <p className="text-xs text-gray-400 mt-1">{m.descripcion}</p>
              </motion.button>
            ))}

            <AnimatePresence>
              {info && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-2 p-4 bg-gray-900 rounded-xl text-white"
                >
                  <p className="font-semibold text-sm text-blue-300">{info.titulo}</p>
                  <p className="text-xs text-gray-300 mt-1">{info.descripcion}</p>
                  {info.propiedades && (
                    <div className="mt-2 space-y-1">
                      {Object.entries(info.propiedades).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-xs">
                          <span className="text-gray-400">{k}</span>
                          <span className="text-white font-mono">{v as string}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {!info && (
              <div className="mt-2 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                <p className="text-xs text-gray-400">Pasa el cursor sobre un elemento 3D para ver información</p>
              </div>
            )}
          </div>

          <motion.div
            key={modeloActivo}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-3 rounded-2xl overflow-hidden bg-gray-950 shadow-lg"
            style={{ height: "500px" }}
          >
            <Suspense fallback={<Loader3D />}>
              {renderModelo(modeloActivo, handleHover)}
            </Suspense>
          </motion.div>
        </div>

        <div className="flex gap-3 flex-wrap">
          {[
            { emoji: "🖱️", texto: "Clic + arrastrar para rotar" },
            { emoji: "🔍", texto: "Scroll para zoom" },
            { emoji: "👆", texto: "Hover para información" },
          ].map((tip, i) => (
            <div key={i} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-100 text-sm text-gray-500">
              <span>{tip.emoji}</span>
              <span>{tip.texto}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}