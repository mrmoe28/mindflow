import { verifyPasswordResetToken, markPasswordResetTokenAsUsed, updateUserPassword } from '../lib/auth';

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

  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
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
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
}

