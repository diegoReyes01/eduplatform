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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        errorResponse(ErrorCodes.UNAUTHORIZED, "Token inválido"),
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));

    const evaluation = await prisma.evaluation.findFirst({
      where: { id, deletedAt: null },
    });

    if (!evaluation) {
      return NextResponse.json(
        errorResponse(ErrorCodes.NOT_FOUND, "Evaluación no encontrada"),
        { status: 404 }
      );
    }

    const updated = await prisma.evaluation.update({
      where: { id },
      data: {
        isPublished: body.isPublished ?? evaluation.isPublished,
      },
    });

    return NextResponse.json(successResponse(updated));
  } catch (err) {
    console.error("[PATCH /api/evaluations/[id]]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, "Error al actualizar evaluación"),
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        errorResponse(ErrorCodes.UNAUTHORIZED, "Token inválido"),
        { status: 401 }
      );
    }

    const evaluation = await prisma.evaluation.findFirst({
      where: { id, deletedAt: null },
    });

    if (!evaluation) {
      return NextResponse.json(
        errorResponse(ErrorCodes.NOT_FOUND, "Evaluación no encontrada"),
        { status: 404 }
      );
    }

    await prisma.evaluation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json(successResponse({ message: "Evaluación eliminada" }));
  } catch (err) {
    console.error("[DELETE /api/evaluations/[id]]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, "Error al eliminar evaluación"),
      { status: 500 }
    );
  }
}