"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/shadcn/dropdown-menu";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function UserIcon() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  if (!user) {
    return null;
  }

  // Get user initials from email
  const getInitials = (email: string) => {
    const parts = email.split("@");
    const username = parts[0];
    if (username.length >= 2) {
      return username.substring(0, 2).toUpperCase();
    }
    return username.substring(0, 1).toUpperCase();
  };

  const initials = user.email ? getInitials(user.email) : "U";
  const displayEmail = user.email || "User";

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full bg-black-alpha-6 hover:bg-black-alpha-8 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black-alpha-8"
          aria-label="User menu"
        >
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt={displayEmail}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium text-accent-black">
              {initials}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{displayEmail}</p>
            {user.user_metadata?.full_name && (
              <p className="text-xs text-black-alpha-48">
                {user.user_metadata.full_name}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

