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

    const submissions = await prisma.submission.findMany({
      where: { studentId: userId },
      select: { assignmentId: true, status: true, submittedAt: true },
    });

    return NextResponse.json(successResponse(submissions));
  } catch (err) {
    console.error("[GET /api/submissions]", err);
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

    const userId = (payload as any).userId ?? (payload as any).sub;
    const { assignmentId, content } = await req.json();

    if (!assignmentId) return NextResponse.json(errorResponse(ErrorCodes.VALIDATION_ERROR, "assignmentId requerido"), { status: 422 });

    // Verificar que no haya entrega previa
    const existing = await prisma.submission.findFirst({
      where: { studentId: userId, assignmentId },
    });
    if (existing) return NextResponse.json(errorResponse(ErrorCodes.VALIDATION_ERROR, "Ya entregaste esta tarea"), { status: 409 });

    // Verificar que la tarea existe y está publicada
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment || assignment.status !== "PUBLISHED") {
      return NextResponse.json(errorResponse(ErrorCodes.NOT_FOUND, "Tarea no encontrada"), { status: 404 });
    }

    const isLate = new Date() > new Date(assignment.dueDate);

    const submission = await prisma.submission.create({
      data: {
        studentId: userId,
        assignmentId,
        content: content ?? "",
        fileUrls: fileUrls ?? [],
        isLate,
        status: "SUBMITTED",
      },
    });

    return NextResponse.json(successResponse(submission), { status: 201 });
  } catch (err) {
    console.error("[POST /api/submissions]", err);
    return NextResponse.json(errorResponse(ErrorCodes.INTERNAL_ERROR, "Error al entregar"), { status: 500 });
  }
}