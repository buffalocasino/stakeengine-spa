import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from './db.js';
import { env } from '$env/dynamic/private';

const JWT_SECRET = env.JWT_SECRET || 'fallback-secret-key-change-in-production';

export interface User {
  id: string;
  email: string;
  username?: string;
  balance: number;
  gold_coins: number;
  buffalo_coins: number;
  created_at: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string, email: string): string {
  return jwt.sign({ user_id: userId, email }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { user_id: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { user_id: string; email: string };
  } catch {
    return null;
  }
}

export async function createUser(email: string, password: string, username?: string): Promise<User> {
  const hashedPassword = await hashPassword(password);
  const userId = crypto.randomUUID();
  
  const result = await pool.query(`
    INSERT INTO users (id, email, username, password_hash, balance, gold_coins, buffalo_coins)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, email, username, balance, gold_coins, buffalo_coins, created_at
  `, [userId, email, username, hashedPassword, 1000.00, 1000.00, 50.00]);
  
  return result.rows[0];
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const result = await pool.query(`
    SELECT id, email, username, password_hash, balance, gold_coins, buffalo_coins, created_at
    FROM users WHERE email = $1
  `, [email]);
  
  if (result.rows.length === 0) {
    return null;
  }
  
  const user = result.rows[0];
  const isValid = await verifyPassword(password, user.password_hash);
  
  if (!isValid) {
    return null;
  }
  
  // Return user without password hash
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await pool.query(`
    SELECT id, email, username, balance, gold_coins, buffalo_coins, created_at
    FROM users WHERE id = $1
  `, [id]);
  
  return result.rows[0] || null;
}
