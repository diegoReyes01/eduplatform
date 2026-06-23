"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, BookOpen, Clock, Users, ChevronRight, Play, FileText, Star } from "lucide-react";
import { useXP } from "@/hooks/useXP";

interface MateriaAPI {
  id: string;
  name: string;
  code: string;
  description: string | null;
  color: string | null;
  credits: number;
}

interface Materia {
  id: string | number;
  nombre: string;
  profesor: string;
  progreso: number;
  clases: number;
  color: string;
  emoji: string;
  descripcion: string;
  recursos: number;
}

interface Recurso {
  id: string;
  title: string;
  type: string;
  url: string;
  fileSize: number | null;
  mimeType: string | null;
}

const materiasDemo: Materia[] = [
  { id: 1, nombre: "Matemáticas", profesor: "Prof. García", progreso: 72, clases: 24, color: "from-blue-500 to-blue-700", emoji: "📐", descripcion: "Álgebra, cálculo y geometría analítica", recursos: 18 },
  { id: 2, nombre: "Física", profesor: "Prof. Martínez", progreso: 58, clases: 20, color: "from-purple-500 to-purple-700", emoji: "⚛️", descripcion: "Mecánica, termodinámica y electromagnetismo", recursos: 14 },
  { id: 3, nombre: "Química", profesor: "Prof. López", progreso: 45, clases: 18, color: "from-green-500 to-green-700", emoji: "🧪", descripcion: "Química orgánica e inorgánica", recursos: 12 },
  { id: 4, nombre: "Biología", profesor: "Prof. Torres", progreso: 80, clases: 22, color: "from-emerald-500 to-emerald-700", emoji: "🧬", descripcion: "Células, genética y ecosistemas", recursos: 20 },
  { id: 5, nombre: "Historia", profesor: "Prof. Ramírez", progreso: 35, clases: 16, color: "from-orange-500 to-orange-700", emoji: "📜", descripcion: "Historia universal y de Chile", recursos: 10 },
  { id: 6, nombre: "Lenguaje", profesor: "Prof. Silva", progreso: 90, clases: 26, color: "from-pink-500 to-pink-700", emoji: "📚", descripcion: "Literatura, redacción y comunicación", recursos: 22 },
];

const semanas = [
  {
    numero: 1,
    titulo: "Introducción",
    clases: [
      { nombre: "Clase 1 - Conceptos básicos", duracion: "45 min", tipo: "video", completada: true },
      { nombre: "Clase 2 - Ejercicios prácticos", duracion: "30 min", tipo: "pdf", completada: true },
    ],
  },
  {
    numero: 2,
    titulo: "Desarrollo",
    clases: [
      { nombre: "Clase 3 - Teoría avanzada", duracion: "60 min", tipo: "video", completada: true },
      { nombre: "Clase 4 - Casos de estudio", duracion: "45 min", tipo: "pdf", completada: false },
    ],
  },
  {
    numero: 3,
    titulo: "Aplicaciones",
    clases: [
      { nombre: "Clase 5 - Práctica guiada", duracion: "50 min", tipo: "video", completada: false },
      { nombre: "Clase 6 - Evaluación", duracion: "40 min", tipo: "pdf", completada: false },
    ],
  },
];

const coloresGradiente = [
  "from-blue-500 to-blue-700",
  "from-purple-500 to-purple-700",
  "from-green-500 to-green-700",
  "from-orange-500 to-orange-700",
  "from-pink-500 to-pink-700",
  "from-cyan-500 to-cyan-700",
];

const iconMap: Record<string, string> = {
  PDF: "📄",
  PRESENTATION: "📊",
  VIDEO: "🎬",
  IMAGE: "🖼️",
  AUDIO: "🎧",
  DOCUMENT: "📝",
  OTHER: "📁",
};

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function mapApiToMateria(m: MateriaAPI, index: number): Materia {
  return {
    id: m.id,
    nombre: m.name,
    profesor: "Tu profesor",
    progreso: 0,
    clases: 0,
    color: coloresGradiente[index % coloresGradiente.length]!,
    emoji: "📘",
    descripcion: m.description ?? `Materia ${m.code}`,
    recursos: 0,
  };
}

