import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from './supabase';

// Authentication middleware using Supabase
export async function requireAuth(
  req: VercelRequest,
  res: VercelResponse
): Promise<{ userId: string; email: string } | null> {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized - No token provided' });
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    // Verify the token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      res.status(401).json({ error: 'Unauthorized - Invalid token' });
      return null;
    }

    return {
      userId: user.id,
      email: user.email || '',
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(401).json({ error: 'Unauthorized - Invalid token' });
    return null;
  }
}

