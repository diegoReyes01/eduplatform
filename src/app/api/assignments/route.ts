// GET /api/assignments?subjectId=xxx — Listar tareas
// POST /api/assignments — Crear tarea

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

    const assignments = await prisma.assignment.findMany({
      where: {
        deletedAt: null,
        ...(subjectId
          ? { class: { subjectId } }
          : {}),
      },
      orderBy: { dueDate: "asc" },
      include: {
        class: {
          select: { id: true, name: true, subjectId: true },
        },
        _count: {
          select: { submissions: true },
        },
      },
      take: 100,
    });

    return NextResponse.json(successResponse(assignments));
  } catch (err) {
    console.error("[GET /api/assignments]", err);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, "Error al obtener tareas"),
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const userId = (payload as any).userId ?? (payload as any).sub;
    const body = await req.json().catch(() => null);

    if (!body?.title || !body?.subjectId || !body?.dueDate) {
      return NextResponse.json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, "Título, materia y fecha son requeridos"),
        { status: 422 }
      );
    }

    // Buscar o crear una "clase" genérica para esta materia
    let classRecord = await prisma.class.findFirst({
      where: { subjectId: body.subjectId, deletedAt: null },
    });

    if (!classRecord) {
      classRecord = await prisma.class.create({
        data: {
          name: "Clase General",
          code: `GEN-${Date.now()}`,
          subjectId: body.subjectId,
          teacherId: userId,
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        },
      });
    }

    const assignment = await prisma.assignment.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() || "Sin descripción",
        maxScore: body.maxScore ?? 100,
        dueDate: new Date(body.dueDate),
        status: "DRAFT",
        classId: classRecord.id,
        createdById: userId,
      },
    });

    return NextResponse.json(successResponse(assignment), { status: 201 });
  } catch (err) {
    console.error("[POST /api/assignments]", err);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, "Error al crear tarea"),
      { status: 500 }
    );
  }
}
