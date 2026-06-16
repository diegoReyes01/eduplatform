"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  MISIONES_DIARIAS,
  MISIONES_SEMANALES,
  MISIONES_ESPECIALES,
  getProgresoMision,
  type Mision,
} from "@/lib/misiones";
import { getTotalXP, getNivelInfo, XP_ACCIONES } from "@/lib/xp";
import { Trophy, Flame, Star, Zap, CheckCircle, Lock } from "lucide-react";

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

function TarjetaMision({ mision }: { mision: Mision }) {
  const progreso = getProgresoMision(mision.id);
  const pct = Math.min(100, Math.round((progreso.progreso / mision.meta) * 100));

  const colorBorde = progreso.completada
    ? "border-green-300 bg-green-50"
    : mision.tipo === "diaria"
    ? "border-blue-100 bg-white"
    : mision.tipo === "semanal"
    ? "border-purple-100 bg-white"
    : "border-yellow-200 bg-yellow-50";

  const colorBarra = progreso.completada
    ? "bg-green-500"
    : mision.tipo === "diaria"
    ? "bg-blue-500"
    : mision.tipo === "semanal"
    ? "bg-purple-500"
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
            <p className="font-semibold text-sm text-gray-800">{mision.titulo}</p>
            <p className="text-xs text-gray-500 mt-0.5">{mision.descripcion}</p>
          </div>
        </div>
        {progreso.completada ? (
          <CheckCircle size={20} className="text-green-500 shrink-0" />
        ) : (
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full shrink-0">
            +{mision.xpRecompensa} XP
          </span>
        )}
      </div>

      <div className="space-y-1">
        <BarraProgreso valor={progreso.progreso} max={mision.meta} color={colorBarra} />
        <div className="flex justify-between text-xs text-gray-400">
          <span>{progreso.progreso}/{mision.meta} completado</span>
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

export default function MisionesPage() {
  const [tab, setTab] = useState<"diarias" | "semanales" | "especiales" | "insignias">("diarias");
  const [totalXp, setTotalXp] = useState(0);
  const [subioNivel, setSubioNivel] = useState(false);

  useEffect(() => {
    setTotalXp(getTotalXP());
  }, []);

  const nivelInfo = getNivelInfo(totalXp);

  const completadasDiarias = MISIONES_DIARIAS.filter(m => getProgresoMision(m.id).completada).length;
  const completadasSemanales = MISIONES_SEMANALES.filter(m => getProgresoMision(m.id).completada).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-indigo-200 text-sm">Nivel actual</p>
              <p className="text-3xl font-bold">{nivelInfo.numero} — {nivelInfo.nombre}</p>
              <p className="text-indigo-200 text-sm mt-1">{totalXp} XP total</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">⚡</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-indigo-200">
              <span>{nivelInfo.xpActual} XP</span>
              <span>{nivelInfo.xpMax - nivelInfo.xpMin} XP</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${nivelInfo.progreso}%` }}
                transition={{ duration: 1 }}
                className="bg-yellow-300 h-3 rounded-full"
              />
            </div>
            <p className="text-indigo-200 text-xs">{nivelInfo.xpRestante} XP para nivel {nivelInfo.numero + 1}</p>
          </div>
        </motion.div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Misiones diarias", value: `${completadasDiarias}/${MISIONES_DIARIAS.length}`, icon: Flame, color: "text-orange-500", bg: "bg-orange-50" },
            { label: "Misiones semanales", value: `${completadasSemanales}/${MISIONES_SEMANALES.length}`, icon: Trophy, color: "text-purple-500", bg: "bg-purple-50" },
            { label: "Insignias", value: `${INSIGNIAS.filter(i => i.desbloqueada).length}/${INSIGNIAS.length}`, icon: Star, color: "text-yellow-500", bg: "bg-yellow-50" },
            { label: "XP ganada hoy", value: "85", icon: Zap, color: "text-blue-500", bg: "bg-blue-50" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            >
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
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenido tabs */}
        <AnimatePresence mode="wait">
          {tab === "diarias" && (
            <motion.div
              key="diarias"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {MISIONES_DIARIAS.map(m => <TarjetaMision key={m.id} mision={m} />)}
            </motion.div>
          )}

          {tab === "semanales" && (
            <motion.div
              key="semanales"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {MISIONES_SEMANALES.map(m => <TarjetaMision key={m.id} mision={m} />)}
            </motion.div>
          )}

          {tab === "especiales" && (
            <motion.div
              key="especiales"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {MISIONES_ESPECIALES.map(m => <TarjetaMision key={m.id} mision={m} />)}
            </motion.div>
          )}

          {tab === "insignias" && (
            <motion.div
              key="insignias"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
            >
              {INSIGNIAS.map((ins, i) => (
                <motion.div
                  key={ins.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center ${
                    ins.desbloqueada
                      ? "border-yellow-300 bg-yellow-50"
                      : "border-gray-100 bg-gray-50 opacity-50"
                  }`}
                >
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

        {/* Acciones XP info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <h3 className="font-semibold text-gray-800 mb-4">¿Cómo ganar XP?</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(XP_ACCIONES).map(([key, val]) => (
              <div key={key} className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-xl text-center">
                <span className="text-2xl">{val.emoji}</span>
                <p className="text-xs text-gray-600 font-medium">{val.label}</p>
                <span className="text-sm font-bold text-indigo-600">+{val.xp} XP</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}