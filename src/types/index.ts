import { RoleName } from "@prisma/client";
import { AccessTokenPayload } from "@/lib/auth/jwt";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta?: Record<string, unknown>;
}

export function successResponse<T>(
  data: T,
  meta?: Record<string, unknown>
): ApiResponse<T> {
  return { success: true, data, ...(meta ? { meta } : {}) };
}

export function errorResponse(
  code: string,
  message: string,
  details?: Record<string, string[]>
): ApiResponse {
  return {
    success: false,
    error: { code, message, ...(details ? { details } : {}) },
  };
}

export interface AuthenticatedRequest {
  user: AccessTokenPayload;
}

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId?: string;
}

export interface LoginInput {
  emailOrUsername: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: PublicUser;
}

export interface PublicUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  role: {
    id: string;
    name: RoleName;
  };
  createdAt: Date;
}

export const ErrorCodes = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  TOKEN_INVALID: "TOKEN_INVALID",
  TOKEN_REVOKED: "TOKEN_REVOKED",
  EMAIL_TAKEN: "EMAIL_TAKEN",
  USERNAME_TAKEN: "USERNAME_TAKEN",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  USER_INACTIVE: "USER_INACTIVE",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  BAD_REQUEST: "BAD_REQUEST",
  RATE_LIMITED: "RATE_LIMITED",
} as const;

export type ErrorCode = keyof typeof ErrorCodes;

export const RoleHierarchy: Record<RoleName, number> = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  TEACHER: 3,
  PARENT: 2,
  STUDENT: 1,
};

export function hasMinimumRole(
  userRole: RoleName,
  requiredRole: RoleName
): boolean {
  return RoleHierarchy[userRole] >= RoleHierarchy[requiredRole];
}