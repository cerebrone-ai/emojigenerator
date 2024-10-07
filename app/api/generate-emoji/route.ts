import { NextResponse, NextRequest } from 'next/server';
import Replicate from 'replicate';
import { createClient } from '@supabase/supabase-js';
import { getAuth } from "@clerk/nextjs/server";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      console.error('Unauthorized: No user ID found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt } = await request.json();

    console.log('Generating emoji for prompt:', prompt);

    let output;
    try {
      output = await replicate.run(
        "fofr/sdxl-emoji:dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e",
        {
          input: {
            width: 1024,
            height: 1024,
            prompt: "A TOK emoji of "+prompt,
            refine: "no_refiner",
            scheduler: "K_EULER",
            lora_scale: 0.6,
            num_outputs: 1,
            guidance_scale: 7.5,
            apply_watermark: false,
            high_noise_frac: 0.8,
            negative_prompt: "",
            prompt_strength: 0.8,
            num_inference_steps: 50
          }
        }
      );
    } catch (replicateError) {
      console.error('Replicate API error:', replicateError);
      return NextResponse.json({ error: 'Failed to generate emoji with Replicate' }, { status: 500 });
    }

    console.log('Replicate output:', output);

    if (!output || !Array.isArray(output) || output.length === 0) {
      console.error('Invalid output from Replicate:', output);
      return NextResponse.json({ error: 'Invalid output from Replicate' }, { status: 500 });
    }

    const image_url = output[0];

    // Download the image
    let imageResponse;
    try {
      imageResponse = await fetch(image_url);
    } catch (fetchError) {
      console.error('Error fetching generated image:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch generated image' }, { status: 500 });
    }

    if (!imageResponse.ok) {
      console.error('Failed to fetch image:', imageResponse.statusText);
      return NextResponse.json({ error: 'Failed to fetch generated image' }, { status: 500 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    // Generate a unique filename
    const filename = `${Date.now()}-${prompt.replace(/\s+/g, '-')}.png`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('emojis')
      .upload(filename, imageBuffer, {
        contentType: 'image/png'
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload image to storage' }, { status: 500 });
    }

    // Get the public URL of the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('emojis')
      .getPublicUrl(filename);

    const publicUrl = publicUrlData.publicUrl;

    console.log('Inserting emoji into database');

    // Insert the new emoji into the database
    const { data, error } = await supabase
      .from('emojis')
      .insert({
        image_url: publicUrl,
        prompt,
        creator_user_id: userId,
        likes_count: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to insert emoji into database' }, { status: 500 });
    }

    console.log('Emoji generated, uploaded, and inserted successfully');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error generating emoji:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
export const runtime = 'edge';
export const maxDuration = 300; // 5 minutes