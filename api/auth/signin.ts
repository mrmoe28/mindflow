import { getUserByEmail, verifyPassword, generateToken, getPasswordHash } from '../lib/auth';

export interface VercelRequest {
  method?: string;
  body: any;
}

export interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Get user
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const passwordHash = await getPasswordHash(user.id);
    if (!passwordHash) {
      return res.status(500).json({ error: 'Account error' });
    }

    const isValid = await verifyPassword(password, passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        email_verified: user.email_verified,
      },
      token,
    });
  } catch (error) {
    console.error('Signin error:', error);
    return res.status(500).json({ error: 'Failed to sign in' });
  }
}

