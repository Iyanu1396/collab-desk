"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit,
  Share,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  User,
} from "lucide-react";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { playbookService, type Playbook } from "@/lib/playbooks";
import { formatDate } from "@/lib/utils";
import { useAuthQuery } from "@/hooks/use-auth-query";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

export default function PlaybookViewPage() {
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthQuery();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  useEffect(() => {
    loadPlaybook();
  }, [slug]);

  const loadPlaybook = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await playbookService.getPlaybook(slug);

      if (!data) {
        setError("Playbook not found");
        return;
      }

      setPlaybook(data);
    } catch (error) {
      console.error("Failed to load playbook:", error);
      setError("Failed to load playbook");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/playbooks/${slug}/edit`);
  };

  const handleDelete = async () => {
    if (!playbook) return;

    if (!confirm(`Are you sure you want to delete "${playbook.title}"?`)) {
      return;
    }

    try {
      await playbookService.deletePlaybook(playbook.id);
      toast.success("Playbook deleted successfully");
      router.push("/dashboard/playbooks");
    } catch (error) {
      console.error("Failed to delete playbook:", error);
      toast.error("Failed to delete playbook");
    }
  };

  const handleTogglePublish = async () => {
    if (!playbook) return;

    try {
      if (playbook.published) {
        const updated = await playbookService.unpublishPlaybook(playbook.id);
        setPlaybook(updated);
        toast.success("Playbook unpublished");
      } else {
        const updated = await playbookService.publishPlaybook(playbook.id);
        setPlaybook(updated);
        toast.success("Playbook published");
      }
    } catch (error) {
      console.error("Failed to toggle publish:", error);
      toast.error("Failed to update playbook");
    }
  };

  const handleShare = async () => {
    if (!playbook) return;

    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleBack = () => {
    router.push("/dashboard/playbooks");
  };

  const isOwner = user && playbook && playbook.owner_id === user.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
          <div className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !playbook) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error === "Playbook not found" ? "Playbook Not Found" : "Error"}
          </h1>
          <p className="text-gray-600 mb-4">
            {error === "Playbook not found"
              ? "The playbook you are looking for does not exist or has been deleted."
              : "Something went wrong while loading the playbook."}
          </p>
          <Button onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Playbooks
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {playbook.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{playbook.owner?.username || "Unknown"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Updated {formatDate(playbook.updated_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {playbook.published ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      Published
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                      Draft
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share className="w-4 h-4" />
                Share
              </Button>

              {isOwner && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleTogglePublish}
                    className={`flex items-center gap-2 ${
                      playbook.published
                        ? "text-orange-600 hover:text-orange-700"
                        : "text-green-600 hover:text-green-700"
                    }`}
                  >
                    {playbook.published ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    {playbook.published ? "Unpublish" : "Publish"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleEdit}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleDelete}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-8">
              <div className="max-w-none">
                {playbook.description && (
                  <p className="text-xl text-gray-600 mb-8 leading-relaxed border-b border-gray-200 pb-6">
                    {playbook.description}
                  </p>
                )}

                {playbook.content ? (
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: playbook.content }}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>This playbook doesn't have any content yet.</p>
                    {isOwner && (
                      <Button
                        onClick={handleEdit}
                        className="mt-4 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Add Content
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
