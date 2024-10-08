import { NextResponse } from 'next/server';
import Replicate from "replicate";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Remove the deprecated config export if it exists
// export const config = { ... }

// Add this line to specify the runtime
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { prompt, userId } = await req.json();
    console.log('Received request:', { prompt, userId });

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    console.log('Calling Replicate API...');
    const output = await replicate.run(
      "fofr/sdxl-emoji:dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e",
      {
        input: {
          width: 1024,
          height: 1024,
          prompt: prompt,
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
    console.log('Replicate API response:', output);

    if (Array.isArray(output) && output.length > 0) {
      const replicateImageUrl = output[0];

      // Download image from Replicate
      const imageResponse = await fetch(replicateImageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();

      // Upload image to Supabase Storage
      const fileName = `${Date.now()}-${prompt.replace(/\s+/g, '-')}.png`;
      const { error: uploadError } = await supabase.storage
        .from('emojis')
        .upload(fileName, imageBuffer, {
          contentType: 'image/png'
        });

      if (uploadError) throw uploadError;

      // Get public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('emojis')
        .getPublicUrl(fileName);

      // Save to Supabase database
      const { data, error } = await supabase
        .from('emojis')
        .insert([
          { image_url: publicUrl, prompt: prompt, creator_user_id: userId }
        ])
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json(data);
    } else {
      throw new Error('No image generated');
    }
  } catch (error) {
    console.error('Detailed error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to generate emoji', details: errorMessage }, { status: 500 });
  }
}