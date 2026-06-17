// GET /api/evaluations?subjectId=xxx — Listar evaluaciones
// POST /api/evaluations — Crear evaluación

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyAccessToken, extractBearerToken } from "@/lib/auth/jwt";
import { errorResponse, successResponse, ErrorCodes } from "@/types";
import { EvaluationType } from "@prisma/client";

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

    const evaluations = await prisma.evaluation.findMany({
      where: {
        deletedAt: null,
        ...(subjectId ? { class: { subjectId } } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        class: {
          select: { id: true, name: true, subjectId: true },
        },
        _count: {
          select: { grades: true },
        },
      },
      take: 100,
    });

    return NextResponse.json(successResponse(evaluations));
  } catch (err) {
    console.error("[GET /api/evaluations]", err);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, "Error al obtener evaluaciones"),
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

    if (!body?.title || !body?.subjectId) {
      return NextResponse.json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, "Título y materia son requeridos"),
        { status: 422 }
      );
    }

    const validTypes: EvaluationType[] = ["QUIZ", "EXAM", "ORAL", "PROJECT", "PRACTICAL", "HOMEWORK", "PARTICIPATION"];
    const type: EvaluationType = validTypes.includes(body.type) ? body.type : "QUIZ";

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

    const evaluation = await prisma.evaluation.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() ?? null,
        type,
        maxScore: body.maxScore ?? 100,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        isPublished: false,
        classId: classRecord.id,
      },
    });

    return NextResponse.json(successResponse(evaluation), { status: 201 });
  } catch (err) {
    console.error("[POST /api/evaluations]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, "Error al crear evaluación"),
      { status: 500 }
    );
  }
}