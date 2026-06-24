import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyAccessToken, extractBearerToken } from "@/lib/auth/jwt";
import { errorResponse, successResponse, ErrorCodes } from "@/types";

const CATEGORY_LABELS: Record<string, string> = {
  ACADEMIC: "Academico",
  PARTICIPATION: "Participacion",
  STREAK: "Constancia",
  SOCIAL: "Social",
  SPECIAL: "Especial",
  MILESTONE: "Hito",
};

export async function GET(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get("Authorization"));
    if (!token) return NextResponse.json(errorResponse(ErrorCodes.UNAUTHORIZED, "Token requerido"), { status: 401 });
    let payload;
    try { payload = verifyAccessToken(token); }
    catch { return NextResponse.json(errorResponse(ErrorCodes.TOKEN_INVALID, "Token invalido"), { status: 401 }); }

    const userId = (payload as any).userId ?? (payload as any).sub;

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true, unlockedAt: true },
    });
    const unlockedMap = new Map(userAchievements.map((u) => [u.achievementId, u.unlockedAt]));

    const achievements = await prisma.achievement.findMany({
      where: {
        OR: [
          { isSecret: false },
          { id: { in: Array.from(unlockedMap.keys()) } },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    const data = achievements.map((a) => ({
      id: a.id,
      nombre: a.name,
      descripcion: a.description,
      emoji: a.icon,
      xp: a.xpReward,
      categoria: CATEGORY_LABELS[a.category] ?? a.category,
      obtenido: unlockedMap.has(a.id),
      fecha: unlockedMap.get(a.id) ?? null,
    }));

    return NextResponse.json(successResponse(data));
  } catch (err) {
    console.error("[GET /api/achievements]", err);
    return NextResponse.json(errorResponse(ErrorCodes.INTERNAL_ERROR, "Error al obtener logros"), { status: 500 });
  }
}
