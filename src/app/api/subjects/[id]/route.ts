import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyAccessToken, extractBearerToken } from "@/lib/auth/jwt";
import { errorResponse, successResponse, ErrorCodes } from "@/types";

async function getPayload(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("Authorization"));
  if (!token) return null;
  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const subject = await prisma.subject.findFirst({
      where: { id, deletedAt: null },
      include: {
        classes: {
          where: { deletedAt: null },
          include: {
            teacher: {
              select: { id: true, firstName: true, lastName: true },
            },
            _count: {
              select: { enrollments: true },
            },
          },
        },
      },
    });

    if (!subject) {
      return NextResponse.json(
        errorResponse(ErrorCodes.NOT_FOUND, "Materia no encontrada"),
        { status: 404 }
      );
    }

    return NextResponse.json(successResponse(subject));
  } catch (err) {
    console.error("[GET /api/subjects/[id]]", err);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, "Error al obtener materia"),
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await getPayload(req);
    if (!payload) {
      return NextResponse.json(
        errorResponse(ErrorCodes.UNAUTHORIZED, "Token inválido"),
        { status: 401 }
      );
    }

    const role = (payload as any).role;
    if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
      return NextResponse.json(
        errorResponse(ErrorCodes.FORBIDDEN, "Acceso denegado"),
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);

    const subject = await prisma.subject.findFirst({
      where: { id, deletedAt: null },
    });

    if (!subject) {
      return NextResponse.json(
        errorResponse(ErrorCodes.NOT_FOUND, "Materia no encontrada"),
        { status: 404 }
      );
    }

    const updated = await prisma.subject.update({
      where: { id },
      data: {
        name: body?.name?.trim() ?? subject.name,
        description: body?.description?.trim() ?? subject.description,
        color: body?.color ?? subject.color,
        icon: body?.icon ?? subject.icon,
        credits: body?.credits ?? subject.credits,
      },
    });

    return NextResponse.json(successResponse(updated));
  } catch (err) {
    console.error("[PATCH /api/subjects/[id]]", err);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, "Error al editar materia"),
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
    const payload = await getPayload(req);
    if (!payload) {
      return NextResponse.json(
        errorResponse(ErrorCodes.UNAUTHORIZED, "Token inválido"),
        { status: 401 }
      );
    }

    const role = (payload as any).role;
    if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
      return NextResponse.json(
        errorResponse(ErrorCodes.FORBIDDEN, "Acceso denegado"),
        { status: 403 }
      );
    }

    const userId = (payload as any).userId ?? (payload as any).sub;

    const subject = await prisma.subject.findFirst({
      where: { id, deletedAt: null },
    });

    if (!subject) {
      return NextResponse.json(
        errorResponse(ErrorCodes.NOT_FOUND, "Materia no encontrada"),
        { status: 404 }
      );
    }

    await prisma.subject.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    return NextResponse.json(successResponse({ message: "Materia eliminada" }));
  } catch (err) {
    console.error("[DELETE /api/subjects/[id]]", err);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, "Error al eliminar materia"),
      { status: 500 }
    );
  }
}