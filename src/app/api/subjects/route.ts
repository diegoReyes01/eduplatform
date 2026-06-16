// GET /api/subjects — Listar materias
// POST /api/subjects — Crear materia

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withAuth, withMinRole } from "@/middleware/auth";
import { errorResponse, successResponse, ErrorCodes } from "@/types";

// GET — Listar todas las materias
export async function GET(req: NextRequest) {
  try {
    const subjects = await prisma.subject.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { classes: true },
        },
      },
    });

    return NextResponse.json(successResponse(subjects));
  } catch (err) {
    console.error("[GET /api/subjects]", err);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, "Error al obtener materias"),
      { status: 500 }
    );
  }
}

// POST — Crear materia (solo ADMIN)
export const POST = withMinRole("SUPER_ADMIN")(async (req, _ctx) => {
  try {
    const body = await req.json().catch(() => null);

    if (!body?.name || !body?.code) {
      return NextResponse.json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, "Nombre y código son requeridos"),
        { status: 422 }
      );
    }

    // Verificar código único
    const existing = await prisma.subject.findFirst({
      where: { code: body.code.toUpperCase(), deletedAt: null },
    });

    if (existing) {
      return NextResponse.json(
        errorResponse(ErrorCodes.CONFLICT, "Ya existe una materia con ese código"),
        { status: 409 }
      );
    }

    const subject = await prisma.subject.create({
      data: {
        name: body.name.trim(),
        code: body.code.toUpperCase().trim(),
        description: body.description?.trim() ?? null,
        color: body.color ?? "#6366f1",
        icon: body.icon ?? null,
        credits: body.credits ?? 0,
      },
    });

    return NextResponse.json(successResponse(subject), { status: 201 });
  } catch (err) {
    console.error("[POST /api/subjects]", err);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, "Error al crear materia"),
      { status: 500 }
    );
  }
});
