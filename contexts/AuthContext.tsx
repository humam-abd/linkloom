"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import supabase from "@/supabase.config";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

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

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local session on mount
    const currentUser = supabase.auth.getSession();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  // useEffect(() => {
  //   supabase.auth.onAuthStateChange((event, session) => {
  //     if (event === "SIGNED_IN") {
  //       // User just verified email and is now logged in!
  //       console.log("User verified:", session.user);
  //       // Redirect to dashboard or home
  //     }
  //   });
  // }, [supabase]);

  const { mutate: signUp } = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      fetch("/api/sign-up", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }).then(async (res) => {
        res.json();
        setUser(await res.json());
        router.push("/dashboard");
      }),
  });

  const login = async (email: string, password: string) => {
    setLoading(true);
    const u = signUp({ email, password });
    setUser(u);
    setLoading(false);
  };
  console.log("user", user);
  const logout = async () => {
    supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
