"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { ChevronLeft, Search, Users } from "lucide-react";

interface Alumno {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: { name: string };
  experience?: {
    totalXp: number;
    level: { number: number; name: string };
  };
}

export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("/api/profesor/alumnos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setAlumnos(data.data);
      } catch {
        // silencioso
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const filtrados = alumnos.filter(a =>
    `${a.firstName} ${a.lastName} ${a.email}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/profesor" className="text-gray-400 hover:text-gray-600">
              <ChevronLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Alumnos</h1>
          </div>
          <p className="text-gray-500 ml-8">Lista de estudiantes registrados</p>
        </motion.div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar alumno..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
              Cargando alumnos...
            </div>
          ) : filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Users size={40} className="mb-3 opacity-30" />
              <p>{busqueda ? "Sin resultados para la búsqueda" : "No hay alumnos registrados"}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtrados.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                      {a.firstName[0]}{a.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{a.firstName} {a.lastName}</p>
                      <p className="text-xs text-gray-400">{a.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-xs text-gray-400">Nivel</p>
                      <p className="text-sm font-semibold text-blue-600">
                        {a.experience ? `${a.experience.level.number} — ${a.experience.level.name}` : "Sin datos"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">XP Total</p>
                      <p className="text-sm font-semibold text-yellow-600">
                        {a.experience?.totalXp ?? 0} XP
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <p className="text-xs text-gray-400 text-center">
          {filtrados.length} alumno{filtrados.length !== 1 ? "s" : ""} encontrado{filtrados.length !== 1 ? "s" : ""}
        </p>
      </div>
    </DashboardLayout>
  );
}