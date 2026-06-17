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

    try {
      verifyAccessToken(token);
    } catch {
      return NextResponse.json(
        errorResponse(ErrorCodes.TOKEN_INVALID, "Token inválido"),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");

    const resources = await prisma.resource.findMany({
      where: {
  deletedAt: null,
},
      orderBy: { createdAt: "desc" },
      include: {
        uploadedBy: {
          select: { firstName: true, lastName: true },
        },
      },
      take: 50,
    });

    return NextResponse.json(successResponse(resources));
  } catch (err) {
    console.error("[GET /api/resources]", err);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, "Error al obtener recursos"),
      { status: 500 }
    );
  }
}