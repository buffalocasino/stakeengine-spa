import { json } from '@sveltejs/kit';
import { pool } from '$lib/db';
import { verifyToken } from '$lib/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    // Get JWT token from cookies or Authorization header
    let token = cookies.get('auth-token');
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return json({ error: 'Invalid token' }, { status: 401 });
    }

    const { sessionId, endingBalance } = await request.json();

    await pool.query(
      'UPDATE game_sessions SET session_end = CURRENT_TIMESTAMP, ending_balance = $1 WHERE id = $2',
      [endingBalance, sessionId]
    );

    return json({ success: true });
  } catch (error) {
    console.error('Error ending game session:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
