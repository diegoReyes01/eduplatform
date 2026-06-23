import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyAccessToken, extractBearerToken } from "@/lib/auth/jwt";
import { errorResponse, successResponse, ErrorCodes } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get("Authorization"));
    if (!token) return NextResponse.json(errorResponse(ErrorCodes.UNAUTHORIZED, "Token requerido"), { status: 401 });
    let payload;
    try { payload = verifyAccessToken(token); }
    catch { return NextResponse.json(errorResponse(ErrorCodes.TOKEN_INVALID, "Token inválido"), { status: 401 }); }

    const userId = (payload as any).userId ?? (payload as any).sub;

    const misiones = await prisma.mission.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });

    const progresos = await prisma.userMissionProgress.findMany({ where: { userId } });
    const progresoMap = new Map(progresos.map(p => [p.missionId, p]));

    const resultado = misiones.map(m => {
      const criteria = m.criteria as any;
      const progreso = progresoMap.get(m.id);
      return {
        id: m.id,
        title: m.title,
        description: m.description,
        type: m.type,
        xpReward: m.xpReward,
        emoji: criteria?.emoji ?? "⭐",
        target: criteria?.count ?? 1,
        progreso: progreso?.progress ?? 0,
        status: progreso?.status ?? "ACTIVE",
        completada: progreso?.status === "COMPLETED",
      };
    });

    return NextResponse.json(successResponse(resultado));
  } catch (err) {
    console.error("[GET /api/misiones]", err);
    return NextResponse.json(errorResponse(ErrorCodes.INTERNAL_ERROR, "Error al obtener misiones"), { status: 500 });
  }
}