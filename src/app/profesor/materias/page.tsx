"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Plus, Trash2, ChevronLeft, BookOpen, RefreshCw } from "lucide-react";
import Link from "next/link";

interface Materia {
  id: string;
  name: string;
  code: string;
  description: string | null;
  color: string;
  credits: number;
}

const colores = [
  { clase: "bg-blue-500", valor: "#3b82f6" },
  { clase: "bg-purple-500", valor: "#a855f7" },
  { clase: "bg-green-500", valor: "#22c55e" },
  { clase: "bg-red-500", valor: "#ef4444" },
  { clase: "bg-orange-500", valor: "#f97316" },
  { clase: "bg-pink-500", valor: "#ec4899" },
];

function getColorClase(color: string) {
  const found = colores.find(c => c.valor === color);
  return found ? found.clase : "bg-blue-500";
}

export default function MateriasProfesorPage() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", code: "", description: "", color: "#3b82f6", credits: 0,
  });

  const cargarMaterias = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/subjects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMaterias(data.data);
    } catch {
      setError("Error al cargar materias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMaterias();
  }, []);

  const handleCrear = async () => {
    if (!form.name || !form.code) {
      setError("Nombre y código son requeridos");
      return;
    }
    setGuardando(true);
    setError("");
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setMaterias([...materias, data.data]);
        setForm({ name: "", code: "", description: "", color: "#3b82f6", credits: 0 });
        setShowForm(false);
      } else {
        setError(data.error?.message ?? "Error al crear materia");
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
      const res = await fetch(`/api/subjects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMaterias(materias.filter(m => m.id !== id));
      } else {
        setError(data.error?.message ?? "Error al eliminar");
      }
    } catch {
      setError("Error de conexión");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
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
              <h1 className="text-2xl font-bold text-gray-900">Mis Materias</h1>
              <p className="text-gray-500 text-sm">Conectado a la base de datos</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={cargarMaterias}
              className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <RefreshCw size={16} className="text-gray-600" />
            </button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium"
            >
              <Plus size={16} />
              Nueva materia
            </motion.button>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Formulario */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100 overflow-hidden"
            >
              <h3 className="font-semibold text-gray-800 mb-4">Nueva materia</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Nombre *</label>
                  <input
                    type="text"
                    placeholder="Ej: Matemáticas"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-gray-100 rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Código *</label>
                  <input
                    type="text"
                    placeholder="Ej: MAT101"
                    value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="w-full bg-gray-100 rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">Descripción</label>
                  <input
                    type="text"
                    placeholder="Descripción breve"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-gray-100 rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Créditos</label>
                  <input
                    type="number"
                    value={form.credits}
                    onChange={e => setForm({ ...form, credits: Number(e.target.value) })}
                    className="w-full bg-gray-100 rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Color</label>
                  <div className="flex gap-2">
                    {colores.map(c => (
                      <button
                        key={c.valor}
                        onClick={() => setForm({ ...form, color: c.valor })}
                        className={`w-7 h-7 rounded-full ${c.clase} ${
                          form.color === c.valor ? "ring-2 ring-offset-2 ring-blue-500" : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleCrear}
                  disabled={guardando}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {guardando ? "Guardando..." : "Crear materia"}
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

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Grid materias */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {materias.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-gray-400">
                <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                <p>No hay materias creadas aún</p>
                <p className="text-sm mt-1">Crea la primera materia con el botón de arriba</p>
              </div>
            ) : (
              materias.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className={`${getColorClase(m.color ?? "#3b82f6")} p-5`}>
                    <BookOpen size={24} className="text-white mb-2" />
                    <h3 className="text-white font-bold text-lg">{m.name}</h3>
                    <p className="text-white/70 text-sm">{m.code}</p>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-500">{m.description ?? "Sin descripción"}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-400">{m.credits} créditos</span>
                      <button
                        onClick={() => handleEliminar(m.id)}
                        className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={13} className="text-red-500" />
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