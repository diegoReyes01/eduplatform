import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db/prisma";
import { verifyAccessToken, extractBearerToken } from "@/lib/auth/jwt";
import { errorResponse, successResponse, ErrorCodes } from "@/types";
import { ResourceType } from "@prisma/client";

const ALLOWED_TYPES: Record<string, ResourceType> = {
  "application/pdf": "PDF",
  "application/vnd.ms-powerpoint": "PRESENTATION",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PRESENTATION",
  "video/mp4": "VIDEO",
  "video/webm": "VIDEO",
  "image/jpeg": "IMAGE",
  "image/png": "IMAGE",
  "image/webp": "IMAGE",
};

const MAX_SIZE = 50 * 1024 * 1024;

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
        errorResponse(ErrorCodes.TOKEN_INVALID, "Token inválido o expirado"),
        { status: 401 }
      );
    }

    const userId = (payload as any).userId ?? payload.sub;

    if (!userId) {
      return NextResponse.json(
        errorResponse(ErrorCodes.UNAUTHORIZED, "No se pudo obtener el ID del usuario"),
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null;
    const classId = formData.get("classId") as string | null;
    const subjectId = formData.get("subjectId") as string | null;

    if (!file) {
      return NextResponse.json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, "No se envió ningún archivo"),
        { status: 422 }
      );
    }

    const resourceType = ALLOWED_TYPES[file.type];
    if (!resourceType) {
      return NextResponse.json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, `Tipo no permitido: ${file.type}`),
        { status: 422 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        errorResponse(ErrorCodes.VALIDATION_ERROR, "Archivo supera 50MB"),
        { status: 422 }
      );
    }

    // Guardar en disco
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const fileName = `${timestamp}_${safeName}`;
    const filePath = path.join(uploadsDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const url = `/uploads/${fileName}`;

    // Guardar en BD con subjectId
    const resource = await prisma.resource.create({
      data: {
        title: title?.trim() || file.name,
        type: resourceType,
        url,
        fileSize: file.size,
        mimeType: file.type,
        uploadedById: userId,
        ...(subjectId ? { subjectId } : {}),
      },
    });

    return NextResponse.json(
      successResponse({
        id: resource.id,
        url,
        title: resource.title,
        type: resource.type,
        size: file.size,
        classId: classId ?? null,
        subjectId: subjectId ?? null,
      }),
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/upload]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      errorResponse(ErrorCodes.INTERNAL_ERROR, "Error al subir archivo"),
      { status: 500 }
    );
  }
}