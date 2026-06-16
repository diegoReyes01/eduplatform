import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password';
import { generateTokenPair } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, username, password, firstName, lastName } = body;

    if (!email || !username || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: passwordCheck.message },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
        deletedAt: null,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email o username ya están en uso' },
        { status: 409 }
      );
    }

    const studentRole = await prisma.role.findUnique({
      where: { name: 'STUDENT' },
    });

    if (!studentRole) {
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        firstName,
        lastName,
        roleId: studentRole.id,
        experience: {
          create: {
            totalXp: 0,
            currentXp: 0,
            level: {
              connectOrCreate: {
                where: { number: 1 },
                create: {
                  number: 1,
                  name: 'Principiante',
                  xpRequired: 0,
                  xpMax: 100,
                },
              },
            },
          },
        },
      },
      include: { role: true },
    });

    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role.name,
    });

    const ipAddress = req.headers.get('x-forwarded-for') ?? 'unknown';
    const userAgent = req.headers.get('user-agent') ?? 'unknown';

    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userId: user.id,
        ipAddress,
        userAgent,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'User',
        entityId: user.id,
        userId: user.id,
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role.name,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}