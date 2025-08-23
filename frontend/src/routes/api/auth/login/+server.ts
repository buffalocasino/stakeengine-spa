import { json } from '@sveltejs/kit';
import { authenticateUser, generateToken } from '$lib/auth.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    const user = await authenticateUser(email, password);
    
    if (!user) {
      return json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    const token = generateToken(user.id, user.email);
    
    return json({
      user,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
