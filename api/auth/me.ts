import { verifyToken, getUserById } from '../lib/auth';

export interface VercelRequest {
  method?: string;
  headers: {
    authorization?: string;
  };
}

export interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user
    const user = await getUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        email_verified: user.email_verified,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Failed to get user' });
  }
}

