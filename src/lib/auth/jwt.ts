import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES ?? '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES ?? '7d';
const ISSUER = process.env.JWT_ISSUER ?? 'eduplatform';
const AUDIENCE = process.env.JWT_AUDIENCE ?? 'eduplatform-users';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateTokenPair(payload: JwtPayload) {
  const accessToken = jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES as any,
    issuer: ISSUER,
    audience: AUDIENCE,
  });

  const refreshToken = jwt.sign({ userId: payload.userId }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES as any,
    issuer: ISSUER,
    audience: AUDIENCE,
  });

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, ACCESS_SECRET, {
    issuer: ISSUER,
    audience: AUDIENCE,
  }) as JwtPayload;
}

export function verifyRefreshToken(token: string): { userId: string } {
  return jwt.verify(token, REFRESH_SECRET, {
    issuer: ISSUER,
    audience: AUDIENCE,
  }) as { userId: string };
}

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}