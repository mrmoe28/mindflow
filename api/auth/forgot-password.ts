import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserByEmail, generatePasswordResetToken } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse body if it's a Buffer or string
  let body = req.body;
  if (Buffer.isBuffer(body)) {
    body = JSON.parse(body.toString());
  } else if (typeof body === 'string') {
    body = JSON.parse(body);
  }

  const { email } = body as { email: string };

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await getUserByEmail(email);
    
    // Don't reveal if user exists or not (security best practice)
    // Always return success message
    if (user) {
      const token = await generatePasswordResetToken(user.id);
      
      // In production, send email with reset link
      // For now, we'll return the token (remove this in production!)
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
      
      console.log(`Password reset link for ${email}: ${resetLink}`);
      
      // TODO: Send email with reset link
      // await sendPasswordResetEmail(user.email, resetLink);
    }

    return res.status(200).json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}

