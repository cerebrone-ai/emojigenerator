"use client";

import { useEffect } from "react";
import { createOrGetUserProfile } from "@/lib/user";
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        createOrGetUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        router.push('/');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return <>{children}</>;
}