"use client";
import { useCallback } from "react";

export type AccionXP =
  | "LEER_PRESENTACION"
  | "COMPLETAR_TAREA"
  | "VER_MODELO_3D"
  | "APROBAR_EVALUACION"
  | "MISION_ESPECIAL"
  | "LOGIN_DIARIO"
  | "COMPLETAR_MISION"
  | "COMPLETAR_EVALUACION";

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
        body: JSON.stringify({ accion, descripcion }),
      });

      const data = await res.json();
      if (data.success) {
        const exp = data.data.experience;
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

  return { ganarXP, verificarLoginDiario };
}