"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Calculator,
  FileText,
} from "lucide-react";
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

interface NotaItem {
  id: string;
  materia: string;
  evaluacion: string;
  nota: number;
  notaMaxima: number;
  porcentaje: number;
  fecha: string;
  feedback: string | null;
}

function getColor(nota: number) {
  if (nota >= 6.0) return "text-green-600";
  if (nota >= 5.0) return "text-yellow-600";
  return "text-red-600";
}

function getBg(nota: number) {
  if (nota >= 6.0) return "bg-green-100";
  if (nota >= 5.0) return "bg-yellow-100";
  return "bg-red-100";
}

function getBarColor(nota: number) {
  if (nota >= 6.0) return "#16a34a";
  if (nota >= 5.0) return "#ca8a04";
  return "#dc2626";
}

function getIcon(nota: number) {
  if (nota >= 6.0) return <TrendingUp size={14} className="text-green-600" />;
  if (nota >= 5.0) return <Minus size={14} className="text-yellow-600" />;
  return <TrendingDown size={14} className="text-red-600" />;
}

export default function NotasPage() {
  const [notasData, setNotasData] = useState<NotaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"nota" | "fecha" | "materia">("fecha");
  const [filterMateria, setFilterMateria] = useState("Todas");
  const [notaMinima, setNotaMinima] = useState("");
  const [porcentajePendiente, setPorcentajePendiente] = useState("");
  const [notaRequerida, setNotaRequerida] = useState<number | null>(null);
  const [notas, setNotas] = useState<string[]>([]);

  useEffect(() => {
    const cargar = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("/api/grades", {
          headers: { Authorization: "Bearer " + token },
        });
        const data = await res.json();
        if (data.success) {
          setNotasData(data.data);
          setNotas(data.data.map((n: NotaItem) => n.nota.toString()));
        }
      } catch {
        // silencioso
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const materias = ["Todas", ...Array.from(new Set(notasData.map((n) => n.materia)))];

  const chartData = Array.from(new Set(notasData.map((n) => n.materia))).map((materia) => {
    const items = notasData.filter((n) => n.materia === materia);
    const promedio = items.reduce((acc, n) => acc + n.nota, 0) / items.length;
    return { materia: materia.slice(0, 3), promedio: Math.round(promedio * 100) / 100 };
  });

  const filtered = notasData
    .filter(
      (n) =>
        (filterMateria === "Todas" || n.materia === filterMateria) &&
        (n.materia.toLowerCase().includes(search.toLowerCase()) ||
          n.evaluacion.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "nota") return b.nota - a.nota;
      if (sortBy === "materia") return a.materia.localeCompare(b.materia);
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });

  const promedio =
    notasData.length > 0 ? notasData.reduce((acc, n) => acc + n.nota, 0) / notasData.length : 0;

  const calcularNotaRequerida = () => {
    const min = parseFloat(notaMinima);
    const pend = parseFloat(porcentajePendiente);
    if (isNaN(min) || isNaN(pend) || pend <= 0 || notasData.length === 0) return;
    const sumaPorcentajes = notasData.reduce((acc, n) => acc + n.porcentaje, 0);
    const notasActuales =
      sumaPorcentajes > 0
        ? notasData.reduce((acc, n) => acc + n.nota * n.porcentaje, 0) / sumaPorcentajes
        : 0;
    const porcentajeActual = 100 - pend;
    const requerida = (min - (notasActuales * porcentajeActual) / 100) / (pend / 100);
    setNotaRequerida(Math.round(requerida * 10) / 10);
  };

  const promedioCalculado =
    notas.reduce((acc, n) => {
      const val = parseFloat(n);
      return isNaN(val) ? acc : acc + val;
    }, 0) / notas.filter((n) => !isNaN(parseFloat(n))).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900">Mis Notas</h1>
          <p className="text-gray-500 mt-1">Historial de evaluaciones y calculadoras</p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
            Cargando notas...
          </div>
        ) : notasData.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 flex flex-col items-center text-gray-400">
            <FileText size={40} className="mb-3 opacity-30" />
            <p>Aun no tienes notas publicadas</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: "Promedio General",
                  value: promedio.toFixed(1),
                  color: promedio >= 6 ? "green" : promedio >= 5 ? "yellow" : "red",
                },
                { label: "Evaluaciones", value: notasData.length.toString(), color: "blue" },
                {
                  label: "Aprobadas",
                  value: notasData.filter((n) => n.nota >= 6).length.toString(),
                  color: "green",
                },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                >
                  <p className="text-sm text-gray-500">{s.label}</p>
                  <p className={"text-3xl font-bold mt-1 text-" + s.color + "-600"}>{s.value}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
              <h3 className="font-semibold text-gray-800 mb-4">Promedio por materia</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="materia" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 7]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="promedio" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={getBarColor(entry.promedio)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="p-5 border-b border-gray-100 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 flex-1 min-w-48">
                  <Search size={16} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar materia o evaluacion..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent text-sm outline-none w-full"
                  />
                </div>
                <select
                  value={filterMateria}
                  onChange={(e) => setFilterMateria(e.target.value)}
                  className="bg-gray-100 rounded-xl px-3 py-2 text-sm outline-none"
                >
                  {materias.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "nota" | "fecha" | "materia")}
                  className="bg-gray-100 rounded-xl px-3 py-2 text-sm outline-none"
                >
                  <option value="fecha">Ordenar por fecha</option>
                  <option value="nota">Ordenar por nota</option>
                  <option value="materia">Ordenar por materia</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
                      <th className="px-5 py-3">Materia</th>
                      <th className="px-5 py-3">Evaluacion</th>
                      <th className="px-5 py-3">Nota</th>
                      <th className="px-5 py-3">Porcentaje</th>
                      <th className="px-5 py-3">Fecha</th>
                      <th className="px-5 py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((n, i) => (
                      <motion.tr
                        key={n.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-5 py-3 text-sm font-medium text-gray-800">{n.materia}</td>
                        <td className="px-5 py-3 text-sm text-gray-600">{n.evaluacion}</td>
                        <td className="px-5 py-3">
                          <span className={"text-sm font-bold " + getColor(n.nota)}>{n.nota.toFixed(1)}</span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-100 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-blue-500"
                                style={{ width: n.porcentaje + "%" }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{n.porcentaje}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-500">
                          {new Date(n.fecha).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-5 py-3">
                          <span className={"inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full " + getBg(n.nota) + " " + getColor(n.nota)}>
                            {getIcon(n.nota)}
                            {n.nota >= 6 ? "Aprobado" : n.nota >= 5 ? "En riesgo" : "Reprobado"}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <Calculator size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-800">Calculadora de promedio</h3>
            </div>
            <div className="space-y-2 mb-4">
              {notas.map((n, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-16">Nota {i + 1}</span>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    step="0.1"
                    value={n}
                    onChange={(e) => {
                      const updated = [...notas];
                      updated[i] = e.target.value;
                      setNotas(updated);
                    }}
                    className="flex-1 bg-gray-100 rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
              ))}
              <button onClick={() => setNotas([...notas, ""])} className="text-xs text-blue-600 hover:underline">
                + Agregar nota
              </button>
            </div>
            <div
              className={
                "p-4 rounded-xl " +
                (isNaN(promedioCalculado)
                  ? "bg-gray-50"
                  : promedioCalculado >= 6
                  ? "bg-green-50"
                  : promedioCalculado >= 5
                  ? "bg-yellow-50"
                  : "bg-red-50")
              }
            >
              <p className="text-xs text-gray-500">Promedio calculado</p>
              <p
                className={
                  "text-3xl font-bold " +
                  (isNaN(promedioCalculado)
                    ? "text-gray-400"
                    : promedioCalculado >= 6
                    ? "text-green-600"
                    : promedioCalculado >= 5
                    ? "text-yellow-600"
                    : "text-red-600")
                }
              >
                {isNaN(promedioCalculado) ? "-" : promedioCalculado.toFixed(1)}
              </p>
              <p className="text-xs mt-1 text-gray-500">
                {!isNaN(promedioCalculado) && (promedioCalculado >= 6 ? "Aprobado" : promedioCalculado >= 5 ? "En riesgo" : "Reprobado")}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-green-600" />
              <h3 className="font-semibold text-gray-800">Que necesito para aprobar?</h3>
            </div>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Nota minima para aprobar</label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  step="0.1"
                  placeholder="Ej: 6.0"
                  value={notaMinima}
                  onChange={(e) => setNotaMinima(e.target.value)}
                  className="w-full bg-gray-100 rounded-xl px-3 py-2 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">% pendiente por evaluar</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Ej: 40"
                  value={porcentajePendiente}
                  onChange={(e) => setPorcentajePendiente(e.target.value)}
                  className="w-full bg-gray-100 rounded-xl px-3 py-2 text-sm outline-none"
                />
              </div>
              <button
                onClick={calcularNotaRequerida}
                className="w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Calcular
              </button>
            </div>
            {notaRequerida !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={
                  "p-4 rounded-xl " +
                  (notaRequerida <= 7 ? (notaRequerida <= 6 ? "bg-green-50" : "bg-yellow-50") : "bg-red-50")
                }
              >
                <p className="text-xs text-gray-500">Necesitas obtener</p>
                <p
                  className={
                    "text-3xl font-bold " +
                    (notaRequerida <= 6 ? "text-green-600" : notaRequerida <= 7 ? "text-yellow-600" : "text-red-600")
                  }
                >
                  {notaRequerida > 7 ? "Imposible" : notaRequerida < 1 ? "Ya aprobaste" : notaRequerida.toFixed(1)}
                </p>
                <p className="text-xs mt-1 text-gray-500">
                  {notaRequerida > 7
                    ? "No es posible aprobar"
                    : notaRequerida < 1
                    ? "Ya tienes la nota suficiente"
                    : notaRequerida <= 6
                    ? "Es alcanzable"
                    : "Sera dificil pero posible"}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
