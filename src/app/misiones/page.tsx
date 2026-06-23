"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Trophy, Flame, Star, Zap, CheckCircle, Lock } from "lucide-react";

interface MisionDB {
  id: string;
  title: string;
  description: string;
  type: string;
  xpReward: number;
  emoji: string;
  target: number;
  progreso: number;
  status: string;
  completada: boolean;
}

interface ExperienceDB {
  totalXp: number;
  currentXp: number;
  level: { number: number; name: string; xpRequired: number; xpMax: number };
}

function BarraProgreso({ valor, max, color }: { valor: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((valor / max) * 100));
  return (
    <div className="w-full bg-gray-100 rounded-full h-2.5">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-2.5 rounded-full ${color}`}
      />
    </div>
  );
}

function TarjetaMision({ mision }: { mision: MisionDB }) {
  const pct = Math.min(100, Math.round((mision.progreso / mision.target) * 100));
  const colorBorde = mision.completada ? "border-green-300 bg-green-50"
    : mision.type === "DAILY" ? "border-blue-100 bg-white"
    : mision.type === "WEEKLY" ? "border-purple-100 bg-white"
    : "border-yellow-200 bg-yellow-50";
  const colorBarra = mision.completada ? "bg-green-500"
    : mision.type === "DAILY" ? "bg-blue-500"
    : mision.type === "WEEKLY" ? "bg-purple-500"
    : "bg-yellow-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`p-4 rounded-2xl border-2 ${colorBorde} transition-all`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{mision.emoji}</span>
          <div>
            <p className="font-semibold text-sm text-gray-800">{mision.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{mision.description}</p>
          </div>
        </div>
        {mision.completada ? (
          <CheckCircle size={20} className="text-green-500 shrink-0" />
        ) : (
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full shrink-0">
            +{mision.xpReward} XP
          </span>
        )}
      </div>
      <div className="space-y-1">
        <BarraProgreso valor={mision.progreso} max={mision.target} color={colorBarra} />
        <div className="flex justify-between text-xs text-gray-400">
          <span>{mision.progreso}/{mision.target} completado</span>
          <span>{pct}%</span>
        </div>
      </div>
    </motion.div>
  );
}

const INSIGNIAS = [
  { id: 1, nombre: "Explorador", emoji: "🗺️", descripcion: "Visita todas las secciones", desbloqueada: true },
  { id: 2, nombre: "Científico", emoji: "🔬", descripcion: "Explora 10 modelos 3D", desbloqueada: true },
  { id: 3, nombre: "Estudiante Ejemplar", emoji: "🌟", descripcion: "Promedio mayor a 6.5", desbloqueada: false },
  { id: 4, nombre: "Maestro de Química", emoji: "⚗️", descripcion: "Completa todas las tareas de Química", desbloqueada: false },
  { id: 5, nombre: "Maestro de Física", emoji: "⚛️", descripcion: "Aprueba todas las evaluaciones de Física", desbloqueada: false },
  { id: 6, nombre: "Maestro de Biología", emoji: "🧬", descripcion: "Explora todos los modelos de Biología", desbloqueada: true },
];

const XP_INFO = [
  { emoji: "🌅", label: "Login diario", xp: 10 },
  { emoji: "🔬", label: "Modelo 3D", xp: 15 },
  { emoji: "📖", label: "Leer recurso", xp: 20 },
  { emoji: "📝", label: "Entregar tarea", xp: 50 },
  { emoji: "📊", label: "Evaluación", xp: 75 },
];

export default function MisionesPage() {
  const [tab, setTab] = useState<"diarias" | "semanales" | "especiales" | "insignias">("diarias");
  const [misiones, setMisiones] = useState<MisionDB[]>([]);
  const [experience, setExperience] = useState<ExperienceDB | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const headers = { Authorization: `Bearer ${token}` };
        const [expRes, misionesRes] = await Promise.all([
          fetch("/api/experience", { headers }),
          fetch("/api/misiones", { headers }),
        ]);
        const expData = await expRes.json();
        const misionesData = await misionesRes.json();
        if (expData.success) setExperience(expData.data);
        if (misionesData.success) setMisiones(misionesData.data);
      } catch {
        // silencioso
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const diarias = misiones.filter(m => m.type === "DAILY");
  const semanales = misiones.filter(m => m.type === "WEEKLY");
  const especiales = misiones.filter(m => m.type === "SPECIAL");

  const nivel = experience?.level;
  const totalXp = experience?.totalXp ?? 0;
  const currentXp = experience?.currentXp ?? 0;
  const xpMax = nivel ? nivel.xpMax - nivel.xpRequired : 100;
  const progresoPct = xpMax > 0 ? Math.round((currentXp / xpMax) * 100) : 0;
  const xpRestante = xpMax - currentXp;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900">Misiones</h1>
          <p className="text-gray-500 mt-1">Completa misiones para ganar XP y subir de nivel</p>
        </motion.div>

        {/* Nivel y XP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white"
        >
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-indigo-200 text-sm">Nivel actual</p>
                  <p className="text-3xl font-bold">{nivel?.number ?? 1} — {nivel?.name ?? "Principiante"}</p>
                  <p className="text-indigo-200 text-sm mt-1">{totalXp} XP total</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">⚡</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-indigo-200">
                  <span>{currentXp} XP</span>
                  <span>{xpMax} XP</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progresoPct}%` }}
                    transition={{ duration: 1 }}
                    className="bg-yellow-300 h-3 rounded-full"
                  />
                </div>
                <p className="text-indigo-200 text-xs">{xpRestante} XP para nivel {(nivel?.number ?? 1) + 1}</p>
              </div>
            </>
          )}
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Misiones diarias", value: `${diarias.filter(m => m.completada).length}/${diarias.length}`, icon: Flame, color: "text-orange-500", bg: "bg-orange-50" },
            { label: "Misiones semanales", value: `${semanales.filter(m => m.completada).length}/${semanales.length}`, icon: Trophy, color: "text-purple-500", bg: "bg-purple-50" },
            { label: "Insignias", value: `${INSIGNIAS.filter(i => i.desbloqueada).length}/${INSIGNIAS.length}`, icon: Star, color: "text-yellow-500", bg: "bg-yellow-50" },
            { label: "XP total", value: totalXp.toString(), icon: Zap, color: "text-blue-500", bg: "bg-blue-50" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-2`}>
                <s.icon size={18} className={s.color} />
              </div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {[
            { id: "diarias", label: "🔥 Diarias" },
            { id: "semanales", label: "📅 Semanales" },
            { id: "especiales", label: "⭐ Especiales" },
            { id: "insignias", label: "🏅 Insignias" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === t.id ? "bg-indigo-600 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && (
          <AnimatePresence mode="wait">
            {tab === "diarias" && (
              <motion.div key="diarias" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {diarias.length === 0
                  ? <p className="text-gray-400 text-sm col-span-3 text-center py-8">No hay misiones diarias disponibles</p>
                  : diarias.map(m => <TarjetaMision key={m.id} mision={m} />)}
              </motion.div>
            )}
            {tab === "semanales" && (
              <motion.div key="semanales" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {semanales.length === 0
                  ? <p className="text-gray-400 text-sm col-span-3 text-center py-8">No hay misiones semanales disponibles</p>
                  : semanales.map(m => <TarjetaMision key={m.id} mision={m} />)}
              </motion.div>
            )}
            {tab === "especiales" && (
              <motion.div key="especiales" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {especiales.length === 0
                  ? <p className="text-gray-400 text-sm col-span-3 text-center py-8">No hay misiones especiales disponibles</p>
                  : especiales.map(m => <TarjetaMision key={m.id} mision={m} />)}
              </motion.div>
            )}
            {tab === "insignias" && (
              <motion.div key="insignias" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {INSIGNIAS.map((ins, i) => (
                  <motion.div key={ins.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }} whileHover={{ scale: 1.05 }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center ${
                      ins.desbloqueada ? "border-yellow-300 bg-yellow-50" : "border-gray-100 bg-gray-50 opacity-50"
                    }`}>
                    <span className="text-3xl">{ins.emoji}</span>
                    <p className="text-xs font-semibold text-gray-800">{ins.nombre}</p>
                    <p className="text-xs text-gray-400">{ins.descripcion}</p>
                    {!ins.desbloqueada && <Lock size={12} className="text-gray-400" />}
                    {ins.desbloqueada && <CheckCircle size={14} className="text-green-500" />}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* XP info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">¿Cómo ganar XP?</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {XP_INFO.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-xl text-center">
                <span className="text-2xl">{item.emoji}</span>
                <p className="text-xs text-gray-600 font-medium">{item.label}</p>
                <span className="text-sm font-bold text-indigo-600">+{item.xp} XP</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}