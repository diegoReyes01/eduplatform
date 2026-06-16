import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyRefreshToken, generateTokenPair } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token requerido' },
        { status: 400 }
      );
    }

    const payload = verifyRefreshToken(refreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { role: true } } },
    });

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Refresh token inválido o expirado' },
        { status: 401 }
      );
    }

    if (!storedToken.user.isActive || storedToken.user.deletedAt) {
      return NextResponse.json(
        { error: 'Usuario no autorizado' },
        { status: 401 }
      );
    }

    // Revocar token anterior
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    const tokens = generateTokenPair({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role.name,
    });

    const ipAddress = req.headers.get('x-forwarded-for') ?? 'unknown';
    const userAgent = req.headers.get('user-agent') ?? 'unknown';

    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userId: storedToken.user.id,
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json(tokens);
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json(
      { error: 'Token inválido' },
      { status: 401 }
    );
  }
}