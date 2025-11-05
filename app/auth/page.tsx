"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirect /auth to /auth/signin for backward compatibility
 */
export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth/signin");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-base">
      <div className="text-center">
        <p className="text-body-medium text-black-alpha-48">Redirecting...</p>
      </div>
    </div>
  );
}

