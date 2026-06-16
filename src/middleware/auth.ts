import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, extractBearerToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';
import { RoleName } from '@/types';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: RoleName;
  };
}

type RouteHandler = (
  req: AuthenticatedRequest,
  context?: any
) => Promise<NextResponse>;

export function withAuth(handler: RouteHandler): RouteHandler {
  return async (req, context) => {
    try {
      const token = extractBearerToken(req.headers.get('authorization'));

      if (!token) {
        return NextResponse.json(
          { error: 'Token requerido' },
          { status: 401 }
        );
      }

      const payload = verifyAccessToken(token);

      const user = await prisma.user.findUnique({
        where: { id: payload.userId, deletedAt: null, isActive: true },
        select: { id: true, email: true, role: true },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 401 }
        );
      }

      (req as any).user = {
        userId: user.id,
        email: user.email,
        role: user.role.name as RoleName,
      };

      return handler(req, context);
    } catch {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }
  };
}

const ROLE_HIERARCHY: Record<RoleName, number> = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  TEACHER: 3,
  PARENT: 2,
  STUDENT: 1,
};

export function withRoles(...roles: RoleName[]) {
  return (handler: RouteHandler): RouteHandler => {
    return withAuth(async (req, context) => {
      const userRole = (req as any).user?.role as RoleName;
      if (!roles.includes(userRole)) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 403 }
        );
      }
      return handler(req, context);
    });
  };
}

export function withMinRole(minRole: RoleName) {
  return (handler: RouteHandler): RouteHandler => {
    return withAuth(async (req, context) => {
      const userRole = (req as any).user?.role as RoleName;
      if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[minRole]) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 403 }
        );
      }
      return handler(req, context);
    });
  };
}