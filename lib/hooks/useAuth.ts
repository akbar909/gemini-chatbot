"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      
      if (result?.error) {
        setError(result.error);
        return false;
      }
      
      router.push("/chat");
      return true;
    } catch (err) {
      setError("An unexpected error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || "Registration failed");
        return false;
      }
      
      // Auto login after successful registration
      return login(email, password);
    } catch (err) {
      setError("An unexpected error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return {
    user: session?.user,
    isAuthenticated: !!session?.user,
    isLoading: status === "loading" || isLoading,
    error,
    login,
    register,
    logout,
  };
}