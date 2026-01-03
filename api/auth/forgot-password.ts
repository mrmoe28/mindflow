import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserByEmail, generatePasswordResetToken } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse body - Vercel may already parse JSON, but handle Buffer/string cases
    let body = req.body;
    if (Buffer.isBuffer(body)) {
      body = JSON.parse(body.toString());
    } else if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error('Failed to parse body as JSON:', e);
        return res.status(400).json({ error: 'Invalid JSON in request body' });
      }
    }

    const { email } = (body || {}) as { email?: string };

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await getUserByEmail(email);
    
    // Don't reveal if user exists or not (security best practice)
    // Always return success message
    if (user) {
      const token = await generatePasswordResetToken(user.id);
      
      // In production, send email with reset link
      // For now, we'll return the token (remove this in production!)
      const resetLink = `${process.env.FRONTEND_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
      
      console.log(`Password reset link for ${email}: ${resetLink}`);
      
      // TODO: Send email with reset link
      // await sendPasswordResetEmail(user.email, resetLink);
    }

    return res.status(200).json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}

