"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Eye } from "lucide-react";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import RichTextEditor from "@/components/editor/rich-text-editor";
import { playbookService, type Playbook } from "@/lib/playbooks";
import { useAuthQuery } from "@/hooks/use-auth-query";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

export default function EditPlaybookPage() {
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
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

      // Check if user owns this playbook
      if (!user || data.owner_id !== user.id) {
        setError("Unauthorized");
        return;
      }

      setPlaybook(data);
      setTitle(data.title);
      setDescription(data.description || "");
      setContent(data.content || "");
    } catch (error) {
      console.error("Failed to load playbook:", error);
      setError("Failed to load playbook");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (publish?: boolean) => {
    if (!playbook) return;

    if (!title.trim()) {
      toast.error("Please enter a title for your playbook");
      return;
    }

    try {
      setSaving(true);
      const updateData: any = {
        title: title.trim(),
        description: description.trim() || undefined,
        content,
      };

      if (publish !== undefined) {
        updateData.published = publish;
      }

      const updated = await playbookService.updatePlaybook(
        playbook.id,
        updateData
      );
      setPlaybook(updated);

      const action =
        publish !== undefined
          ? publish
            ? "published"
            : "unpublished"
          : "saved";

      toast.success(`Playbook ${action} successfully!`);

      // If slug changed, redirect to new URL
      if (updated.slug !== slug) {
        router.push(`/dashboard/playbooks/${updated.slug}`);
      }
    } catch (error) {
      console.error("Failed to save playbook:", error);
      toast.error("Failed to save playbook");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    const hasChanges =
      playbook &&
      (title !== playbook.title ||
        description !== (playbook.description || "") ||
        content !== (playbook.content || ""));

    if (hasChanges) {
      if (
        confirm("You have unsaved changes. Are you sure you want to leave?")
      ) {
        router.push(`/dashboard/playbooks/${slug}`);
      }
    } else {
      router.push(`/dashboard/playbooks/${slug}`);
    }
  };

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
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
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
            {error === "Playbook not found"
              ? "Playbook Not Found"
              : error === "Unauthorized"
              ? "Unauthorized"
              : "Error"}
          </h1>
          <p className="text-gray-600 mb-4">
            {error === "Playbook not found"
              ? "The playbook you are looking for does not exist or has been deleted."
              : error === "Unauthorized"
              ? "You do not have permission to edit this playbook."
              : "Something went wrong while loading the playbook."}
          </p>
          <Button
            onClick={() => router.push("/dashboard/playbooks")}
            className="flex items-center gap-2"
          >
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Edit Playbook
                </h1>
                <p className="text-gray-600">Make changes to your playbook</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {previewMode ? "Edit" : "Preview"}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSave()}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </Button>
              <Button
                onClick={() => handleSave(!playbook.published)}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {playbook.published ? "Unpublish" : "Publish"}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!previewMode ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Title */}
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Title *
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter playbook title..."
                      className="w-full px-4 py-3 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={200}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {title.length}/200 characters
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of your playbook..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      maxLength={500}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {description.length}/500 characters
                    </div>
                  </div>
                </div>
              </Card>

              {/* Editor */}
              <Card className="overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
                  <h3 className="font-medium text-gray-900">Content</h3>
                  <p className="text-sm text-gray-600">
                    Edit your playbook content using the rich text editor
                  </p>
                </div>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Start writing your playbook content... Type '/' for commands"
                  className="border-0"
                />
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Preview */}
              <Card className="p-8">
                <div className="max-w-none">
                  {title && (
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                      {title}
                    </h1>
                  )}
                  {description && (
                    <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                      {description}
                    </p>
                  )}
                  {content ? (
                    <div
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p>
                        No content yet. Switch to edit mode to start writing.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
