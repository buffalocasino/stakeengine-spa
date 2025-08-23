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

    const { currencyType, amount, operation } = await request.json();
    const field = currencyType === 'gold' ? 'gold_coins' : 'buffalo_coins';

    let newAmount: number;

    if (operation === 'set') {
      // Direct set operation
      newAmount = amount;
    } else {
      // Get current balance for add/subtract operations
      const currentResult = await pool.query(
        `SELECT ${field} FROM user_currency_balances WHERE user_id = $1`,
        [user.user_id]
      );

      if (currentResult.rows.length === 0) {
        return json({ error: 'User balances not found' }, { status: 404 });
      }

      const currentAmount = parseFloat(currentResult.rows[0][field]);
      newAmount = operation === 'add' ? currentAmount + amount : currentAmount - amount;
    }

    // Prevent negative balances
    if (newAmount < 0) {
      return json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const result = await pool.query(
      `UPDATE user_currency_balances 
       SET ${field} = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $2 RETURNING *`,
      [newAmount, user.user_id]
    );

    if (result.rows.length === 0) {
      return json({ error: 'Failed to update balance' }, { status: 500 });
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
    console.error('Error updating balance:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
