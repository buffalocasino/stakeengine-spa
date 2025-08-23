import { Pool } from '@neondatabase/serverless';
import { env } from '$env/dynamic/private';

// Use Pool with standard configuration
const pool = new Pool({ 
  connectionString: env.DATABASE_URL || 'postgresql://localhost:5432/stakeengine'
});

// Export the pool directly
export { pool };

export function getPool() {
  return pool;
}

export async function query(text: string, params?: any[]) {
  const result = await pool.query(text, params);
  return result;
}
