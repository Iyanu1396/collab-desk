"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Eye,
  Moon,
  Sun,
  Palette,
  FileText,
  AlignLeft,
  BookOpen,
} from "lucide-react";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import RichTextEditor from "@/components/editor/rich-text-editor";
import { playbookService } from "@/lib/playbooks";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function NewPlaybookPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [darkModePreview, setDarkModePreview] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Populate fields from URL parameters (e.g., from CMS embed)
  useEffect(() => {
    const urlTitle = searchParams.get("title");
    const urlContent = searchParams.get("content");

    if (urlTitle) {
      setTitle(decodeURIComponent(urlTitle));
    }

    if (urlContent) {
      setContent(decodeURIComponent(urlContent));
    }
  }, [searchParams]);

  const handleSave = async (publish = false) => {
    if (!title.trim()) {
      toast.error("Please enter a title for your playbook");
      return;
    }

    try {
      setSaving(true);
      const playbook = await playbookService.createPlaybook({
        title: title.trim(),
        description: description.trim() || undefined,
        content,
        published: publish,
      });

      toast.success(
        `Playbook ${publish ? "published" : "saved"} successfully!`
      );
      router.push(`/dashboard/playbooks/${playbook.slug}`);
    } catch (error) {
      console.error("Failed to save playbook:", error);
      toast.error("Failed to save playbook");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (title || content || description) {
      if (
        confirm("You have unsaved changes. Are you sure you want to leave?")
      ) {
        router.back();
      }
    } else {
      router.back();
    }
  };

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
                  New Playbook
                </h1>
                <p className="text-gray-600">
                  Create a new collaborative playbook
                </p>
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
              {previewMode && (
                <Button
                  variant="outline"
                  onClick={() => setDarkModePreview(!darkModePreview)}
                  className="flex items-center gap-2"
                  title="Toggle Dark Mode Preview"
                >
                  {darkModePreview ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                  {darkModePreview ? "Light" : "Dark"}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => handleSave(false)}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </Button>
              <Button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Publish
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
              {/* Title and Description */}
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
                      className="w-full px-4 py-3 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 bg-white"
                      maxLength={500}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {description.length}/500 characters
                    </div>
                  </div>
                </div>
              </Card>

              {/* Rich Text Editor */}
              <Card className="overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
                  <h3 className="font-medium text-gray-900">Content</h3>
                  <p className="text-sm text-gray-600">
                    Write your playbook content using the rich text editor. Type{" "}
                    <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">
                      /
                    </kbd>{" "}
                    for commands and CMS integration.
                  </p>
                </div>
                <div className="p-0">
                  <RichTextEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Start writing your playbook content... Type '/' to access commands and embed CMS articles"
                    className="border-0 min-h-[400px]"
                  />
                </div>
              </Card>

              {/* Help Text */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • Use{" "}
                    <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">
                      /
                    </kbd>{" "}
                    to access slash commands
                  </li>
                  <li>
                    • Type{" "}
                    <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">
                      /cms
                    </kbd>{" "}
                    to search and embed Dev.to articles
                  </li>
                  <li>• Use headings to structure your content</li>
                  <li>
                    • Add code blocks, tables, and images to make your playbook
                    comprehensive
                  </li>
                  <li>
                    • Save as draft to work on it later, or publish when ready
                  </li>
                </ul>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Preview Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Preview Mode
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Mode:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      darkModePreview
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {darkModePreview ? "Dark" : "Light"}
                  </span>
                </div>
              </div>

              {/* Preview */}
              <Card
                className={`transition-all duration-300 ${
                  darkModePreview
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div
                  className={`p-8 min-h-[600px] ${
                    darkModePreview ? "bg-gray-900" : "bg-white"
                  }`}
                >
                  <div
                    className={`max-w-none transition-colors duration-300 ${
                      darkModePreview ? "text-gray-100" : "text-gray-900"
                    }`}
                  >
                    {title && (
                      <div className="mb-6">
                        <div
                          className={`flex items-center gap-2 mb-3 ${
                            darkModePreview ? "text-blue-400" : "text-blue-600"
                          }`}
                        >
                          <FileText className="w-5 h-5" />
                          <span className="text-sm font-semibold uppercase tracking-wide">
                            Title
                          </span>
                        </div>
                        <h1
                          className={`text-4xl font-bold ${
                            darkModePreview ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {title}
                        </h1>
                      </div>
                    )}
                    {description && (
                      <div
                        className={`mb-8 pb-6 border-b ${
                          darkModePreview
                            ? "border-gray-700"
                            : "border-gray-200"
                        }`}
                      >
                        <div
                          className={`flex items-center gap-2 mb-3 ${
                            darkModePreview
                              ? "text-green-400"
                              : "text-green-600"
                          }`}
                        >
                          <AlignLeft className="w-5 h-5" />
                          <span className="text-sm font-semibold uppercase tracking-wide">
                            Description
                          </span>
                        </div>
                        <p
                          className={`text-xl leading-relaxed ${
                            darkModePreview ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {description}
                        </p>
                      </div>
                    )}
                    {content ? (
                      <div className="mb-6">
                        <div
                          className={`flex items-center gap-2 mb-4 ${
                            darkModePreview
                              ? "text-purple-400"
                              : "text-purple-600"
                          }`}
                        >
                          <BookOpen className="w-5 h-5" />
                          <span className="text-sm font-semibold uppercase tracking-wide">
                            Content
                          </span>
                        </div>
                        <div
                          className={`prose prose-lg max-w-none transition-colors duration-300 ${
                            darkModePreview
                              ? "prose-invert prose-headings:text-white prose-p:text-gray-200 prose-strong:text-white prose-em:text-gray-300 prose-code:text-gray-200 prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-blockquote:text-gray-300 prose-li:text-gray-200 prose-a:text-blue-400"
                              : "prose-gray prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-em:text-gray-700 prose-code:text-gray-900 prose-pre:text-gray-800 prose-blockquote:text-gray-700 prose-li:text-gray-800"
                          }`}
                          dangerouslySetInnerHTML={{ __html: content }}
                        />
                      </div>
                    ) : (
                      <div
                        className={`text-center py-12 ${
                          darkModePreview ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        <div className="mb-4">
                          <Eye className="w-12 h-12 mx-auto opacity-50" />
                        </div>
                        <p className="text-lg">
                          No content yet. Switch to edit mode to start writing.
                        </p>
                        <p className="text-sm mt-2 opacity-75">
                          Your playbook will appear here as you write
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preview Footer */}
                <div
                  className={`px-8 py-4 border-t ${
                    darkModePreview
                      ? "bg-gray-800 border-gray-700"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between text-sm">
                    <div
                      className={`flex items-center gap-4 ${
                        darkModePreview ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      <span>📊 Preview Statistics</span>
                      <span>
                        Words: ~
                        {content
                          ? content.replace(/<[^>]*>/g, "").split(" ").length
                          : 0}
                      </span>
                      <span>
                        Characters: ~
                        {content ? content.replace(/<[^>]*>/g, "").length : 0}
                      </span>
                    </div>
                    <div
                      className={`text-xs ${
                        darkModePreview ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      Preview Mode •{" "}
                      {darkModePreview ? "Dark Theme" : "Light Theme"}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
