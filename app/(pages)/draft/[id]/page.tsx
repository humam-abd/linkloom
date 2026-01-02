"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Trash2,
  ExternalLink,
  Share2,
  Sparkles,
  ArrowLeft,
  Loader2,
  Check,
  Upload,
  X,
} from "lucide-react";
import { Collection, CollectionInputType, LinkItemInputType } from "@/types";
// Import server actions
import {
  generateCollectionDescription,
  suggestLinkTitle,
} from "@/services/geminiService";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Input, Card, Modal } from "@/components/Shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function CollectionEditor() {
  const { user, loading: authLoading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [isPublic, setIsPublic] = useState<boolean | null>(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // New Item State
  const [newItemUrl, setNewItemUrl] = useState("");
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemImage, setNewItemImage] = useState("");
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");

  const queryClient = useQueryClient();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
  }, [id, user, authLoading, router]);

  const { data: existingCollection, isLoading } = useQuery<Collection>({
    queryKey: ["get-collections-by-id", id],
    queryFn: () =>
      fetch("/api/get-collections-by-id", {
        method: "POST",
        body: JSON.stringify({ id: id }),
        headers: { "Content-Type": "application/json" },
      }).then(async (res) => await res.json()),
    select: (data) => data[0],
  });

  useEffect(() => {
    if (existingCollection) {
      setCollection(existingCollection);
      setIsPublic(existingCollection.is_public);
    }
  }, [existingCollection]);

  const handleSave = async (updated: Collection) => {
    setCollection(updated);
  };

  const handleUpdate = async () => {
    updateCollection({
      id: collection!.id,
      name: collection!.name,
      description: collection!.description,
      is_public: isPublic,
      image: collection!.image,
    });
  };

  const handleShare = async () => {
    if (!collection) return;
    const url = `${window.location.origin}/share/${collection.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic size limit check (1MB)
      if (file.size > 1024 * 1024) {
        alert("File too large. Please use an image smaller than 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItemImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = async () => {
    if (!collection || !newItemUrl) return;

    // Auto-fill title if empty using Server Action
    let finalTitle = newItemTitle;
    if (!finalTitle) {
      finalTitle = await suggestLinkTitle(newItemUrl);
    }

    // Auto-fill image if empty
    let finalImage = newItemImage;
    if (!finalImage) {
      finalImage = `https://picsum.photos/seed/${Math.random()}/400/300`;
    }

    const newItem: LinkItemInputType = {
      url: newItemUrl,
      image: finalImage,
      description: "",
      collection_id: collection.id,
      user_id: user?.id,
      position: collection.items.length,
    };

    createLink(newItem);

    setIsAddItemOpen(false);
    setNewItemUrl("");
    setNewItemTitle("");
    setNewItemImage("");
    setImageMode("url");
  };

  const generateDescription = async () => {
    if (!collection) return;
    setIsAiLoading(true);
    // Call server action
    const desc = await generateCollectionDescription(
      collection.name,
      collection.items
    );
    await handleSave({ ...collection, description: desc });
    setIsAiLoading(false);
  };

  const deleteItem = async (itemId: string) => {
    if (!collection) return;
    deleteLink({ id: itemId });
  };

  const { mutate: updateCollection, data: updated } = useMutation({
    mutationFn: (body: CollectionInputType) =>
      fetch("/api/update-collection", {
        method: "PATCH",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }).then(async (res) => await res.json()),
    onSuccess: (data) => console.log(data),
  });

  useEffect(() => {
    if (collection) {
      updateCollection({
        ...collection,
        is_public: isPublic,
      });
    }
  }, [isPublic]);

  const { mutate: createLink } = useMutation({
    mutationFn: (body: LinkItemInputType) =>
      fetch("/api/create-link", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }).then(async (res) => await res.json()),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["get-collections-by-id", id],
      }),
  });

  const { mutate: deleteLink } = useMutation({
    mutationFn: (body: { id: string }) =>
      fetch("/api/delete-link", {
        method: "DELETE",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }).then(async (res) => await res.json()),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["get-collections-by-id", id],
      }),
  });

  const deleteCollection = async () => {
    if (!collection || !confirm("Are you sure? This cannot be undone.")) return;
    // await MockDb.deleteCollection(collection.id);
    router.push("/dashboard");
  };

  if (!collection)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

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
          <Button
            variant="ghost"
            onClick={deleteCollection}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 text-sm"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
          <Button
            variant="secondary"
            onClick={handleShare}
            className="min-w-[100px] transition-all text-sm"
          >
            {copySuccess ? (
              <Check className="w-4 h-4 mr-2 text-green-600" />
            ) : (
              <Share2 className="w-4 h-4 mr-2" />
            )}
            {copySuccess ? "Copied!" : "Share"}
          </Button>
          <a href={`/share/${collection.id}`} target="_blank" rel="noreferrer">
            <Button variant="secondary" className="text-sm">
              <ExternalLink className="w-4 h-4 mr-2" /> Preview
            </Button>
          </a>
          <Button onClick={() => setIsAddItemOpen(true)} className="text-sm">
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
              value={collection.name}
              onChange={(e) =>
                handleSave({ ...collection, name: e.target.value })
              }
              onBlur={handleUpdate}
              className="text-2xl sm:text-3xl font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-brand-500 focus:outline-none w-full transition-colors pb-1 placeholder:text-slate-300"
              placeholder="Enter title..."
            />
          </div>
          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-slate-700 flex justify-between">
              <span>Description</span>
              <button
                onClick={generateDescription}
                disabled={isAiLoading || collection.items.length === 0}
                className="text-xs text-brand-600 font-medium flex items-center hover:text-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {isAiLoading ? "Generating..." : "Auto-Generate with AI"}
              </button>
            </label>
            <textarea
              value={collection.description}
              onChange={(e) =>
                handleSave({ ...collection, description: e.target.value })
              }
              onBlur={handleUpdate}
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
                onClick={() => setIsPublic(!isPublic)}
                className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                  isPublic ? "bg-brand-500" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    isPublic ? "translate-x-4" : ""
                  }`}
                />
              </div>
            </div>
            <div className="text-xs text-slate-400 mt-6 pt-4 border-t border-slate-200">
              Created {new Date(collection.created_at).toLocaleDateString()}
            </div>
          </Card>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 mb-6">
          Items ({collection.items.length})
        </h3>
        {collection.items.length === 0 ? (
          <div
            onClick={() => setIsAddItemOpen(true)}
            className="border-2 border-dashed border-slate-200 rounded-xl p-8 sm:p-12 text-center cursor-pointer hover:border-brand-300 hover:bg-brand-50/50 transition-all bg-white/50"
          >
            <Plus className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-slate-500">Add your first link</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {collection.items.map((item) => (
              <Card
                key={item.id}
                className="flex flex-col sm:flex-row p-4 gap-4 items-start sm:items-center group"
              >
                <div className="w-full sm:w-24 h-48 sm:h-24 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.url}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <h4 className="font-medium text-slate-900 truncate">
                    {item.url}
                  </h4>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-brand-600 hover:underline truncate block"
                  >
                    {item.url}
                  </a>
                  {item.description && (
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-end sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteItem(item.id)}
                    className="text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        title="Add New Item"
      >
        <div className="space-y-4">
          <Input
            label="URL"
            placeholder="https://..."
            value={newItemUrl}
            onChange={(e) => setNewItemUrl(e.target.value)}
          />
          <Input
            label="Title (Optional)"
            placeholder="Leave empty for AI suggestion"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
          />

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Cover Image
            </label>
            <div className="flex p-1 bg-slate-100 rounded-lg mb-3 w-fit">
              <button
                onClick={() => {
                  setImageMode("url");
                  setNewItemImage("");
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  imageMode === "url"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Link URL
              </button>
              <button
                onClick={() => {
                  setImageMode("upload");
                  setNewItemImage("");
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  imageMode === "upload"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Upload File
              </button>
            </div>

            {imageMode === "url" ? (
              <Input
                placeholder="https://example.com/image.jpg"
                value={newItemImage}
                onChange={(e) => setNewItemImage(e.target.value)}
              />
            ) : (
              <div className="border-2 border-dashed border-slate-300 bg-white rounded-lg p-6 hover:bg-slate-50 transition-colors text-center relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <Upload className="w-8 h-8 text-slate-300" />
                  <span className="text-sm">Click to upload image</span>
                </div>
              </div>
            )}

            {newItemImage && (
              <div className="mt-3 relative rounded-lg overflow-hidden border border-slate-200 h-32 bg-slate-50">
                <img
                  src={newItemImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setNewItemImage("")}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full backdrop-blur-sm transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsAddItemOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addItem} disabled={!newItemUrl}>
              Add Item
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
