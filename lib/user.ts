import { supabase } from './supabase';

export async function createOrGetUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user profile:', error);
    return null;
  }

  if (data) {
    return data;
  }

  const { data: newProfile, error: insertError } = await supabase
    .from('profiles')
    .insert({ user_id: userId, credits: 3, tier: 'free' })
    .select()
    .single();

  if (insertError) {
    console.error('Error creating user profile:', insertError);
    return null;
  }

  return newProfile;
}