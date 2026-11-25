import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-anka-sit-2026-jwt-signing-key"
);

export type AdminRole = "ADMIN" | "YK";

export interface SessionPayload {
  userId: string;
  username: string;
  role: AdminRole;
  fullName: string;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(JWT_SECRET);
}

export async function verifyServerSession(requiredRoles?: AdminRole[]): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("anka_session")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const session = payload as unknown as SessionPayload;
    if (requiredRoles && !requiredRoles.includes(session.role)) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}
