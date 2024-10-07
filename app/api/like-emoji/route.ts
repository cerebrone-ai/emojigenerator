import { getAuth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      console.error('Unauthorized: No user ID found');
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { emojiId, action } = await request.json();
    console.log(`Received request: emojiId=${emojiId}, action=${action}, userId=${userId}`);

    if (action === 'like') {
      console.log('Attempting to like emoji');
      const { data: existingLike, error: checkError } = await supabase
        .from('likes')
        .select()
        .eq('user_id', userId)
        .eq('emoji_id', emojiId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing like:', checkError);
        // If the table doesn't exist, let's try to create it
        if (checkError.code === '42P01') {
          console.log('Likes table does not exist. Attempting to create it.');
          const { error: createTableError } = await supabase.rpc('create_likes_table');
          if (createTableError) {
            console.error('Error creating likes table:', createTableError);
            return NextResponse.json({ error: createTableError.message }, { status: 500 });
          }
        } else {
          return NextResponse.json({ error: checkError.message }, { status: 500 });
        }
      }

      if (!existingLike) {
        console.log('Inserting new like');
        const { error: insertError } = await supabase
          .from('likes')
          .insert({ user_id: userId, emoji_id: emojiId });

        if (insertError) {
          console.error('Error inserting like:', insertError);
          return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        console.log('Incrementing likes count');
        const { error: incrementError } = await supabase
          .rpc('increment_likes', { emoji_id: emojiId });

        if (incrementError) {
          console.error('Error incrementing likes:', incrementError);
          return NextResponse.json({ error: incrementError.message }, { status: 500 });
        }
      } else {
        console.log('Emoji already liked by user');
      }
    } else if (action === 'unlike') {
      console.log('Attempting to unlike emoji');
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', userId)
        .eq('emoji_id', emojiId);

      if (deleteError) {
        console.error('Error deleting like:', deleteError);
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }

      console.log('Decrementing likes count');
      const { error: decrementError } = await supabase
        .rpc('decrement_likes', { emoji_id: emojiId });

      if (decrementError) {
        console.error('Error decrementing likes:', decrementError);
        return NextResponse.json({ error: decrementError.message }, { status: 500 });
      }
    } else {
      console.error('Invalid action:', action);
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    console.log('Fetching updated emoji');
    const { data: updatedEmoji, error: fetchError } = await supabase
      .from('emojis')
      .select('*')
      .eq('id', emojiId)
      .single();

    if (fetchError) {
      console.error('Error fetching updated emoji:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    console.log('Successfully updated emoji:', updatedEmoji);
    return NextResponse.json(updatedEmoji);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}