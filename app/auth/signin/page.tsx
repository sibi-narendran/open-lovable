"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

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
          emailRedirectTo: `${window.location.origin}/auth/callback`,
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
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-2xl font-bold text-accent-black">Appzap</h1>
          </Link>
          <h2 className="text-3xl font-semibold text-accent-black mb-2">
            {emailSent ? "Check your email" : "Sign in"}
          </h2>
          <p className="text-body-medium text-black-alpha-48">
            {emailSent
              ? "We've sent a magic link to your email address"
              : "Welcome back! Enter your email to sign in"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-20 p-8 shadow-lg border border-zinc-200">
          {emailSent ? (
            // Success state
            <div className="text-center">
              <div className="mb-6">
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
              <p className="text-body-medium text-accent-black mb-2">
                Magic link sent to
              </p>
              <p className="text-body-medium font-medium text-accent-black mb-6">
                {email}
              </p>
              <p className="text-sm text-black-alpha-48 mb-6">
                Click the link in the email to sign in. The link will expire in
                1 hour.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                  setError(null);
                }}
                className="w-full"
              >
                Send another email
              </Button>
            </div>
          ) : (
            // Email form
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-accent-black mb-2"
                >
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  disabled={loading}
                  className="w-full"
                  autoFocus
                  autoComplete="email"
                />
                {error && (
                  <p className="mt-2 text-sm text-red-500">{error}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="default"
                disabled={loading || !email.trim()}
                className="w-full"
              >
                {loading ? "Sending..." : "Send magic link"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-black-alpha-48">
                  Don't have an account?{" "}
                  <Link
                    href="/auth/signup"
                    className="text-accent-black hover:underline font-medium"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-black-alpha-48 hover:text-accent-black transition-colors"
          >
            ← Back to home
          </Link>
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

