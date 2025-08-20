import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const load = async () => {
  const { data } = supabase
    .storage
    .from('configs')
    .getPublicUrl('game-config.json');

  return { configUrl: data.publicUrl };
};
