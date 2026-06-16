import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyRefreshToken } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refreshToken, allDevices } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token requerido' },
        { status: 400 }
      );
    }

    const payload = verifyRefreshToken(refreshToken);

    if (allDevices) {
      await prisma.refreshToken.updateMany({
        where: { userId: payload.userId, isRevoked: false },
        data: { isRevoked: true },
      });
    } else {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { isRevoked: true },
      });
    }

    const ipAddress = req.headers.get('x-forwarded-for') ?? 'unknown';
    const userAgent = req.headers.get('user-agent') ?? 'unknown';

    await prisma.auditLog.create({
      data: {
        action: 'LOGOUT',
        entity: 'User',
        entityId: payload.userId,
        userId: payload.userId,
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json({ message: 'Sesión cerrada correctamente' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}