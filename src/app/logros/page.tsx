"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Trophy, Star, Lock, CheckCircle } from "lucide-react";

interface AchievementDB {
  id: string;
  nombre: string;
  descripcion: string;
  emoji: string;
  xp: number;
  categoria: string;
  obtenido: boolean;
  fecha: string | null;
}

const badges = [
  { nombre: "Novato", emoji: "🥉", obtenido: true },
  { nombre: "Aprendiz", emoji: "🥈", obtenido: true },
  { nombre: "Explorador", emoji: "🥇", obtenido: false },
  { nombre: "Maestro", emoji: "💎", obtenido: false },
];

export default function LogrosPage() {
  const [achievements, setAchievements] = useState<AchievementDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState("Todas");

  useEffect(() => {
    const cargar = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("/api/achievements", {
          headers: { Authorization: "Bearer " + token },
        });
        const data = await res.json();
        if (data.success) setAchievements(data.data);
      } catch {
        // silencioso
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const categorias = ["Todas", ...Array.from(new Set(achievements.map((a) => a.categoria)))];

  const filtered = achievements.filter((a) => categoria === "Todas" || a.categoria === categoria);

  const obtenidos = achievements.filter((a) => a.obtenido).length;
  const totalXp = achievements.filter((a) => a.obtenido).reduce((acc, a) => acc + a.xp, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900">Logros</h1>
          <p className="text-gray-500 mt-1">Tus achievements y badges desbloqueados</p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
            Cargando logros...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Logros obtenidos", value: obtenidos + "/" + achievements.length, icon: Trophy, color: "yellow" },
                { label: "XP ganada en logros", value: totalXp.toString(), icon: Star, color: "blue" },
                { label: "Badges desbloqueados", value: badges.filter((b) => b.obtenido).length + "/" + badges.length, icon: CheckCircle, color: "green" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                >
                  <div className={"w-10 h-10 bg-" + s.color + "-50 rounded-xl flex items-center justify-center mb-3"}>
                    <s.icon size={20} className={"text-" + s.color + "-600"} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                </motion.div>
              ))}
            </div>

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
                    className={
                      "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 " +
                      (badge.obtenido ? "border-yellow-300 bg-yellow-50" : "border-gray-100 bg-gray-50 opacity-50")
                    }
                  >
                    <span className="text-3xl">{badge.emoji}</span>
                    <span className="text-xs font-medium text-gray-700">{badge.nombre}</span>
                    {!badge.obtenido && <Lock size={12} className="text-gray-400" />}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <div className="flex gap-2 flex-wrap">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoria(cat)}
                  className={
                    "px-4 py-2 rounded-xl text-sm font-medium transition-colors " +
                    (categoria === cat ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50")
                  }
                >
                  {cat}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No hay logros en esta categoria</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -2 }}
                    className={
                      "bg-white rounded-2xl p-5 shadow-sm border-2 transition-all " +
                      (a.obtenido ? "border-yellow-200" : "border-gray-100 opacity-60")
                    }
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{a.emoji}</span>
                      {a.obtenido ? (
                        <CheckCircle size={18} className="text-green-500" />
                      ) : (
                        <Lock size={18} className="text-gray-300" />
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-800">{a.nombre}</h4>
                    <p className="text-xs text-gray-500 mt-1">{a.descripcion}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">+{a.xp} XP</span>
                      {a.obtenido && a.fecha && (
                        <span className="text-xs text-gray-400">
                          {new Date(a.fecha).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      )}
                      {!a.obtenido && <span className="text-xs text-gray-400">Bloqueado</span>}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
