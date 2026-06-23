"use client";

import { useEffect, useState } from "react";
import { useXP } from "@/hooks/useXP";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  BookOpen,
  ClipboardList,
  TrendingUp,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const xpData = [
  { dia: "Lun", xp: 20 },
  { dia: "Mar", xp: 45 },
  { dia: "Mié", xp: 30 },
  { dia: "Jue", xp: 80 },
  { dia: "Vie", xp: 60 },
  { dia: "Sáb", xp: 90 },
  { dia: "Dom", xp: 40 },
];

const tareasRecientes = [
  { materia: "Matemáticas", tarea: "Álgebra lineal", estado: "pendiente", fecha: "Hoy" },
  { materia: "Física", tarea: "Cinemática", estado: "entregado", fecha: "Ayer" },
  { materia: "Historia", tarea: "Ensayo WWII", estado: "pendiente", fecha: "Mañana" },
];

interface User {
  firstName: string;
  lastName: string;
  role: string;
}

interface ExperienceData {
  totalXp: number;
  currentXp: number;
  level: { number: number; name: string; xpRequired: number; xpMax: number };
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [experience, setExperience] = useState<ExperienceData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const { verificarLoginDiario } = useXP();
    verificarLoginDiario();
    if (stored) setUser(JSON.parse(stored));

    const cargarExperiencia = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("/api/experience", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setExperience(data.data);
      } catch {
        // silencioso
      }
    };
    cargarExperiencia();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Bienvenida */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenido, {user?.firstName ?? "Estudiante"} 👋
          </h1>
          <p className="text-gray-500 mt-1">Panel de control</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Materias", value: "6", icon: BookOpen, color: "blue", bg: "bg-blue-50" },
            { label: "Tareas pendientes", value: "3", icon: ClipboardList, color: "orange", bg: "bg-orange-50" },
            { label: "XP Total", value: "365", icon: Star, color: "yellow", bg: "bg-yellow-50" },
            { label: "Promedio", value: "6.2", icon: TrendingUp, color: "green", bg: "bg-green-50" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon size={20} className={`text-${stat.color}-600`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Nivel y XP */}
{/* Nivel y XP */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-100 text-sm">Nivel actual</p>
            <p className="text-3xl font-bold">
              Nivel {experience?.level.number ?? 1} — {experience?.level.name ?? "Novato"}
            </p>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <Star size={28} className="text-yellow-300" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-blue-100">
            <span>{experience?.totalXp ?? 0} XP</span>
            <span>{experience?.level.xpMax ?? 100} XP</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: experience
                  ? `${Math.min(100, Math.round((experience.currentXp / (experience.level.xpMax - experience.level.xpRequired)) * 100))}%`
                  : "0%",
              }}
              transition={{ duration: 1, delay: 0.5 }}
              className="bg-yellow-300 h-3 rounded-full"
            />
          </div>
          <p className="text-blue-100 text-xs">
            {experience ? Math.max(0, experience.level.xpMax - experience.totalXp) : 100} XP para el siguiente nivel
          </p>
        </div>
      </motion.div>
        
        {/* Gráfico XP + Tareas Recientes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <h3 className="font-semibold text-gray-800 mb-4">XP esta semana</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={xpData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="xp"
                  stroke="#2563eb"
                  fill="#dbeafe"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Tareas Recientes */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <h3 className="font-semibold text-gray-800 mb-4">Próximas tareas</h3>
            <div className="space-y-3">
              {tareasRecientes.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    {t.estado === "entregado" ? (
                      <CheckCircle size={18} className="text-green-500" />
                    ) : (
                      <AlertCircle size={18} className="text-orange-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-800">{t.tarea}</p>
                      <p className="text-xs text-gray-400">{t.materia}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={12} />
                    {t.fecha}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}