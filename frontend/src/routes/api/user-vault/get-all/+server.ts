import { json } from '@sveltejs/kit';
import { pool } from '$lib/db';
import { verifyToken } from '$lib/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
  try {
    // Get JWT token from cookies or Authorization header
    let token = cookies.get('auth-token');

    if (!token) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return json({ error: 'Invalid token' }, { status: 401 });
    }

    const result = await pool.query(
      'SELECT key, value FROM user_vault WHERE user_id = $1',
      [user.user_id]
    );

    // Convert array to object with keys as properties
    const data: Record<string, any> = {};
    result.rows.forEach((item: any) => {
      const value = JSON.parse(item.value);
      data[item.key] = value;
    });

    return json({ data });
  } catch (error) {
    console.error('Error getting all vault data:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
