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

    const userId = (payload as any).userId ?? (payload as any).sub;

    const grades = await prisma.grade.findMany({
      where: {
        studentId: userId,
        isPublished: true,
        deletedAt: null,
      },
      include: {
        evaluation: {
          include: { class: { include: { subject: { select: { name: true } } } } },
        },
        submission: {
          include: {
            assignment: {
              include: { class: { include: { subject: { select: { name: true } } } } },
            },
          },
        },
      },
      orderBy: { publishedAt: "desc" },
    });

    const data = grades.map((g) => {
      const subjectName =
        g.evaluation?.class?.subject?.name ??
        g.submission?.assignment?.class?.subject?.name ??
        "Sin materia";
      const evaluacionTitulo = g.evaluation?.title ?? g.submission?.assignment?.title ?? "Evaluación";
      const porcentaje = g.evaluation?.weight != null ? Math.round(g.evaluation.weight * 100) : 100;

      return {
        id: g.id,
        materia: subjectName,
        evaluacion: evaluacionTitulo,
        nota: g.score,
        notaMaxima: g.maxScore,
        porcentaje,
        fecha: g.publishedAt ?? g.createdAt,
        feedback: g.feedback,
      };
    });

    return NextResponse.json(successResponse(data));
  } catch (err) {
    console.error("[GET /api/grades]", err);
    return NextResponse.json(errorResponse(ErrorCodes.INTERNAL_ERROR, "Error"), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
    const gradedById = (payload as any).userId ?? (payload as any).sub;

    const body = await req.json();
    const { submissionId, score, feedback } = body;

    if (!submissionId || score === undefined || score === null) {
      return NextResponse.json(errorResponse(ErrorCodes.VALIDATION_ERROR, "submissionId y score son requeridos"), { status: 422 });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { assignment: true, grade: true },
    });

    if (!submission) {
      return NextResponse.json(errorResponse(ErrorCodes.NOT_FOUND, "Entrega no encontrada"), { status: 404 });
    }
    if (submission.grade) {
      return NextResponse.json(errorResponse(ErrorCodes.VALIDATION_ERROR, "Esta entrega ya fue calificada"), { status: 409 });
    }

    const maxScore = submission.assignment.maxScore;
    const scoreNum = parseFloat(score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > maxScore) {
      const msg = "score debe estar entre 0 y " + maxScore;
      return NextResponse.json(errorResponse(ErrorCodes.VALIDATION_ERROR, msg), { status: 422 });
    }

    const grade = await prisma.grade.create({
      data: {
        score: scoreNum,
        maxScore,
        percentage: (scoreNum / maxScore) * 100,
        feedback: feedback || null,
        isPublished: true,
        publishedAt: new Date(),
        studentId: submission.studentId,
        gradedById,
        submissionId: submission.id,
      },
    });

    await prisma.submission.update({
      where: { id: submission.id },
      data: { status: "GRADED" },
    });

    return NextResponse.json(successResponse(grade));
  } catch (err) {
    console.error("[POST /api/grades]", err);
    return NextResponse.json(errorResponse(ErrorCodes.INTERNAL_ERROR, "Error"), { status: 500 });
  }
}
