"use client";

import React from "react";
import Link from "next/link";
import { Layout, Sparkles, Share2 } from "lucide-react";
import { Button, Card } from "@/components/Shared";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const { data } = useQuery({
    queryKey: ["get-collections"],
    queryFn: () =>
      fetch("/api/get-collections", {
        method: "GET",
        body: JSON.stringify({ userId: user?.id }),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json()),
  });

  console.log(data);

  if (loading) return null; // Or a loading spinner

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] justify-center items-center text-center px-4 py-12">
      <div className="space-y-6 max-w-2xl animate-in slide-in-from-bottom-5 duration-700">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-slate-900">
          Curate your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-indigo-600">
            Digital World
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed px-4">
          Create beautiful, shareable collections of links. Organize your
          reading lists, project resources, or inspiration boards in seconds.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 w-full sm:w-auto px-6">
          <Link href="/login" className="w-full sm:w-auto">
            <Button className="h-12 px-8 text-lg w-full sm:w-auto">
              Get Started
            </Button>
          </Link>
          <Button
            variant="secondary"
            className="h-12 px-8 text-lg w-full sm:w-auto"
            onClick={() => window.open("https://github.com", "_blank")}
          >
            Github
          </Button>
        </div>
      </div>

      <div className="mt-12 sm:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl w-full px-4">
        {[
          {
            title: "Collect",
            icon: Layout,
            desc: "Save links from anywhere with rich previews.",
          },
          {
            title: "Organize",
            icon: Sparkles,
            desc: "AI-powered tools to sort and describe items.",
          },
          {
            title: "Share",
            icon: Share2,
            desc: "One link to share your entire collection.",
          },
        ].map((feature, i) => (
          <Card
            key={i}
            className="p-6 text-left hover:shadow-lg transition-all duration-300"
          >
            <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 mb-4">
              <feature.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-slate-500 text-sm">{feature.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
