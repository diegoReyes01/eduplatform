import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyAccessToken, extractBearerToken } from "@/lib/auth/jwt";
import { errorResponse, successResponse, ErrorCodes } from "@/types";
import { RoleName } from "@prisma/client";

async function getPayload(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("Authorization"));
  if (!token) return null;
  try {
    return verifyAccessToken(token);
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
    const payload = await getPayload(req);
    if (!payload) {
      return NextResponse.json(
        errorResponse(ErrorCodes.UNAUTHORIZED, "Token inválido"),
        { status: 401 }
      );
    }

    const role = (payload as any).role;
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json(
        errorResponse(ErrorCodes.FORBIDDEN, "Acceso denegado"),
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));

    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      return NextResponse.json(
        errorResponse(ErrorCodes.NOT_FOUND, "Usuario no encontrado"),
        { status: 404 }
      );
    }

    const updateData: { isActive?: boolean; roleId?: string } = {};

    if (typeof body.isActive === "boolean") {
      updateData.isActive = body.isActive;
    }

    if (body.roleName) {
      const validRoles: RoleName[] = ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT", "PARENT"];
      if (!validRoles.includes(body.roleName)) {
        return NextResponse.json(
          errorResponse(ErrorCodes.VALIDATION_ERROR, "Rol inválido"),
          { status: 422 }
        );
      }
      const newRole = await prisma.role.findUnique({ where: { name: body.roleName } });
      if (!newRole) {
        return NextResponse.json(
          errorResponse(ErrorCodes.NOT_FOUND, "Rol no encontrado"),
          { status: 404 }
        );
      }
      updateData.roleId = newRole.id;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        isActive: true,
        role: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(successResponse(updated));
  } catch (err) {
    console.error("[PATCH /api/users/[id]]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, "Error al actualizar usuario"),
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
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json(
        errorResponse(ErrorCodes.FORBIDDEN, "Acceso denegado"),
        { status: 403 }
      );
    }

    const userId = (payload as any).userId ?? (payload as any).sub;
    if (userId === id) {
      return NextResponse.json(
        errorResponse(ErrorCodes.BAD_REQUEST, "No puedes eliminar tu propia cuenta"),
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      return NextResponse.json(
        errorResponse(ErrorCodes.NOT_FOUND, "Usuario no encontrado"),
        { status: 404 }
      );
    }

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: userId },
    });

    return NextResponse.json(successResponse({ message: "Usuario eliminado" }));
  } catch (err) {
    console.error("[DELETE /api/users/[id]]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, "Error al eliminar usuario"),
      { status: 500 }
    );
  }
}