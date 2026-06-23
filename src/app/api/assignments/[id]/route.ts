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

    const assignment = await prisma.assignment.findFirst({
      where: { id, deletedAt: null },
    });

    if (!assignment) {
      return NextResponse.json(
        errorResponse(ErrorCodes.NOT_FOUND, "Tarea no encontrada"),
        { status: 404 }
      );
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        status: body.status ?? assignment.status,
      },
    });

    return NextResponse.json(successResponse(updated));
  } catch (err) {
    console.error("[PATCH /api/assignments/[id]]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, "Error al actualizar tarea"),
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

    const assignment = await prisma.assignment.findFirst({
      where: { id, deletedAt: null },
    });

    if (!assignment) {
      return NextResponse.json(
        errorResponse(ErrorCodes.NOT_FOUND, "Tarea no encontrada"),
        { status: 404 }
      );
    }

    await prisma.assignment.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: userId },
    });

    return NextResponse.json(successResponse({ message: "Tarea eliminada" }));
  } catch (err) {
    console.error("[DELETE /api/assignments/[id]]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, "Error al eliminar tarea"),
      { status: 500 }
    );
  }
}
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = extractBearerToken(req.headers.get("Authorization"));
    if (!token) return NextResponse.json(errorResponse(ErrorCodes.UNAUTHORIZED, "Token requerido"), { status: 401 });
    try { verifyAccessToken(token); } catch {
      return NextResponse.json(errorResponse(ErrorCodes.TOKEN_INVALID, "Token inválido"), { status: 401 });
    }
    const assignment = await prisma.assignment.findFirst({
      where: { id, deletedAt: null },
      include: { class: { select: { id: true, name: true } } },
    });
    if (!assignment) return NextResponse.json(errorResponse(ErrorCodes.NOT_FOUND, "Tarea no encontrada"), { status: 404 });
    return NextResponse.json(successResponse(assignment));
  } catch (err) {
    console.error("[GET /api/assignments/[id]]", err);
    return NextResponse.json(errorResponse(ErrorCodes.INTERNAL_ERROR, "Error"), { status: 500 });
  }
}
