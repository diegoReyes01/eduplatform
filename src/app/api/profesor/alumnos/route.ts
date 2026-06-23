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

    const role = (payload as any).role;
    if (!["TEACHER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json(errorResponse(ErrorCodes.FORBIDDEN, "Acceso denegado"), { status: 403 });
    }

    const alumnos = await prisma.user.findMany({
      where: {
        deletedAt: null,
        role: { name: "STUDENT" },
      },
      orderBy: { firstName: "asc" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        role: { select: { name: true } },
        experience: {
          select: {
            totalXp: true,
            level: { select: { number: true, name: true } },
          },
        },
      },
      take: 200,
    });

    return NextResponse.json(successResponse(alumnos));
  } catch (err) {
    console.error("[GET /api/profesor/alumnos]", err);
    return NextResponse.json(errorResponse(ErrorCodes.INTERNAL_ERROR, "Error al obtener alumnos"), { status: 500 });
  }
}