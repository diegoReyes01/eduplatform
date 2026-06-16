"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Trophy, Star, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const rankingData = [
  { posicion: 1, nombre: "Ana Martínez", username: "@ana_m", xp: 1250, nivel: 5, avatar: "AM", tendencia: "up" },
  { posicion: 2, nombre: "Carlos López", username: "@carlos_l", xp: 1100, nivel: 4, avatar: "CL", tendencia: "up" },
  { posicion: 3, nombre: "Diego Reyes", username: "@Naxoo01", xp: 365, nivel: 2, avatar: "DR", tendencia: "same", esYo: true },
  { posicion: 4, nombre: "María Torres", username: "@maria_t", xp: 320, nivel: 2, avatar: "MT", tendencia: "down" },
  { posicion: 5, nombre: "Pedro Silva", username: "@pedro_s", xp: 290, nivel: 2, avatar: "PS", tendencia: "down" },
  { posicion: 6, nombre: "Laura García", username: "@laura_g", xp: 250, nivel: 1, avatar: "LG", tendencia: "up" },
  { posicion: 7, nombre: "Sofía Ruiz", username: "@sofia_r", xp: 200, nivel: 1, avatar: "SR", tendencia: "same" },
  { posicion: 8, nombre: "Miguel Díaz", username: "@miguel_d", xp: 180, nivel: 1, avatar: "MD", tendencia: "down" },
];

const chartData = rankingData.slice(0, 5).map(r => ({
  nombre: r.nombre.split(" ")[0],
  xp: r.xp,
}));

const periodos = ["Esta semana", "Este mes", "Todo el tiempo"];

function getTendenciaIcon(tendencia: string) {
  if (tendencia === "up") return <TrendingUp size={14} className="text-green-500" />;
  if (tendencia === "down") return <TrendingDown size={14} className="text-red-500" />;
  return <Minus size={14} className="text-gray-400" />;
}

function getMedalColor(posicion: number) {
  if (posicion === 1) return "text-yellow-500";
  if (posicion === 2) return "text-gray-400";
  if (posicion === 3) return "text-orange-400";
  return "text-gray-300";
}

function getMedalEmoji(posicion: number) {
  if (posicion === 1) return "🥇";
  if (posicion === 2) return "🥈";
  if (posicion === 3) return "🥉";
  return posicion.toString();
}

export default function RankingPage() {
  const [periodo, setPeriodo] = useState("Esta semana");

  const miPosicion = rankingData.find(r => r.esYo);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900">Ranking</h1>
          <p className="text-gray-500 mt-1">Tabla de posiciones de tu curso</p>
        </motion.div>

        {/* Mi posición */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white"
        >
          <p className="text-blue-100 text-sm mb-2">Tu posición actual</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-lg font-bold">
                #{miPosicion?.posicion}
              </div>
              <div>
                <p className="font-bold text-xl">{miPosicion?.nombre}</p>
                <p className="text-blue-200 text-sm">{miPosicion?.username}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{miPosicion?.xp}</p>
              <p className="text-blue-200 text-sm">XP total</p>
            </div>
          </div>
        </motion.div>

        {/* Top 3 */}
        <div className="grid grid-cols-3 gap-4">
          {[rankingData[1], rankingData[0], rankingData[2]].map((r, i) => (
            <motion.div
              key={r.posicion}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-white rounded-2xl p-4 shadow-sm border-2 text-center ${
                r.posicion === 1 ? "border-yellow-300 mt-0" : "border-gray-100 mt-4"
              }`}
            >
              <div className="text-2xl mb-2">{getMedalEmoji(r.posicion)}</div>
              <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center text-white text-sm font-bold mb-2 ${
                r.posicion === 1 ? "bg-yellow-500" : r.posicion === 2 ? "bg-gray-400" : "bg-orange-400"
              }`}>
                {r.avatar}
              </div>
              <p className="text-sm font-semibold text-gray-800 truncate">{r.nombre.split(" ")[0]}</p>
              <p className="text-xs text-blue-600 font-medium mt-1">{r.xp} XP</p>
            </motion.div>
          ))}
        </div>

        {/* Gráfico */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <h3 className="font-semibold text-gray-800 mb-4">Top 5 — XP acumulada</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="xp" radius={[6, 6, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={index === 0 ? "#eab308" : index === 1 ? "#6b7280" : index === 2 ? "#f97316" : "#2563eb"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Filtro período */}
        <div className="flex gap-2">
          {periodos.map(p => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                periodo === p
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Tabla ranking completa */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Clasificación completa</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {rankingData.map((r, i) => (
              <motion.div
                key={r.posicion}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors ${
                  r.esYo ? "bg-blue-50 hover:bg-blue-50" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-8 text-center font-bold text-lg ${getMedalColor(r.posicion)}`}>
                    {getMedalEmoji(r.posicion)}
                  </span>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    r.esYo ? "bg-blue-600" : "bg-gray-400"
                  }`}>
                    {r.avatar}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${r.esYo ? "text-blue-700" : "text-gray-800"}`}>
                      {r.nombre} {r.esYo && <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full ml-1">Tú</span>}
                    </p>
                    <p className="text-xs text-gray-400">{r.username} · Nivel {r.nivel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getTendenciaIcon(r.tendencia)}
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">{r.xp}</p>
                    <p className="text-xs text-gray-400">XP</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
