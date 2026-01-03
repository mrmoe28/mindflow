import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyPasswordResetToken, markPasswordResetTokenAsUsed, updateUserPassword } from '../lib/auth';

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

    const { token, password } = (body || {}) as { token?: string; password?: string };

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Verify token
    const userId = await verifyPasswordResetToken(token);
    if (!userId) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Update password
    await updateUserPassword(userId, password);

    // Mark token as used
    await markPasswordResetTokenAsUsed(token);

    return res.status(200).json({
      message: 'Password reset successfully',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
}

