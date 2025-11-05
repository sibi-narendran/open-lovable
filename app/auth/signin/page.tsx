"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { getAuthCallbackUrl } from "@/lib/utils/url";

function SignInPageContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for error from callback route
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      const decodedError = decodeURIComponent(errorParam);
      setError(decodedError);
      toast.error(decodedError);
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: getAuthCallbackUrl(),
        },
      });

      if (signInError) {
        throw signInError;
      }

      // Success - email sent
      setEmailSent(true);
      toast.success("Magic link sent! Check your email.");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to send magic link. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Sign in error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-base px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="bg-white rounded-20 py-150 px-50 shadow-lg border border-zinc-200 relative">
          {/* Back Arrow - positioned inside the card */}
          <div className="absolute top-15 left-10">
            <Link 
              href="/" 
              className="flex items-center justify-center w-25 h-25 bg-gray-50 hover:bg-gray-100 rounded-full border border-gray-200 transition-all duration-200 hover:shadow-sm group"
            >
              <svg
                className="w-25 h-25 text-gray-600 group-hover:text-gray-900 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
          </div>
          {emailSent ? (
            // Success state
            <div className="text-center">
              <div className="mb-16">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-body-medium text-accent-black mb-8">
                Magic link sent to
              </p>
              <p className="text-body-medium font-medium text-accent-black mb-12">
                {email}
              </p>
              <p className="text-sm text-black-alpha-48 mb-16">
                Click the link in the email to sign in to your account. The link will expire in
                1 hour.
              </p>
            </div>
          ) : (
            // Email form
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Logo */}
              <div className="text-center pt-12 mb-12">
                <h1 className="text-4xl font-bold">
                  <span className="text-gray-900">Appzap</span>
                  <span className="text-orange-500">.co</span>
                </h1>
              </div>

              {/* Heading */}
              <div className="text-center mb-[150px]">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  sign in to your account
                </h2>
                <p className="text-base text-gray-600">
                </p>
              </div>

              {/* Email Input */}
              <div className="space-y-10 mt-[150px]">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  disabled={loading}
                  className="w-full h-20 text-base px-5 py-25"
                  autoFocus
                  autoComplete="email"
                />
                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
              </div>

              {/* Button */}
              <Button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full h-45 bg-[#FFE5CC] hover:bg-[#FFD9B3] text-gray-900 font-medium text-base rounded-lg"
              >
                {loading ? "Sending..." : "Sign In"}
              </Button>

              {/* Sign up link */}
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    href="/auth/signup"
                    className="text-gray-900 hover:underline font-medium"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background-base">
        <div className="text-center">
          <p className="text-body-medium text-black-alpha-48">Loading...</p>
        </div>
      </div>
    }>
      <SignInPageContent />
    </Suspense>
  );
}

