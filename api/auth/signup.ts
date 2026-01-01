import { sql } from '../lib/db';
import { createUser, getUserByEmail, generateToken } from '../lib/auth';

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

  const { email, password, name } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Create user
    const user = await createUser(email, password, name);

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        email_verified: user.email_verified,
      },
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Failed to create account' });
  }
}

