// GET /api/experience — Obtener XP y nivel del usuario actual
// POST /api/experience — Agregar XP (acción completada)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyAccessToken, extractBearerToken } from "@/lib/auth/jwt";
import { errorResponse, successResponse, ErrorCodes } from "@/types";

async function getUserId(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("Authorization"));
  if (!token) return null;
  try {
    const payload = verifyAccessToken(token);
    return (payload as any).userId ?? (payload as any).sub;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        errorResponse(ErrorCodes.UNAUTHORIZED, "Token inválido"),
        { status: 401 }
      );
    }

    let experience = await prisma.experience.findUnique({
      where: { userId },
      include: { level: true },
    });

    // Si no tiene experience, crearla en nivel 1
    if (!experience) {
      const level1 = await prisma.level.findFirst({ where: { number: 1 } });
      if (!level1) {
        return NextResponse.json(
          errorResponse(ErrorCodes.INTERNAL_ERROR, "No hay niveles configurados"),
          { status: 500 }
        );
      }
      experience = await prisma.experience.create({
        data: { userId, levelId: level1.id, totalXp: 0, currentXp: 0 },
        include: { level: true },
      });
    }

    return NextResponse.json(successResponse(experience));
  } catch (err) {
    console.error("[GET /api/experience]", err);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, "Error al obtener experiencia"),
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        errorResponse(ErrorCodes.UNAUTHORIZED, "Token inválido"),
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    const amount: number = body?.amount ?? 0;
    const reason: string = body?.reason ?? "Acción completada";
    const source: string = body?.source ?? "manual";

    if (amount <= 0) {
      return NextResponse.json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, "El monto de XP debe ser positivo"),
        { status: 422 }
      );
    }

    let experience = await prisma.experience.findUnique({
      where: { userId },
    });

    if (!experience) {
      const level1 = await prisma.level.findFirst({ where: { number: 1 } });
      if (!level1) {
        return NextResponse.json(
          errorResponse(ErrorCodes.INTERNAL_ERROR, "No hay niveles configurados"),
          { status: 500 }
        );
      }
      experience = await prisma.experience.create({
        data: { userId, levelId: level1.id, totalXp: 0, currentXp: 0 },
      });
    }

    const nuevoTotalXp = experience.totalXp + amount;

    // Buscar el nivel correspondiente al nuevo XP total
    const nuevoNivel = await prisma.level.findFirst({
      where: { xpRequired: { lte: nuevoTotalXp } },
      orderBy: { xpRequired: "desc" },
    });

    const actualizado = await prisma.experience.update({
      where: { userId },
      data: {
        totalXp: nuevoTotalXp,
        currentXp: nuevoNivel ? nuevoTotalXp - nuevoNivel.xpRequired : nuevoTotalXp,
        ...(nuevoNivel ? { levelId: nuevoNivel.id } : {}),
      },
      include: { level: true },
    });

    // Registrar transacción
    await prisma.xpTransaction.create({
      data: {
        amount,
        reason,
        source,
        experienceId: actualizado.id,
      },
    });

    return NextResponse.json(successResponse(actualizado));
  } catch (err) {
    console.error("[POST /api/experience]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, "Error al agregar experiencia"),
      { status: 500 }
    );
  }
}