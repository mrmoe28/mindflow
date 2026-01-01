import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface User {
  id: string;
  email: string;
  name?: string;
  email_verified: boolean;
  created_at: Date;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch (error) {
    return null;
  }
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const [user] = await sql<User[]>`
    SELECT id, email, name, email_verified, created_at
    FROM users
    WHERE email = ${email.toLowerCase()}
  `;
  return user || null;
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  const [user] = await sql<User[]>`
    SELECT id, email, name, email_verified, created_at
    FROM users
    WHERE id = ${id}
  `;
  return user || null;
}

// Create user
export async function createUser(
  email: string,
  password: string,
  name?: string
): Promise<User> {
  const hashedPassword = await hashPassword(password);
  const [user] = await sql<User[]>`
    INSERT INTO users (email, password_hash, name)
    VALUES (${email.toLowerCase()}, ${hashedPassword}, ${name || null})
    RETURNING id, email, name, email_verified, created_at
  `;
  return user;
}

// Get password hash for user
export async function getPasswordHash(userId: string): Promise<string | null> {
  const [result] = await sql<{ password_hash: string }[]>`
    SELECT password_hash FROM users WHERE id = ${userId}
  `;
  return result?.password_hash || null;
}

// Generate password reset token
export async function generatePasswordResetToken(userId: string): Promise<string> {
  const token = require('crypto').randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

  await sql`
    INSERT INTO password_reset_tokens (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt})
  `;

  return token;
}

// Verify password reset token
export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  const [result] = await sql<{ user_id: string; expires_at: Date; used: boolean }[]>`
    SELECT user_id, expires_at, used
    FROM password_reset_tokens
    WHERE token = ${token}
  `;

  if (!result || result.used || new Date() > result.expires_at) {
    return null;
  }

  return result.user_id;
}

// Mark password reset token as used
export async function markPasswordResetTokenAsUsed(token: string): Promise<void> {
  await sql`
    UPDATE password_reset_tokens
    SET used = true
    WHERE token = ${token}
  `;
}

// Update user password
export async function updateUserPassword(userId: string, newPassword: string): Promise<void> {
  const hashedPassword = await hashPassword(newPassword);
  await sql`
    UPDATE users
    SET password_hash = ${hashedPassword}
    WHERE id = ${userId}
  `;
}

