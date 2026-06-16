"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Plus, Trash2, ChevronLeft, Calendar, FileText } from "lucide-react";
import Link from "next/link";

interface Materia {
  id: string;
  name: string;
}

interface Evaluacion {
  id: string;
  title: string;
  type: string;
  dueDate: string | null;
  maxScore: number;
  isPublished: boolean;
  class: { id: string; name: string; subjectId: string };
  _count: { grades: number };
}

const tipos = ["QUIZ", "EXAM", "ORAL", "PROJECT", "PRACTICAL", "HOMEWORK", "PARTICIPATION"];

export default function EvaluacionesProfesorPage() {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", subjectId: "", type: "QUIZ", dueDate: "", maxScore: 100,
  });

  const cargarEvaluaciones = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/evaluations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setEvaluaciones(data.data);
    } catch {
      setError("Error al cargar evaluaciones");
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    cargarEvaluaciones();
    cargarMaterias();
  }, []);

  const handleCrear = async () => {
    if (!form.title || !form.subjectId) {
      setError("Título y materia son requeridos");
      return;
    }
    setGuardando(true);
    setError("");
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        await cargarEvaluaciones();
        setForm({ title: "", subjectId: "", type: "QUIZ", dueDate: "", maxScore: 100 });
        setShowForm(false);
      } else {
        setError(data.error?.message ?? "Error al crear evaluación");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/evaluations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setEvaluaciones(evaluaciones.filter(e => e.id !== id));
      }
    } catch {
      setError("Error al eliminar");
    }
  };

  const handlePublicar = async (id: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/evaluations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPublished: true }),
      });
      const data = await res.json();
      if (data.success) {
        setEvaluaciones(evaluaciones.map(e => e.id === id ? { ...e, isPublished: true } : e));
      }
    } catch {
      setError("Error al publicar");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Link href="/profesor" className="text-gray-400 hover:text-gray-600">
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Evaluaciones</h1>
              <p className="text-gray-500 text-sm mt-0.5">Conectado a la base de datos</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium"
          >
            <Plus size={16} />
            Nueva evaluación
          </motion.button>
        </motion.div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100 overflow-hidden"
            >
              <h3 className="font-semibold text-gray-800 mb-4">Nueva evaluación</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Título *</label>
                  <input
                    type="text"
                    placeholder="Ej: Prueba Unidad 2"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-gray-100 rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Materia *</label>
                  <select
                    value={form.subjectId}
                    onChange={e => setForm({ ...form, subjectId: e.target.value })}
                    className="w-full bg-gray-100 rounded-xl px-3 py-2 text-sm outline-none"
                  >
                    <option value="">Selecciona una materia</option>
                    {materias.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Tipo</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-gray-100 rounded-xl px-3 py-2 text-sm outline-none"
                  >
                    {tipos.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Fecha</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full bg-gray-100 rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Puntaje máximo</label>
                  <input
                    type="number"
                    value={form.maxScore}
                    onChange={e => setForm({ ...form, maxScore: Number(e.target.value) })}
                    className="w-full bg-gray-100 rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleCrear}
                  disabled={guardando}
                  className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {guardando ? "Guardando..." : "Crear evaluación"}
                </button>
                <button
                  onClick={() => { setShowForm(false); setError(""); }}
                  className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && (
          <div className="space-y-3">
            {evaluaciones.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FileText size={40} className="mx-auto mb-3 opacity-30" />
                <p>No hay evaluaciones creadas aún</p>
              </div>
            ) : (
              evaluaciones.map((e, i) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                        <FileText size={18} className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-800">{e.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            e.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {e.isPublished ? "publicada" : "borrador"}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 font-medium">
                            {e.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span>{e.class?.name}</span>
                          {e.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar size={10} />{new Date(e.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          <span>{e._count?.grades ?? 0} calificadas</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!e.isPublished && (
                        <button
                          onClick={() => handlePublicar(e.id)}
                          className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors font-medium"
                        >
                          Publicar
                        </button>
                      )}
                      <button
                        onClick={() => handleEliminar(e.id)}
                        className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={14} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}