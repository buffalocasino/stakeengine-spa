import { json } from '@sveltejs/kit';
import { pool } from '$lib/db';
import { verifyToken } from '$lib/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request, cookies }) => {
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

    const result = await pool.query(
      'SELECT * FROM user_currency_balances WHERE user_id = $1',
      [user.user_id]
    );

    if (result.rows.length === 0) {
      // Create initial balance record for new user
      const initialResult = await pool.query(
        `INSERT INTO user_currency_balances (user_id, gold_coins, buffalo_coins)
         VALUES ($1, $2, $3) RETURNING *`,
        [user.user_id, 1000.00, 50.00]
      );

      const data = initialResult.rows[0];
      return json({
        balances: {
          ...data,
          gold_coins: parseFloat(data.gold_coins),
          buffalo_coins: parseFloat(data.buffalo_coins)
        }
      });
    }

    const data = result.rows[0];
    return json({
      balances: {
        ...data,
        gold_coins: parseFloat(data.gold_coins),
        buffalo_coins: parseFloat(data.buffalo_coins)
      }
    });
  } catch (error) {
    console.error('Error loading user balances:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
