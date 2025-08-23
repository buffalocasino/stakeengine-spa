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

    const { key } = await request.json();

    await pool.query(
      'DELETE FROM user_vault WHERE user_id = $1 AND key = $2',
      [user.user_id, key]
    );

    return json({ success: true });
  } catch (error) {
    console.error('Error deleting vault data:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
