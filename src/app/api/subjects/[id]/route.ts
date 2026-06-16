// GET /api/subjects/[id] — Ver materia
// PATCH /api/subjects/[id] — Editar materia
// DELETE /api/subjects/[id] — Eliminar materia (soft delete)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withMinRole } from "@/middleware/auth";
import { errorResponse, successResponse, ErrorCodes } from "@/types";

// GET — Ver materia por ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subject = await prisma.subject.findFirst({
      where: { id: params.id, deletedAt: null },
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

// PATCH — Editar materia
export const PATCH = withMinRole("SUPER_ADMIN")(async (req, { params }) => {
  try {
    const body = await req.json().catch(() => null);

    const subject = await prisma.subject.findFirst({
      where: { id: params.id, deletedAt: null },
    });

    if (!subject) {
      return NextResponse.json(
        errorResponse(ErrorCodes.NOT_FOUND, "Materia no encontrada"),
        { status: 404 }
      );
    }

    const updated = await prisma.subject.update({
      where: { id: params.id },
      data: {
        name: body.name?.trim() ?? subject.name,
        description: body.description?.trim() ?? subject.description,
        color: body.color ?? subject.color,
        icon: body.icon ?? subject.icon,
        credits: body.credits ?? subject.credits,
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
});

// DELETE — Soft delete
export const DELETE = withMinRole("SUPER_ADMIN")(async (req, { params }) => {
  try {
    const subject = await prisma.subject.findFirst({
      where: { id: params.id, deletedAt: null },
    });

    if (!subject) {
      return NextResponse.json(
        errorResponse(ErrorCodes.NOT_FOUND, "Materia no encontrada"),
        { status: 404 }
      );
    }

    await prisma.subject.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
        deletedBy: req.user.sub,
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
});
