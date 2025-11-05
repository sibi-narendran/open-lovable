"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      } catch (error) {
        console.error("Error getting initial session:", error);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[AuthContext] Auth state changed:", event, session?.user?.email);
      
      setSession(session);
      setUser(session?.user ?? null);

      // Handle specific auth events
      if (event === "SIGNED_IN") {
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        setSession(null);
        setUser(null);
        setLoading(false);
      } else if (event === "TOKEN_REFRESHED") {
        setSession(session);
        setUser(session?.user ?? null);
      } else if (event === "USER_UPDATED") {
        setUser(session?.user ?? null);
      } else if (event === "INITIAL_SESSION") {
        // This event fires after initial session is loaded
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        throw error;
      }

      // State will be updated via onAuthStateChange listener
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

