"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { Plus, Trash2, ChevronLeft, Calendar, BookOpen, Users, ChevronRight } from "lucide-react";

interface Materia {
  id: string;
  name: string;
}

interface Tarea {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  status: string;
  class?: { name: string };
}

export default function ProfesorTareasPage() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", maxScore: 100, classId: "" });
  const [creando, setCreando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const [tareasRes, materiasRes] = await Promise.all([
          fetch("/api/assignments", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/subjects", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const tareasData = await tareasRes.json();
        const materiasData = await materiasRes.json();
        if (tareasData.success) setTareas(tareasData.data);
        if (materiasData.success) setMaterias(materiasData.data);
      } catch {
        // silencioso
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const handleCrear = async () => {
    if (!form.title || !form.dueDate || !form.classId) {
      setError("Completa título, fecha límite y materia");
      return;
    }
    setCreando(true);
    setError("");
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, maxScore: Number(form.maxScore), status: "PUBLISHED" }),
      });
      const data = await res.json();
      if (data.success) {
        setTareas(prev => [data.data, ...prev]);
        setForm({ title: "", description: "", dueDate: "", maxScore: 100, classId: "" });
        setMostrarForm(false);
      } else {
        setError(data.error?.message ?? "Error al crear tarea");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setCreando(false);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Eliminar esta tarea?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/assignments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setTareas(prev => prev.filter(t => t.id !== id));
    } catch {
      // silencioso
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/profesor" className="text-gray-400 hover:text-gray-600">
              <ChevronLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
          </div>
          <p className="text-gray-500 ml-8">Gestiona las tareas de tus clases</p>
        </motion.div>

        {/* Botón nueva tarea */}
        <button
          onClick={() => setMostrarForm(v => !v)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Nueva tarea
        </button>

        {/* Formulario */}
        <AnimatePresence>
          {mostrarForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4"
            >
              <h3 className="font-semibold text-gray-800">Nueva tarea</h3>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Título</label>
                  <input
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
                    placeholder="Ej: Tarea 1 - Álgebra"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Materia</label>
                  <select
                    value={form.classId}
                    onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
                  >
                    <option value="">Selecciona materia</option>
                    {materias.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Fecha límite</label>
                  <input
                    type="datetime-local"
                    value={form.dueDate}
                    onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Puntaje máximo</label>
                  <input
                    type="number"
                    value={form.maxScore}
                    onChange={e => setForm(f => ({ ...f, maxScore: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">Descripción</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
                    placeholder="Instrucciones de la tarea..."
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setMostrarForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCrear}
                  disabled={creando}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  {creando ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={14} />}
                  {creando ? "Creando..." : "Crear tarea"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista tareas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
              Cargando tareas...
            </div>
          ) : tareas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <BookOpen size={40} className="mb-3 opacity-30" />
              <p>No hay tareas creadas</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {tareas.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{t.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      {t.class && <span className="flex items-center gap-1"><BookOpen size={10} />{t.class.name}</span>}
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(t.dueDate).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <span>Puntaje: {t.maxScore}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/profesor/tareas/entregas/${t.id}`}
                      className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Users size={12} />
                      Ver entregas
                      <ChevronRight size={12} />
                    </Link>
                    <button
                      onClick={() => handleEliminar(t.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}