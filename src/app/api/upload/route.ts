import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/db/prisma";
import { verifyAccessToken, extractBearerToken } from "@/lib/auth/jwt";
import { errorResponse, successResponse, ErrorCodes } from "@/types";
import { ResourceType } from "@prisma/client";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    if (!token) return NextResponse.json(errorResponse(ErrorCodes.UNAUTHORIZED, "Token requerido"), { status: 401 });

    let payload;
    try { payload = verifyAccessToken(token); }
    catch { return NextResponse.json(errorResponse(ErrorCodes.TOKEN_INVALID, "Token inválido o expirado"), { status: 401 }); }

    const userId = (payload as any).userId ?? (payload as any).sub;
    if (!userId) return NextResponse.json(errorResponse(ErrorCodes.UNAUTHORIZED, "No se pudo obtener el ID del usuario"), { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null;
    const classId = formData.get("classId") as string | null;
    const subjectId = formData.get("subjectId") as string | null;

    if (!file) return NextResponse.json(errorResponse(ErrorCodes.VALIDATION_ERROR, "No se envió ningún archivo"), { status: 422 });

    const resourceType = ALLOWED_TYPES[file.type];
    if (!resourceType) return NextResponse.json(errorResponse(ErrorCodes.VALIDATION_ERROR, `Tipo no permitido: ${file.type}`), { status: 422 });

    if (file.size > MAX_SIZE) return NextResponse.json(errorResponse(ErrorCodes.VALIDATION_ERROR, "Archivo supera 50MB"), { status: 422 });

    // Subir a Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    const resourceKind = resourceType === "VIDEO" ? "video" : resourceType === "IMAGE" ? "image" : "raw";

    const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: resourceKind,
          folder: "eduplatform",
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error || !result) reject(error ?? new Error("Upload fallido"));
          else resolve(result as { secure_url: string; public_id: string });
        }
      ).end(buffer);
    });

    const url = uploadResult.secure_url;

    const resource = await prisma.resource.create({
      data: {
        title: title?.trim() || file.name,
        type: resourceType,
        url,
        fileSize: file.size,
        mimeType: file.type,
        uploadedById: userId,
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
    return NextResponse.json(errorResponse(ErrorCodes.INTERNAL_ERROR, "Error al subir archivo"), { status: 500 });
  }
}