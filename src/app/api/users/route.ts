// GET /api/users — Listar usuarios (solo ADMIN+)

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

    const role = (payload as any).role;
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json(
        errorResponse(ErrorCodes.FORBIDDEN, "Acceso denegado"),
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        role: {
          select: { id: true, name: true },
        },
      },
      take: 100,
    });

    return NextResponse.json(successResponse(users));
  } catch (err) {
    console.error("[GET /api/users]", err);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, "Error al obtener usuarios"),
      { status: 500 }
    );
  }
}
