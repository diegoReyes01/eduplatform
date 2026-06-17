// GET /api/ranking — Top usuarios por XP

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyAccessToken, extractBearerToken } from "@/lib/auth/jwt";
import { errorResponse, successResponse, ErrorCodes } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get("Authorization"));
    if (!token) {
      return NextResponse.json(
        errorResponse(ErrorCodes.UNAUTHORIZED, "Token requerido"),
        { status: 401 }
      );
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      return NextResponse.json(
        errorResponse(ErrorCodes.TOKEN_INVALID, "Token inválido"),
        { status: 401 }
      );
    }

    const currentUserId = (payload as any).userId ?? (payload as any).sub;

    const experiences = await prisma.experience.findMany({
      orderBy: { totalXp: "desc" },
      take: 50,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, username: true },
        },
        level: {
          select: { number: true, name: true },
        },
      },
    });

    const ranking = experiences.map((e, index) => ({
      posicion: index + 1,
      userId: e.user.id,
      nombre: `${e.user.firstName} ${e.user.lastName}`,
      username: `@${e.user.username}`,
      xp: e.totalXp,
      nivel: e.level.number,
      esYo: e.user.id === currentUserId,
      avatar: `${e.user.firstName[0]}${e.user.lastName[0]}`.toUpperCase(),
    }));

    return NextResponse.json(successResponse(ranking));
  } catch (err) {
    console.error("[GET /api/ranking]", err);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, "Error al obtener ranking"),
      { status: 500 }
    );
  }
}