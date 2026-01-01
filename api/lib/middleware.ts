import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from './auth';

// Authentication middleware
export function requireAuth(
  req: VercelRequest,
  res: VercelResponse
): { userId: string; email: string } | null {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized - No token provided' });
    return null;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({ error: 'Unauthorized - Invalid token' });
    return null;
  }

  return payload;
}

