"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { ChevronLeft, FileText, MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface Submission {
  id: string;
  content: string;
  fileUrls: string[];
  isLate: boolean;
  status: string;
  submittedAt: string;
  student: { firstName: string; lastName: string; email: string };
  grade: { score: number; maxScore: number; feedback: string | null } | null;
}

export default function EntregasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [tarea, setTarea] = useState<{ title: string; maxScore: number } | null>(null);
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({});
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  const [calificando, setCalificando] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const [subRes, tareaRes] = await Promise.all([
          fetch("/api/profesor/entregas?assignmentId=" + id, {
            headers: { Authorization: "Bearer " + token },
          }),
          fetch("/api/assignments/" + id, {
            headers: { Authorization: "Bearer " + token },
          }),
        ]);
        const subData = await subRes.json();
        const tareaData = await tareaRes.json();
        if (subData.success) setSubmissions(subData.data);
        if (tareaData.success) setTarea(tareaData.data);
      } catch {
        // silencioso
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  const calificar = async (submissionId: string) => {
    const score = scoreInputs[submissionId];
    if (!score) return;
    setCalificando(submissionId);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({
          submissionId,
          score: parseFloat(score),
          feedback: feedbackInputs[submissionId] || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === submissionId ? { ...s, status: "GRADED", grade: data.data } : s))
        );
      }
    } catch {
      // silencioso
    } finally {
      setCalificando(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/profesor/tareas" className="text-gray-400 hover:text-gray-600">
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Entregas</h1>
              {tarea && <p className="text-gray-500 text-sm">{tarea.title} - Puntaje: {tarea.maxScore}</p>}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total", value: submissions.length, color: "blue" },
            { label: "A tiempo", value: submissions.filter((s) => !s.isLate).length, color: "green" },
            { label: "Atrasadas", value: submissions.filter((s) => s.isLate).length, color: "orange" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
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
              Cargando entregas...
            </div>
          ) : submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FileText size={40} className="mb-3 opacity-30" />
              <p>Sin entregas aun</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {submissions.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                        {s.student.firstName[0]}{s.student.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{s.student.firstName} {s.student.lastName}</p>
                        <p className="text-xs text-gray-400">{s.student.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.isLate ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 flex items-center gap-1">
                          <AlertCircle size={10} /> Atrasada
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600 flex items-center gap-1">
                          <CheckCircle size={10} /> A tiempo
                        </span>
                      )}
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(s.submittedAt).toLocaleDateString("es-CL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                  {s.content && (
                    <div className="mt-3 ml-12 flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                      <MessageSquare size={14} className="mt-0.5 text-gray-400 shrink-0" />
                      <p>{s.content}</p>
                    </div>
                  )}
                  {s.fileUrls && s.fileUrls.length > 0 && (
                    <div className="mt-2 ml-12 flex flex-wrap gap-2">
                      {s.fileUrls.map((url, j) => (
                        <a key={j} href={"https://docs.google.com/viewer?url=" + encodeURIComponent(url) + "&embedded=true"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                          <FileText size={12} />
                          Ver archivo {j + 1}
                        </a>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 ml-12">
                    {s.grade ? (
                      <div className="flex items-center gap-2 text-sm bg-green-50 text-green-700 rounded-xl p-3 w-fit">
                        <CheckCircle size={14} />
                        Calificado: {s.grade.score}/{s.grade.maxScore}
                        {s.grade.feedback && <span className="text-green-600 text-xs ml-2">- {s.grade.feedback}</span>}
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max={tarea ? tarea.maxScore : 100}
                          step="0.1"
                          placeholder={"Nota (0-" + (tarea ? tarea.maxScore : 100) + ")"}
                          value={scoreInputs[s.id] || ""}
                          onChange={(e) => setScoreInputs({ ...scoreInputs, [s.id]: e.target.value })}
                          className="bg-gray-100 rounded-xl px-3 py-1.5 text-sm outline-none w-32"
                        />
                        <input
                          type="text"
                          placeholder="Comentario (opcional)"
                          value={feedbackInputs[s.id] || ""}
                          onChange={(e) => setFeedbackInputs({ ...feedbackInputs, [s.id]: e.target.value })}
                          className="bg-gray-100 rounded-xl px-3 py-1.5 text-sm outline-none flex-1 min-w-40"
                        />
                        <button
                          onClick={() => calificar(s.id)}
                          disabled={!scoreInputs[s.id] || calificando === s.id}
                          className="bg-blue-600 text-white rounded-xl px-4 py-1.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {calificando === s.id ? "Guardando..." : "Calificar y publicar"}
                        </button>
                      </div>
                    )}
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
