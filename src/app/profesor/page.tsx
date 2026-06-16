"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import {
  BookOpen, ClipboardList, Users, TrendingUp,
  Plus, FileText, Video, ChevronRight, Check, X,
} from "lucide-react";

const stats = [
  { label: "Materias activas", value: "6", icon: BookOpen, color: "blue" },
  { label: "Tareas creadas", value: "24", icon: ClipboardList, color: "green" },
  { label: "Estudiantes", value: "45", icon: Users, color: "purple" },
  { label: "Promedio clase", value: "6.1", icon: TrendingUp, color: "orange" },
];

const acciones = [
  { label: "Nueva materia", href: "/profesor/materias", icon: BookOpen, color: "bg-blue-600" },
  { label: "Nueva tarea", href: "/profesor/tareas", icon: ClipboardList, color: "bg-green-600" },
  { label: "Nueva evaluación", href: "/profesor/evaluaciones", icon: FileText, color: "bg-purple-600" },
];

const progreso_alumnos = [
  { nombre: "Ana Martínez", materia: "Matemáticas", progreso: 85, promedio: 6.8 },
  { nombre: "Carlos López", materia: "Física", progreso: 72, promedio: 6.2 },
  { nombre: "Diego Reyes", materia: "Química", progreso: 45, promedio: 5.8 },
  { nombre: "María Torres", materia: "Biología", progreso: 90, promedio: 7.0 },
  { nombre: "Pedro Silva", materia: "Historia", progreso: 60, promedio: 6.0 },
];

interface ArchivoSubido {
  url: string;
  title: string;
  size: number;
  type: string;
}

interface MateriaOption {
  id: string;
  name: string;
}

export default function ProfesorPage() {
  const [subiendo, setSubiendo] = useState<string | null>(null);
  const [archivos, setArchivos] = useState<ArchivoSubido[]>([]);
  const [error, setError] = useState("");
  const [materias, setMaterias] = useState<MateriaOption[]>([]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");

  useEffect(() => {
    const cargarMaterias = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("/api/subjects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setMaterias(data.data);
      } catch {
        // silencioso
      }
    };
    cargarMaterias();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, tipo: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!materiaSeleccionada) {
      setError("Selecciona una materia antes de subir un archivo");
      e.target.value = "";
      return;
    }

    setSubiendo(tipo);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("classId", materiaSeleccionada);
      formData.append("subjectId", materiaSeleccionada);
      formData.append("title", file.name);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setArchivos(prev => [
          { url: data.data.url, title: data.data.title, size: file.size, type: file.type },
          ...prev,
        ]);
      } else {
        setError(data.error?.message ?? "Error al subir archivo");
      }
    } catch {
      setError("Error de conexión al subir archivo");
    } finally {
      setSubiendo(null);
      e.target.value = "";
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900">Panel del Profesor</h1>
          <p className="text-gray-500 mt-1">Gestiona tus clases, tareas y evaluaciones</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
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

        {/* Acciones rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <h3 className="font-semibold text-gray-800 mb-4">Acciones rápidas</h3>
          <div className="flex gap-3 flex-wrap">
            {acciones.map((a, i) => (
              <Link key={i} href={a.href}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-2 ${a.color} text-white px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer`}
                >
                  <Plus size={16} />
                  {a.label}
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Subir recursos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <h3 className="font-semibold text-gray-800 mb-4">Subir recursos</h3>

          {/* Selector de materia */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 mb-1 block">Materia</label>
            <select
              value={materiaSeleccionada}
              onChange={e => setMateriaSeleccionada(e.target.value)}
              className="w-full sm:w-64 bg-gray-100 rounded-xl px-3 py-2 text-sm outline-none"
            >
              <option value="">Selecciona una materia</option>
              {materias.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            {materias.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">
                No hay materias creadas. <Link href="/profesor/materias" className="text-blue-600 hover:underline">Crear una materia</Link>
              </p>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
              <X size={14} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Subir PDF", icon: FileText, color: "border-red-200 bg-red-50 text-red-600", accept: ".pdf,application/pdf", tipo: "pdf" },
              { label: "Subir PPT/PPTX", icon: FileText, color: "border-orange-200 bg-orange-50 text-orange-600", accept: ".ppt,.pptx", tipo: "ppt" },
              { label: "Subir Video", icon: Video, color: "border-blue-200 bg-blue-50 text-blue-600", accept: "video/*", tipo: "video" },
            ].map((r, i) => (
              <label
                key={i}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed ${r.color} cursor-pointer hover:opacity-80 transition-opacity relative ${
                  !materiaSeleccionada ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                {subiendo === r.tipo ? (
                  <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <r.icon size={24} />
                )}
                <span className="text-sm font-medium">{r.label}</span>
                <span className="text-xs opacity-60">
                  {subiendo === r.tipo ? "Subiendo..." : "Clic para seleccionar"}
                </span>
                <input
                  type="file"
                  accept={r.accept}
                  className="hidden"
                  disabled={subiendo !== null || !materiaSeleccionada}
                  onChange={e => handleUpload(e, r.tipo)}
                />
              </label>
            ))}
          </div>

          {/* Lista de archivos subidos */}
          {archivos.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-gray-400 font-medium uppercase">Archivos subidos</p>
              {archivos.map((a, i) => (
                <motion.a
                  key={i}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Check size={14} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{a.title}</p>
                      <p className="text-xs text-gray-400">{formatSize(a.size)}</p>
                    </div>
                  </div>
                  <span className="text-xs text-blue-600">Ver archivo</span>
                </motion.a>
              ))}
            </div>
          )}
        </motion.div>

        {/* Progreso alumnos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Progreso de alumnos</h3>
            <Link href="/profesor/alumnos" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Ver todos <ChevronRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {progreso_alumnos.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                    {a.nombre.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{a.nombre}</p>
                    <p className="text-xs text-gray-400">{a.materia}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progreso</span>
                      <span>{a.progreso}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${a.progreso}%` }} />
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${a.promedio >= 6 ? "text-green-600" : "text-red-500"}`}>
                    {a.promedio}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}