"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { SupabaseAuthResponse, User } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import supabaseClient from "@/lib/supabase/client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [user, setUser] = useState(null);

  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: () =>
      fetch("/api/session", {
        method: "GET",
      }).then(async (res) => {
        const sessionData = await res.json();
        return sessionData;
      }),
  });

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
      router.push("/dashboard");
    }
  }, [session]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user as User);
      } else {
        setUser(null);
      }
      queryClient.invalidateQueries({ queryKey: ["session"] });
    });

    return () => subscription.unsubscribe();
  }, [supabaseClient, queryClient]);

  const {
    mutate: signUp,
    isPending: isSignUpPending,
    data: userData,
  } = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      fetch("/api/sign-up", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }).then(async (res) => {
        const userData = await res.json();
        return userData as SupabaseAuthResponse;
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });

  useEffect(() => {
    if (userData) {
      setUser(userData?.user);
    }
  }, [userData]);

  const login = async (email: string, password: string) => {
    signUp({ email, password });
  };

  const logout = async () => {
    supabaseClient.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: isSessionLoading || isSignUpPending,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
