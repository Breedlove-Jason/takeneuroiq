import { supabase } from '../lib/supabase';
export async function competitionRpc(name, args = {}) {
  if (!supabase) throw new Error('Competition accounts are not connected yet. Training is available now.');
  const {
    data,
    error
  } = await supabase.rpc(name, args);
  if (error) {
    if (error.code === 'PGRST202' || error.code === '42883') throw new Error('Competition is being prepared. Please try again shortly; training is ready now.');
    if (error.code === 'P0001') throw new Error(error.message);
    throw new Error('We could not reach the arena. Check your connection and retry. Your accepted answers are saved.');
  }
  return data;
}
