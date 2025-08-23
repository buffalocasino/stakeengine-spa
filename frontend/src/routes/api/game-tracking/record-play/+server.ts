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

    const { 
      sessionId, 
      gameId, 
      betAmount, 
      winAmount, 
      gameBoard, 
      winningLines, 
      balanceBefore, 
      balanceAfter, 
      spinDuration 
    } = await request.json();

    // Get the game UUID from game_id
    const gameResult = await pool.query(
      'SELECT id FROM games WHERE game_id = $1',
      [gameId]
    );

    if (gameResult.rows.length === 0) {
      return json({ error: 'Game not found' }, { status: 404 });
    }

    const game = gameResult.rows[0];
    const netResult = winAmount - betAmount;

    // Insert game play
    await pool.query(
      `INSERT INTO game_plays (session_id, user_id, game_id, bet_amount, win_amount, net_result, 
       game_board, winning_lines, spin_duration_ms, balance_before, balance_after)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [sessionId, user.user_id, game.id, betAmount, winAmount, netResult, 
       JSON.stringify(gameBoard), JSON.stringify(winningLines), spinDuration, 
       balanceBefore, balanceAfter]
    );

    // Update session totals
    await pool.query(
      `UPDATE game_sessions SET 
       total_spins = total_spins + 1,
       total_wagered = total_wagered + $1,
       total_won = total_won + $2,
       net_result = net_result + $3
       WHERE id = $4`,
      [betAmount, winAmount, netResult, sessionId]
    );

    return json({ success: true });
  } catch (error) {
    console.error('Error recording game play:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
