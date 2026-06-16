// Sistema de misiones diarias y semanales

export type TipoMision = "diaria" | "semanal" | "especial";

export interface Mision {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: TipoMision;
  xpRecompensa: number;
  emoji: string;
  meta: number;
  accion: string;
}

export interface ProgresoMision {
  misionId: string;
  progreso: number;
  completada: boolean;
  fechaCompletada?: string;
}

export const MISIONES_DIARIAS: Mision[] = [
  {
    id: "d1",
    titulo: "Lector del día",
    descripcion: "Lee 3 presentaciones hoy",
    tipo: "diaria",
    xpRecompensa: 75,
    emoji: "📖",
    meta: 3,
    accion: "LEER_PRESENTACION",
  },
  {
    id: "d2",
    titulo: "Científico curioso",
    descripcion: "Explora 2 modelos 3D",
    tipo: "diaria",
    xpRecompensa: 60,
    emoji: "🔬",
    meta: 2,
    accion: "VER_MODELO_3D",
  },
  {
    id: "d3",
    titulo: "Racha diaria",
    descripcion: "Inicia sesión hoy",
    tipo: "diaria",
    xpRecompensa: 15,
    emoji: "🔥",
    meta: 1,
    accion: "LOGIN_DIARIO",
  },
];

export const MISIONES_SEMANALES: Mision[] = [
  {
    id: "s1",
    titulo: "Semana académica",
    descripcion: "Completa 5 tareas esta semana",
    tipo: "semanal",
    xpRecompensa: 300,
    emoji: "📚",
    meta: 5,
    accion: "COMPLETAR_TAREA",
  },
  {
    id: "s2",
    titulo: "Explorador 3D",
    descripcion: "Visita el laboratorio 5 veces",
    tipo: "semanal",
    xpRecompensa: 150,
    emoji: "🧪",
    meta: 5,
    accion: "VER_MODELO_3D",
  },
  {
    id: "s3",
    titulo: "Maestro evaluador",
    descripcion: "Aprueba 2 evaluaciones",
    tipo: "semanal",
    xpRecompensa: 250,
    emoji: "🎯",
    meta: 2,
    accion: "APROBAR_EVALUACION",
  },
];

export const MISIONES_ESPECIALES: Mision[] = [
  {
    id: "e1",
    titulo: "Primera tarea",
    descripcion: "Completa tu primera tarea",
    tipo: "especial",
    xpRecompensa: 200,
    emoji: "⭐",
    meta: 1,
    accion: "COMPLETAR_TAREA",
  },
  {
    id: "e2",
    titulo: "Científico nato",
    descripcion: "Explora todos los modelos 3D",
    tipo: "especial",
    xpRecompensa: 500,
    emoji: "🏆",
    meta: 6,
    accion: "VER_MODELO_3D",
  },
  {
    id: "e3",
    titulo: "Estudiante ejemplar",
    descripcion: "Aprueba 5 evaluaciones",
    tipo: "especial",
    xpRecompensa: 1000,
    emoji: "👑",
    meta: 5,
    accion: "APROBAR_EVALUACION",
  },
];

export const TODAS_MISIONES = [
  ...MISIONES_DIARIAS,
  ...MISIONES_SEMANALES,
  ...MISIONES_ESPECIALES,
];

// Progreso en localStorage
export function getProgresoMisiones(): ProgresoMision[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("misiones_progreso");
  return stored ? JSON.parse(stored) : [];
}

export function actualizarProgresoMision(
  misionId: string,
  incremento: number = 1
): ProgresoMision {
  const progresos = getProgresoMisiones();
  const mision = TODAS_MISIONES.find(m => m.id === misionId)!;
  const existente = progresos.find(p => p.misionId === misionId);

  const nuevoProgreso: ProgresoMision = existente
    ? {
        ...existente,
        progreso: Math.min(mision.meta, existente.progreso + incremento),
        completada: existente.progreso + incremento >= mision.meta,
        fechaCompletada:
          existente.progreso + incremento >= mision.meta
            ? new Date().toISOString()
            : undefined,
      }
    : {
        misionId,
        progreso: Math.min(mision.meta, incremento),
        completada: incremento >= mision.meta,
        fechaCompletada:
          incremento >= mision.meta ? new Date().toISOString() : undefined,
      };

  const nuevosProgresos = existente
    ? progresos.map(p => (p.misionId === misionId ? nuevoProgreso : p))
    : [...progresos, nuevoProgreso];

  localStorage.setItem("misiones_progreso", JSON.stringify(nuevosProgresos));
  return nuevoProgreso;
}

export function getProgresoMision(misionId: string): ProgresoMision {
  const progresos = getProgresoMisiones();
  return (
    progresos.find(p => p.misionId === misionId) ?? {
      misionId,
      progreso: 0,
      completada: false,
    }
  );
}
