// Motor de XP y niveles

export const NIVELES = [
  { numero: 1,  nombre: "Novato",       xpMin: 0,    xpMax: 100  },
  { numero: 2,  nombre: "Aprendiz",     xpMin: 100,  xpMax: 250  },
  { numero: 3,  nombre: "Estudiante",   xpMin: 250,  xpMax: 500  },
  { numero: 4,  nombre: "Explorador",   xpMin: 500,  xpMax: 900  },
  { numero: 5,  nombre: "Conocedor",    xpMin: 900,  xpMax: 1500 },
  { numero: 6,  nombre: "Experto",      xpMin: 1500, xpMax: 2500 },
  { numero: 7,  nombre: "Maestro",      xpMin: 2500, xpMax: 4000 },
  { numero: 8,  nombre: "Sabio",        xpMin: 4000, xpMax: 6000 },
  { numero: 9,  nombre: "Leyenda",      xpMin: 6000, xpMax: 9000 },
  { numero: 10, nombre: "Gran Maestro", xpMin: 9000, xpMax: 99999 },
];

export const XP_ACCIONES = {
  LEER_PRESENTACION:   { xp: 10,  label: "Leer presentación",   emoji: "📖" },
  COMPLETAR_TAREA:     { xp: 50,  label: "Completar tarea",      emoji: "✅" },
  VER_MODELO_3D:       { xp: 20,  label: "Ver modelo 3D",        emoji: "🔬" },
  APROBAR_EVALUACION:  { xp: 100, label: "Aprobar evaluación",   emoji: "🎯" },
  MISION_ESPECIAL:     { xp: 200, label: "Misión especial",      emoji: "⭐" },
  LOGIN_DIARIO:        { xp: 15,  label: "Login diario",         emoji: "📅" },
  COMPLETAR_MISION:    { xp: 75,  label: "Completar misión",     emoji: "🏆" },
};

export type AccionXP = keyof typeof XP_ACCIONES;

export interface NivelInfo {
  numero: number;
  nombre: string;
  xpMin: number;
  xpMax: number;
  progreso: number; // 0-100%
  xpActual: number;
  xpRestante: number;
}

export function getNivelInfo(totalXp: number): NivelInfo {
  const nivel = NIVELES.findLast(n => totalXp >= n.xpMin) ?? NIVELES[0]!;
  const xpEnNivel = totalXp - nivel.xpMin;
  const xpNecesario = nivel.xpMax - nivel.xpMin;
  const progreso = Math.min(100, Math.round((xpEnNivel / xpNecesario) * 100));

  return {
    ...nivel,
    progreso,
    xpActual: xpEnNivel,
    xpRestante: nivel.xpMax - totalXp,
  };
}

export function calcularNuevoXp(
  xpActual: number,
  accion: AccionXP
): { nuevoXp: number; ganado: number; subioNivel: boolean; nivelAnterior: number; nivelNuevo: number } {
  const ganado = XP_ACCIONES[accion].xp;
  const nuevoXp = xpActual + ganado;
  const nivelAnterior = getNivelInfo(xpActual).numero;
  const nivelNuevo = getNivelInfo(nuevoXp).numero;

  return {
    nuevoXp,
    ganado,
    subioNivel: nivelNuevo > nivelAnterior,
    nivelAnterior,
    nivelNuevo,
  };
}

// Historial de XP (localStorage)
export interface TransaccionXP {
  id: string;
  accion: AccionXP;
  xp: number;
  fecha: string;
  descripcion: string;
}

export function getHistorialXP(): TransaccionXP[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("xp_historial");
  return stored ? JSON.parse(stored) : [];
}

export function agregarTransaccionXP(accion: AccionXP, descripcion: string): TransaccionXP {
  const transaccion: TransaccionXP = {
    id: crypto.randomUUID(),
    accion,
    xp: XP_ACCIONES[accion].xp,
    fecha: new Date().toISOString(),
    descripcion,
  };
  const historial = getHistorialXP();
  historial.unshift(transaccion);
  localStorage.setItem("xp_historial", JSON.stringify(historial.slice(0, 50)));
  return transaccion;
}

export function getTotalXP(): number {
  return getHistorialXP().reduce((acc, t) => acc + t.xp, 0);
}