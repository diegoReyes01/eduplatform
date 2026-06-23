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

    const role = (payload as any).role;
    if (!["TEACHER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json(errorResponse(ErrorCodes.FORBIDDEN, "Acceso denegado"), { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get("assignmentId");
    if (!assignmentId) return NextResponse.json(errorResponse(ErrorCodes.VALIDATION_ERROR, "assignmentId requerido"), { status: 422 });

    const submissions = await prisma.submission.findMany({
      where: { assignmentId },
      include: {
        student: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json(successResponse(submissions));
  } catch (err) {
    console.error("[GET /api/profesor/entregas]", err);
    return NextResponse.json(errorResponse(ErrorCodes.INTERNAL_ERROR, "Error"), { status: 500 });
  }
}