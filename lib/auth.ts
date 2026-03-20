import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const AUTH_COOKIE_NAME = 'auth_session';
const SESSION_VALUE = 'authenticated';

export async function setAuthSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });
}

export async function clearAuthSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function getAuthSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(AUTH_COOKIE_NAME);
  return session?.value === SESSION_VALUE;
}

export function validateCredentials(username: string, password: string): boolean {
  return (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  );
}

export function redirectToLogin() {
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
}
