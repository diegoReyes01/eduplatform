"use client";

import { useCallback } from "react";

export type AccionXP =
  | "LEER_PRESENTACION"
  | "COMPLETAR_TAREA"
  | "VER_MODELO_3D"
  | "APROBAR_EVALUACION"
  | "MISION_ESPECIAL"
  | "LOGIN_DIARIO"
  | "COMPLETAR_MISION";

const XP_VALORES: Record<AccionXP, number> = {
  LEER_PRESENTACION: 10,
  COMPLETAR_TAREA: 50,
  VER_MODELO_3D: 20,
  APROBAR_EVALUACION: 100,
  MISION_ESPECIAL: 200,
  LOGIN_DIARIO: 15,
  COMPLETAR_MISION: 75,
};

export function useXP() {
  const ganarXP = useCallback(async (accion: AccionXP, descripcion?: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return null;

      const res = await fetch("/api/experience", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: XP_VALORES[accion],
          reason: descripcion ?? accion,
          source: accion,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const exp = data.data;
        // Guardar en localStorage para uso rápido en UI
        const user = localStorage.getItem("user");
        if (user) {
          const u = JSON.parse(user);
          u.totalXp = exp.totalXp;
          u.nivel = exp.level?.number;
          localStorage.setItem("user", JSON.stringify(u));
        }
        return exp;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const verificarLoginDiario = useCallback(async () => {
    const ultimoLogin = localStorage.getItem("ultimo_login_diario");
    const hoy = new Date().toDateString();
    if (ultimoLogin === hoy) return;
    localStorage.setItem("ultimo_login_diario", hoy);
    await ganarXP("LOGIN_DIARIO", "Login diario");
  }, [ganarXP]);

  return { ganarXP, verificarLoginDiario, XP_VALORES };
}