"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ExternalLink, Loader2 } from "lucide-react";
import { Collection } from "@/types";
import { Button } from "@/components/Shared";
import { useQuery } from "@tanstack/react-query";

export default function PublicView() {
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);

  const { data } = useQuery({
    queryKey: ["get-collections-by-id", id],
    queryFn: () =>
      fetch("/api/get-collections-by-id", {
        method: "POST",
        body: JSON.stringify({ id: id }),
        headers: { "Content-Type": "application/json" },
      }).then(async (res) => await res.json()),
  });

  console.log(data);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-slate-400" />
      </div>
    );
  if (!collection || !collection.isPublic)
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Collection Not Found
        </h1>
        <p className="text-slate-500 mb-6">
          This collection may be private or deleted.
        </p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Public Header */}
      <header className="bg-white border-b border-slate-200 py-12 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight break-words">
            {collection.title}
          </h1>
          {collection.description && (
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {collection.description}
            </p>
          )}
          <div className="flex items-center justify-center gap-2 pt-4">
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
              {collection.items.length} Links
            </span>
            <span className="text-slate-300">•</span>
            <Link
              href="/"
              className="text-brand-600 hover:underline text-sm font-medium"
            >
              Curated on LinkLoom
            </Link>
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collection.items.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100"
            >
              <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                  <ExternalLink className="w-4 h-4 text-slate-700" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-brand-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 font-mono truncate mb-3">
                  {new URL(item.url).hostname.replace("www.", "")}
                </p>
                {item.description && (
                  <p className="text-sm text-slate-500 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      </main>

      <footer className="py-8 text-center text-slate-400 text-sm">
        <p>Built with LinkLoom</p>
      </footer>
    </div>
  );
}
