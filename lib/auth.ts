import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_ambient_radio_jwt_secret_key_2026"
);

const TOKEN_COOKIE_NAME = "auth_token";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: { userId: string; username: string }) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET_KEY);
  return token;
}

export async function verifySessionToken(token: string) {
  try {
    const verified = await jwtVerify(token, JWT_SECRET_KEY);
    return verified.payload as { userId: string; username: string };
  } catch {
    return null;
  }
}

export async function getAuthenticatedAdmin() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(TOKEN_COOKIE_NAME);
  if (!tokenCookie || !tokenCookie.value) {
    return null;
  }
  return verifySessionToken(tokenCookie.value);
}

export function setAuthCookieHeader(token: string) {
  return `${TOKEN_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400; ${
    process.env.NODE_ENV === "production" ? "Secure;" : ""
  }`;
}

export function clearAuthCookieHeader() {
  return `${TOKEN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; ${
    process.env.NODE_ENV === "production" ? "Secure;" : ""
  }`;
}
