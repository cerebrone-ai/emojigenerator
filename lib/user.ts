import { supabase } from './supabase'

export async function createOrGetUserProfile(userId: string) {
  // Check if the user already exists
  const { data: existingUser, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching user:', fetchError)
    throw fetchError
  }

  if (existingUser) {
    return existingUser
  }

  // If the user doesn't exist, create a new profile
  const { data: newUser, error: insertError } = await supabase
    .from('profiles')
    .insert([
      {
        user_id: userId,
        credits: 3,
        tier: 'free'
      }
    ])
    .select()
    .single()

  if (insertError) {
    console.error('Error creating user:', insertError)
    throw insertError
  }

  return newUser
}