export default function MateriasPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Materia | null>(null);
  const [tab, setTab] = useState<"clases" | "recursos">("clases");
  const [favoritos, setFavoritos] = useState<(string | number)[]>([]);
  const [materiasReales, setMateriasReales] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [loadingRecursos, setLoadingRecursos] = useState(false);
  const { ganarXP } = useXP();

  useEffect(() => {
    const cargar = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("/api/subjects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setMateriasReales(data.data.map((m: MateriaAPI, i: number) => mapApiToMateria(m, i)));
        }
      } catch {
        // si falla, solo se muestran las demo
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const cargarRecursos = async (subjectId: string) => {
    setLoadingRecursos(true);
    setRecursos([]);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/resources?subjectId=${subjectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setRecursos(data.data);
    } catch {
      setRecursos([]);
    } finally {
      setLoadingRecursos(false);
    }
  };

  const materias = [...materiasReales, ...materiasDemo];

  const filtered = materias.filter(m =>
    m.nombre.toLowerCase().includes(search.toLowerCase()) ||
    m.profesor.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFavorito = (id: string | number) => {
    setFavoritos(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleSelectMateria = (materia: Materia) => {
    setSelected(materia);
    setTab("clases");
    if (typeof materia.id === "string") {
      cargarRecursos(materia.id);
    }
  };

  if (selected) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-r ${selected.color} rounded-2xl p-6 text-white`}
          >
            <button
              onClick={() => setSelected(null)}
              className="text-white/70 text-sm hover:text-white mb-4 flex items-center gap-1"
            >
              ← Volver a materias
            </button>
            <div className="flex items-center gap-4">
              <span className="text-5xl">{selected.emoji}</span>
              <div>
                <h1 className="text-3xl font-bold">{selected.nombre}</h1>
                <p className="text-white/80 mt-1">{selected.profesor}</p>
                <p className="text-white/70 text-sm mt-1">{selected.descripcion}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm text-white/80">
                <span>Progreso del curso</span>
                <span>{selected.progreso}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${selected.progreso}%` }}
                  transition={{ duration: 1 }}
                  className="bg-white h-2.5 rounded-full"
                />
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Clases", value: selected.clases, icon: BookOpen },
              { label: "Recursos", value: typeof selected.id === "string" ? recursos.length : selected.recursos, icon: FileText },
              { label: "Horas", value: Math.round(selected.clases * 0.75), icon: Clock },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center"
              >
                <s.icon size={20} className="text-gray-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
            {(["clases", "recursos"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t === "clases" ? "Clases por semana" : "Recursos"}
              </button>
            ))}
          </div>

          {tab === "clases" && (
            <div className="space-y-4">
              {semanas.map((semana, i) => (
                <motion.div
                  key={semana.numero}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">
                      Semana {semana.numero} — {semana.titulo}
                    </h3>
                    <span className="text-xs text-gray-400">
                      {semana.clases.filter(c => c.completada).length}/{semana.clases.length} completadas
                    </span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {semana.clases.map((clase, j) => (
                      <div key={j} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            clase.tipo === "video" ? "bg-blue-100" : "bg-red-100"
                          }`}>
                            {clase.tipo === "video"
                              ? <Play size={14} className="text-blue-600" />
                              : <FileText size={14} className="text-red-600" />
                            }
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${clase.completada ? "text-gray-400 line-through" : "text-gray-800"}`}>
                              {clase.nombre}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock size={10} /> {clase.duracion}
                            </p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          clase.completada ? "bg-green-500 border-green-500" : "border-gray-300"
                        }`}>
                          {clase.completada && <span className="text-white text-xs">✓</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {tab === "recursos" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {loadingRecursos && (
                <div className="col-span-2 flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!loadingRecursos && typeof selected.id === "string" && recursos.length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-400">
                  <FileText size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No hay recursos disponibles para esta materia</p>
                  <p className="text-xs mt-1">El profesor puede subir PDFs, PPTs y videos desde el Panel Profesor</p>
                </div>
              )}

              {!loadingRecursos && typeof selected.id === "string" && recursos.map((r, i) => (
                <motion.a
                  key={r.id}
                  href={
                  r.type === "PDF" || r.type === "PRESENTATION"
                  ? `https://docs.google.com/viewer?url=${encodeURIComponent(r.url)}&embedded=true`: r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => ganarXP("LEER_PRESENTACION", `Accedió a recurso: ${r.title}`)}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <span className="text-2xl">{iconMap[r.type] ?? "📁"}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{r.title}</p>
                    <p className="text-xs text-gray-400">
                      {r.type}{r.fileSize ? ` · ${formatSize(r.fileSize)}` : ""}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </motion.a>
              ))}

              {!loadingRecursos && typeof selected.id === "number" && [
                { nombre: "Guía de estudio", tipo: "PDF", size: "2.4 MB", icon: "📄", url: "#" },
                { nombre: "Presentación Unidad 1", tipo: "PPT", size: "5.1 MB", icon: "📊", url: "#" },
                { nombre: "Video explicativo", tipo: "Video", size: "45 min", icon: "🎬", url: "#" },
                { nombre: "Ejercicios resueltos", tipo: "PDF", size: "1.8 MB", icon: "📝", url: "#" },
              ].map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <span className="text-2xl">{r.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{r.nombre}</p>
                    <p className="text-xs text-gray-400">{r.tipo} · {r.size}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900">Materias</h1>
          <p className="text-gray-500 mt-1">Tus cursos inscritos</p>
        </motion.div>

        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 w-full max-w-md">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Buscar materia o profesor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm outline-none w-full"
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((materia, i) => (
            <motion.div
              key={materia.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer group"
              onClick={() => handleSelectMateria(materia)}
            >
              <div className={`bg-gradient-to-br ${materia.color} p-6 relative`}>
                <button
                  onClick={e => { e.stopPropagation(); toggleFavorito(materia.id); }}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors"
                >
                  <Star
                    size={14}
                    className={favoritos.includes(materia.id) ? "text-yellow-300 fill-yellow-300" : "text-white"}
                  />
                </button>
                <span className="text-4xl">{materia.emoji}</span>
                <h3 className="text-white font-bold text-xl mt-2">{materia.nombre}</h3>
                <p className="text-white/70 text-sm">{materia.descripcion}</p>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Users size={14} /> {materia.profesor}
                  </span>
                  <span className="text-gray-500 flex items-center gap-1">
                    <BookOpen size={14} /> {materia.clases} clases
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Progreso</span>
                    <span>{materia.progreso}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${materia.progreso}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={`h-2 rounded-full bg-gradient-to-r ${materia.color}`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{materia.recursos} recursos</span>
                  <span className="text-xs text-blue-600 font-medium group-hover:underline flex items-center gap-1">
                    Ver materia <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}