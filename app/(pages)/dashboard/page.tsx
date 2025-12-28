"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Layout,
  ImageIcon,
  Share2,
  Check,
  Loader2,
  Edit2Icon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Card } from "@/components/Shared";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();

  const { data: collections } = useQuery({
    queryKey: ["get-collections", user],
    queryFn: () =>
      fetch("/api/get-collections", {
        method: "POST",
        body: JSON.stringify({ userId: user?.id }),
        headers: {
          "Content-Type": "application/json",
        },
      }).then(async (res) => await res.json()),
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
  }, [user, authLoading, router]);

  const handleCreate = async () => {
    if (!user) return;

    router.push(`/draft/new`);
  };

  const handleShare = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/share/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  if (authLoading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-brand-500" />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          My Collections
        </h1>
        <Button onClick={handleCreate} className="gap-2 text-sm sm:text-base">
          <Plus className="w-4 h-4" />{" "}
          <span className="hidden xs:inline">New Collection</span>
          <span className="xs:hidden">New</span>
        </Button>
      </div>

      {collections?.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
          <Layout className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">
            No collections yet
          </h3>
          <p className="text-slate-500 mb-6 px-4">
            Create your first collection to start sharing.
          </p>
          <Button variant="secondary" onClick={handleCreate}>
            Create Now
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections?.map((col) => (
            <Card
              key={col.id}
              onClick={() => router.push(`/share/${col.id}`)}
              className="group h-64 flex flex-col relative transition-all hover:ring-2 hover:ring-brand-500/20"
            >
              <div className="h-32 bg-slate-100 flex items-center justify-center overflow-hidden relative">
                {col?.items?.length > 0 ? (
                  <div className="grid grid-cols-2 w-full h-full">
                    {col?.items?.slice(0, 4).map((item, idx) => (
                      <img
                        key={idx}
                        src={item.image}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    ))}
                  </div>
                ) : (
                  <ImageIcon className="text-slate-300 w-8 h-8" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-semibold text-lg text-slate-900 mb-1 truncate">
                  {col.name}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2">
                  {col.description || "No description"}
                </p>
                <div className="mt-auto pt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>{col?.items?.length} items</span>
                  <div className="flex gap-3 items-center">
                    <span>{new Date(col.created_at).toLocaleDateString()}</span>
                    <button
                      onClick={(e) => handleShare(e, col.id)}
                      className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500 z-10"
                      title="Copy Link"
                    >
                      {copiedId === col.id ? (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/draft/${col.id}`);
                      }}
                      className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500 z-10"
                      title="Copy Link"
                    >
                      <Edit2Icon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
