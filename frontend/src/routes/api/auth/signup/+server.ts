import { json } from '@sveltejs/kit';
import { createUser, generateToken } from '$lib/auth.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email, password, username } = await request.json();
    
    if (!email || !password) {
      return json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    if (password.length < 6) {
      return json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    
    const user = await createUser(email, password, username);
    const token = generateToken(user.id, user.email);
    
    return json({
      user,
      token
    });
  } catch (error: any) {
    if (error.code === '23505') { // Unique constraint violation
      return json({ error: 'Email already exists' }, { status: 409 });
    }
    
    console.error('Signup error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
