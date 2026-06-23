import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyAccessToken, extractBearerToken } from "@/lib/auth/jwt";
import { errorResponse, successResponse, ErrorCodes } from "@/types";

const XP_POR_ACCION: Record<string, number> = {
  LOGIN_DIARIO: 10,
  VER_MODELO_3D: 15,
  LEER_PRESENTACION: 20,
  COMPLETAR_TAREA: 50,
  COMPLETAR_EVALUACION: 75,
};

async function getNivel(totalXp: number) {
  return prisma.level.findFirst({
    where: { xpRequired: { lte: totalXp } },
    orderBy: { xpRequired: "desc" },
  });
}

export async function GET(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get("Authorization"));
    if (!token) return NextResponse.json(errorResponse(ErrorCodes.UNAUTHORIZED, "Token requerido"), { status: 401 });
    let payload;
    try { payload = verifyAccessToken(token); }
    catch { return NextResponse.json(errorResponse(ErrorCodes.TOKEN_INVALID, "Token inválido"), { status: 401 }); }

    const userId = (payload as any).userId ?? (payload as any).sub;

    let experience = await prisma.experience.findUnique({ where: { userId }, include: { level: true } });
    if (!experience) {
      const nivel1 = await prisma.level.findUnique({ where: { number: 1 } });
      if (!nivel1) return NextResponse.json(errorResponse(ErrorCodes.NOT_FOUND, "Nivel 1 no encontrado"), { status: 404 });
      experience = await prisma.experience.create({
        data: { userId, totalXp: 0, currentXp: 0, levelId: nivel1.id },
        include: { level: true },
      });
    }
    return NextResponse.json(successResponse(experience));
  } catch (err) {
    console.error("[GET /api/experience]", err);
    return NextResponse.json(errorResponse(ErrorCodes.INTERNAL_ERROR, "Error"), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get("Authorization"));
    if (!token) return NextResponse.json(errorResponse(ErrorCodes.UNAUTHORIZED, "Token requerido"), { status: 401 });
    let payload;
    try { payload = verifyAccessToken(token); }
    catch { return NextResponse.json(errorResponse(ErrorCodes.TOKEN_INVALID, "Token inválido"), { status: 401 }); }

    const userId = (payload as any).userId ?? (payload as any).sub;
    const body = await req.json();
    const { accion, descripcion } = body;

    const xpGanada = XP_POR_ACCION[accion] ?? 10;

    const nivel1 = await prisma.level.findUnique({ where: { number: 1 } }) ??
      await prisma.level.create({ data: { number: 1, name: "Principiante", xpRequired: 0, xpMax: 100 } });

    let experience = await prisma.experience.findUnique({ where: { userId }, include: { level: true } });
    if (!experience) {
      experience = await prisma.experience.create({
        data: { userId, totalXp: 0, currentXp: 0, levelId: nivel1.id },
        include: { level: true },
      });
    }

    let nuevoTotalXp = experience.totalXp + xpGanada;
    let nivelNuevo = await getNivel(nuevoTotalXp);
    let levelId = nivelNuevo?.id ?? nivel1.id;
    let currentXp = nivelNuevo ? nuevoTotalXp - nivelNuevo.xpRequired : nuevoTotalXp;

    let experienceActualizada = await prisma.experience.update({
      where: { userId },
      data: { totalXp: nuevoTotalXp, currentXp, levelId },
      include: { level: true },
    });

    await prisma.xpTransaction.create({
      data: { amount: xpGanada, reason: descripcion ?? accion, source: accion, experienceId: experience.id },
    });

    // Actualizar progreso de misiones
    if (accion) {
      const misionesActivas = await prisma.mission.findMany({
        where: { isActive: true, OR: [{ endDate: null }, { endDate: { gte: new Date() } }] },
      });

      for (const mision of misionesActivas) {
        const criteria = mision.criteria as any;
        if (criteria?.action !== accion) continue;
        const target = criteria?.count ?? 1;

        let progreso = await prisma.userMissionProgress.findUnique({
          where: { userId_missionId: { userId, missionId: mision.id } },
        });

        if (!progreso) {
          progreso = await prisma.userMissionProgress.create({
            data: { userId, missionId: mision.id, progress: 0, target, status: "ACTIVE" },
          });
        }
        if (progreso.status === "COMPLETED") continue;

        const nuevoProgreso = Math.min(progreso.progress + 1, target);
        const completada = nuevoProgreso >= target;

        await prisma.userMissionProgress.update({
          where: { userId_missionId: { userId, missionId: mision.id } },
          data: { progress: nuevoProgreso, status: completada ? "COMPLETED" : "ACTIVE", completedAt: completada ? new Date() : null },
        });

        // Bonus XP por completar misión
        if (completada && mision.xpReward > 0) {
          nuevoTotalXp += mision.xpReward;
          nivelNuevo = await getNivel(nuevoTotalXp);
          levelId = nivelNuevo?.id ?? nivel1.id;
          currentXp = nivelNuevo ? nuevoTotalXp - nivelNuevo.xpRequired : nuevoTotalXp;
          experienceActualizada = await prisma.experience.update({
            where: { userId },
            data: { totalXp: nuevoTotalXp, currentXp, levelId },
            include: { level: true },
          });
          await prisma.xpTransaction.create({
            data: { amount: mision.xpReward, reason: `Misión completada: ${mision.title}`, source: "MISION", experienceId: experience.id },
          });
        }
      }
    }

    return NextResponse.json(successResponse({ xpGanada, experience: experienceActualizada }));
  } catch (err) {
    console.error("[POST /api/experience]", err);
    return NextResponse.json(errorResponse(ErrorCodes.INTERNAL_ERROR, "Error al agregar XP"), { status: 500 });
  }
}