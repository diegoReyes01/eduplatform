"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ClipboardList, Calendar, AlertCircle, CheckCircle, Clock, Send } from "lucide-react";
import { useXP } from "@/hooks/useXP";

interface Tarea {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  status: string;
  class: { id: string; name: string; subjectId: string };
}

function getDiasRestantes(fecha: string) {
  const hoy = new Date();
  const dueDate = new Date(fecha);
  const diff = Math.ceil((dueDate.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

function getEstadoColor(dias: number) {
  if (dias < 0) return { bg: "bg-gray-100", text: "text-gray-500", label: "Vencida" };
  if (dias === 0) return { bg: "bg-red-100", text: "text-red-600", label: "Vence hoy" };
  if (dias <= 2) return { bg: "bg-orange-100", text: "text-orange-600", label: `${dias} días` };
  return { bg: "bg-green-100", text: "text-green-600", label: `${dias} días` };
}

export default function TareasEstudiantePage() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<"todas" | "pendientes" | "vencidas">("todas");
  const [entregadas, setEntregadas] = useState<Set<string>>(new Set());
  const [entregando, setEntregando] = useState<string | null>(null);
  const [xpNotif, setXpNotif] = useState<string | null>(null);
  const { ganarXP } = useXP();

  useEffect(() => {
    const cargar = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("/api/assignments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setTareas(data.data.filter((t: Tarea) => t.status === "PUBLISHED"));
        }
      } catch {
        // silencioso
      } finally {
        setLoading(false);
      }
    };
    cargar();

    // Cargar entregas guardadas localmente
    const saved = localStorage.getItem("tareasEntregadas");
    if (saved) setEntregadas(new Set(JSON.parse(saved)));
  }, []);

  const handleEntregar = async (tarea: Tarea) => {
    if (entregadas.has(tarea.id) || entregando === tarea.id) return;

    setEntregando(tarea.id);
    try {
      await ganarXP("COMPLETAR_TAREA", `Entregó tarea: ${tarea.title}`);

      const nuevas = new Set(entregadas).add(tarea.id);
      setEntregadas(nuevas);
      localStorage.setItem("tareasEntregadas", JSON.stringify([...nuevas]));

      setXpNotif(`+XP por entregar "${tarea.title}"`);
      setTimeout(() => setXpNotif(null), 3000);
    } catch {
      // silencioso
    } finally {
      setEntregando(null);
    }
  };

  const filtered = tareas.filter(t => {
    const dias = getDiasRestantes(t.dueDate);
    if (filtro === "pendientes") return dias >= 0;
    if (filtro === "vencidas") return dias < 0;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Notificación XP */}
        <AnimatePresence>
          {xpNotif && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 right-6 z-50 bg-green-500 text-white px-5 py-3 rounded-2xl shadow-lg font-medium flex items-center gap-2"
            >
              <CheckCircle size={18} />
              {xpNotif}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900">Mis Tareas</h1>
          <p className="text-gray-500 mt-1">Tareas publicadas por tus profesores</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total", value: tareas.length, icon: ClipboardList, color: "blue" },
            { label: "Pendientes", value: tareas.filter(t => getDiasRestantes(t.dueDate) >= 0).length, icon: Clock, color: "orange" },
            { label: "Vencidas", value: tareas.filter(t => getDiasRestantes(t.dueDate) < 0).length, icon: AlertCircle, color: "red" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center"
            >
              <div className={`w-9 h-9 bg-${s.color}-50 rounded-xl flex items-center justify-center mb-2 mx-auto`}>
                <s.icon size={18} className={`text-${s.color}-600`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          {[
            { id: "todas", label: "Todas" },
            { id: "pendientes", label: "Pendientes" },
            { id: "vencidas", label: "Vencidas" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id as typeof filtro)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filtro === f.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && (
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
                <p>No hay tareas en esta categoría</p>
              </div>
            ) : (
              filtered.map((t, i) => {
                const dias = getDiasRestantes(t.dueDate);
                const estado = getEstadoColor(dias);
                const yaEntregada = entregadas.has(t.id);
                const cargando = entregando === t.id;

                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`bg-white rounded-2xl p-5 shadow-sm border transition-colors ${
                      yaEntregada ? "border-green-200 bg-green-50/30" : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-800">{t.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estado.bg} ${estado.text}`}>
                            {estado.label}
                          </span>
                          {yaEntregada && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-600 flex items-center gap-1">
                              <CheckCircle size={10} /> Entregada
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">{t.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                          <span>{t.class?.name}</span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(t.dueDate).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}
                          </span>
                          <span>Puntaje máximo: {t.maxScore}</span>
                        </div>
                      </div>

                      {yaEntregada ? (
                        <div className="flex items-center gap-1 text-green-600 text-sm font-medium px-4 py-2">
                          <CheckCircle size={16} />
                          Listo
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEntregar(t)}
                          disabled={cargando || dias < 0}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                            dias < 0
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : cargando
                              ? "bg-blue-400 text-white cursor-wait"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {cargando ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Send size={14} />
                          )}
                          {cargando ? "Enviando..." : dias < 0 ? "Vencida" : "Entregar"}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}