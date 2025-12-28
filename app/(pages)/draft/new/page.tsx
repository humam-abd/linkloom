"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Sparkles, ArrowLeft } from "lucide-react";
import { Collection } from "@/types";
import { generateCollectionDescription } from "@/services/geminiService";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Card } from "@/components/Shared";
import { useMutation } from "@tanstack/react-query";

export default function NewCollection() {
  const router = useRouter();

  const [requiredFields, setRequiredFields] = useState<{
    name: string;
    description: string;
    is_public: boolean;
  }>();

  const [isAiLoading, setIsAiLoading] = useState(false);

  const { user } = useAuth();

  const { mutate: createCollection } = useMutation({
    mutationFn: (body: Omit<Collection, "id">) =>
      fetch("/api/create-collection", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }).then(async (res) => await res.json()),
    onSuccess: (data) => router.push(`/draft/${data.id}`),
  });

  const handleSave = async () => {
    if (requiredFields?.name && requiredFields?.description) {
      createCollection({ ...requiredFields, user_id: user?.id });
    }
  };

  const generateDescription = async () => {
    if (!requiredFields) return;
    setIsAiLoading(true);
    // Call server action
    const desc = await generateCollectionDescription(requiredFields.name, []);
    await setRequiredFields({ ...requiredFields, description: desc });
    setIsAiLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Actions */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="text-slate-500 hover:text-slate-800 flex items-center gap-2 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-end">
          <Button disabled className="text-sm">
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </Button>
        </div>
      </div>

      {/* Editor Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Collection Title
            </label>
            <input
              onChange={(e) =>
                setRequiredFields({ ...requiredFields, name: e.target.value })
              }
              onBlur={handleSave}
              className="text-2xl sm:text-3xl font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-brand-500 focus:outline-none w-full transition-colors pb-1 placeholder:text-slate-300"
              placeholder="Enter title..."
            />
          </div>
          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-slate-700 flex justify-between">
              <span>Description</span>
              <button
                onClick={generateDescription}
                disabled={isAiLoading}
                className="text-xs text-brand-600 font-medium flex items-center hover:text-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {isAiLoading ? "Generating..." : "Auto-Generate with AI"}
              </button>
            </label>
            <textarea
              onChange={(e) =>
                setRequiredFields({
                  ...requiredFields,
                  description: e.target.value,
                })
              }
              onBlur={handleSave}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none h-24 resize-none text-slate-600 bg-white"
              placeholder="What is this collection about?"
            />
          </div>
        </div>

        {/* Collection Settings / Stats */}
        <div className="md:col-span-1">
          <Card className="p-5 bg-white border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-4">Settings</h4>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-600">Public Access</span>
              <div
                onClick={() =>
                  setRequiredFields({
                    ...requiredFields,
                    is_public: !requiredFields.is_public,
                  })
                }
                className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                  requiredFields?.is_public ? "bg-brand-500" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    requiredFields?.is_public ? "translate-x-4" : ""
                  }`}
                />
              </div>
            </div>

            <div className="text-xs text-slate-400 mt-6 pt-4 border-t border-slate-200">
              Created {new Date().toLocaleDateString()}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
