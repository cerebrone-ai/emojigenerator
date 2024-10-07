"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { createOrGetUserProfile } from "@/lib/user";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      createOrGetUserProfile(user.id)
        .then((profile) => {
          console.log("User profile:", profile);
        })
        .catch((error) => {
          console.error("Error creating/getting user profile:", error);
        });
    }
  }, [isLoaded, user]);

  return <>{children}</>;
}