/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'bpjebfvvhziuzxfoorjc.supabase.co', // Your Supabase project's domain
      'replicate.delivery', // Keep this for any existing images
    ],
  },
}

export default nextConfig
