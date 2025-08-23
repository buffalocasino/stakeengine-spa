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

    const { gameId, startingBalance } = await request.json();

    // Get the game UUID from game_id
    const gameResult = await pool.query(
      'SELECT id FROM games WHERE game_id = $1',
      [gameId]
    );

    if (gameResult.rows.length === 0) {
      return json({ error: 'Game not found' }, { status: 404 });
    }

    const game = gameResult.rows[0];

    // Get client IP
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create new session
    const sessionResult = await pool.query(
      `INSERT INTO game_sessions (user_id, game_id, starting_balance, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user.user_id, game.id, startingBalance, clientIP, userAgent]
    );

    if (sessionResult.rows.length === 0) {
      return json({ error: 'Failed to create session' }, { status: 500 });
    }

    return json({ sessionId: sessionResult.rows[0].id });
  } catch (error) {
    console.error('Error starting game session:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
