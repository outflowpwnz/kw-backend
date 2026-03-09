// src/auth/interfaces/jwt-payload.interface.ts

export interface JwtPayload {
  sub: string;
  login: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}
