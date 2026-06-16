"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Trophy, Star, Lock, CheckCircle } from "lucide-react";

const achievements = [
  { id: 1, nombre: "Primera Tarea", descripcion: "Entregaste tu primera tarea", emoji: "📝", xp: 50, obtenido: true, fecha: "2026-04-01", categoria: "Académico" },
  { id: 2, nombre: "Semana Perfecta", descripcion: "Completaste todos los objetivos semanales", emoji: "🌟", xp: 100, obtenido: true, fecha: "2026-04-08", categoria: "Constancia" },
  { id: 3, nombre: "Top 3", descripcion: "Llegaste al top 3 del ranking", emoji: "🏆", xp: 200, obtenido: true, fecha: "2026-04-15", categoria: "Ranking" },
  { id: 4, nombre: "Madrugador", descripcion: "Enviaste una tarea antes de tiempo", emoji: "⏰", xp: 75, obtenido: true, fecha: "2026-04-20", categoria: "Académico" },
  { id: 5, nombre: "Velocista", descripcion: "Completaste 5 tareas en un día", emoji: "⚡", xp: 150, obtenido: false, fecha: null, categoria: "Especial" },
  { id: 6, nombre: "Estudiante del Mes", descripcion: "Mejor promedio del mes", emoji: "👑", xp: 300, obtenido: false, fecha: null, categoria: "Especial" },
  { id: 7, nombre: "Racha x7", descripcion: "Ingresa 7 días seguidos", emoji: "🔥", xp: 120, obtenido: false, fecha: null, categoria: "Constancia" },
  { id: 8, nombre: "Bibliófilo", descripcion: "Lee 10 recursos diferentes", emoji: "📚", xp: 80, obtenido: false, fecha: null, categoria: "Académico" },
];

const badges = [
  { nombre: "Novato", emoji: "🥉", obtenido: true },
  { nombre: "Aprendiz", emoji: "🥈", obtenido: true },
  { nombre: "Explorador", emoji: "🥇", obtenido: false },
  { nombre: "Maestro", emoji: "💎", obtenido: false },
];

const categorias = ["Todas", "Académico", "Constancia", "Ranking", "Especial"];

export default function LogrosPage() {
  const [categoria, setCategoria] = useState("Todas");

  const filtered = achievements.filter(a =>
    categoria === "Todas" || a.categoria === categoria
  );

  const obtenidos = achievements.filter(a => a.obtenido).length;
  const totalXp = achievements.filter(a => a.obtenido).reduce((acc, a) => acc + a.xp, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900">Logros</h1>
          <p className="text-gray-500 mt-1">Tus achievements y badges desbloqueados</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Logros obtenidos", value: `${obtenidos}/${achievements.length}`, icon: Trophy, color: "yellow" },
            { label: "XP ganada en logros", value: totalXp, icon: Star, color: "blue" },
            { label: "Badges desbloqueados", value: `${badges.filter(b => b.obtenido).length}/${badges.length}`, icon: CheckCircle, color: "green" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
              <div className={`w-10 h-10 bg-${s.color}-50 rounded-xl flex items-center justify-center mb-3`}>
                <s.icon size={20} className={`text-${s.color}-600`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <h3 className="font-semibold text-gray-800 mb-4">Badges de nivel</h3>
          <div className="flex gap-4 flex-wrap">
            {badges.map((badge, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 ${
                  badge.obtenido
                    ? "border-yellow-300 bg-yellow-50"
                    : "border-gray-100 bg-gray-50 opacity-50"
                }`}
              >
                <span className="text-3xl">{badge.emoji}</span>
                <span className="text-xs font-medium text-gray-700">{badge.nombre}</span>
                {!badge.obtenido && <Lock size={12} className="text-gray-400" />}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoria(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                categoria === cat
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-all ${
                a.obtenido ? "border-yellow-200" : "border-gray-100 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{a.emoji}</span>
                {a.obtenido
                  ? <CheckCircle size={18} className="text-green-500" />
                  : <Lock size={18} className="text-gray-300" />
                }
              </div>
              <h4 className="font-semibold text-gray-800">{a.nombre}</h4>
              <p className="text-xs text-gray-500 mt-1">{a.descripcion}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  +{a.xp} XP
                </span>
                {a.obtenido && a.fecha && (
                  <span className="text-xs text-gray-400">{a.fecha}</span>
                )}
                {!a.obtenido && (
                  <span className="text-xs text-gray-400">Bloqueado</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
