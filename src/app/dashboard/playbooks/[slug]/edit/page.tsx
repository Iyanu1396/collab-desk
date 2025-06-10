"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Eye,
  Moon,
  Sun,
  FileText,
  Type,
  Clock,
  BookOpen,
  BarChart3,
  Target,
} from "lucide-react";
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
  const [darkMode, setDarkMode] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthQuery();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  useEffect(() => {
    loadPlaybook();
    // Load dark mode preference from localStorage
    const savedDarkMode = localStorage.getItem("playbook-editor-dark-mode");
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, [slug]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem("playbook-editor-dark-mode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

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
      const updateData: {
        title: string;
        description?: string;
        content: string;
        published?: boolean;
      } = {
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

  // Calculate content statistics
  const getContentStats = () => {
    const text = content.replace(/<[^>]*>/g, ""); // Remove HTML tags
    const words = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const paragraphs = content
      .split(/<\/p>|<br\s*\/?>/i)
      .filter((p) => p.trim().length > 0).length;
    const readingTime = Math.ceil(words.length / 200); // Average reading speed: 200 words per minute

    return {
      words: words.length,
      characters,
      charactersNoSpaces,
      paragraphs,
      readingTime,
    };
  };

  const stats = getContentStats();

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          darkMode
            ? "bg-gray-900"
            : "bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50"
        } relative overflow-hidden`}
      >
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>

        <div className="relative z-10">
          <div className="max-w-6xl mx-auto">
            <div
              className={`${
                darkMode ? "bg-gray-800/90" : "bg-white/90"
              } backdrop-blur-sm border-b ${
                darkMode ? "border-gray-700" : "border-gray-200"
              } px-6 py-4`}
            >
              <div className="animate-pulse">
                <div
                  className={`h-8 ${
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  } rounded w-48`}
                ></div>
              </div>
            </div>
            <div className="p-6">
              <div className="animate-pulse space-y-6">
                <div
                  className={`h-12 ${
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  } rounded`}
                ></div>
                <div
                  className={`h-32 ${
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  } rounded`}
                ></div>
                <div
                  className={`h-96 ${
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  } rounded`}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !playbook) {
    return (
      <div
        className={`min-h-screen ${
          darkMode
            ? "bg-gray-900"
            : "bg-gradient-to-br from-red-50 via-pink-50 to-rose-50"
        } flex items-center justify-center relative overflow-hidden`}
      >
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 -right-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center ${
            darkMode ? "bg-gray-800/95" : "bg-white/90"
          } backdrop-blur-lg p-12 rounded-3xl shadow-2xl max-w-md mx-4 border ${
            darkMode ? "border-gray-700" : "border-white/20"
          } relative z-10`}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <BookOpen className="w-10 h-10 text-red-600" />
          </div>
          <h1
            className={`text-2xl font-bold ${
              darkMode
                ? "text-white"
                : "bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
            } mb-3`}
          >
            {error === "Playbook not found"
              ? "Playbook Not Found"
              : error === "Unauthorized"
              ? "Unauthorized"
              : "Error"}
          </h1>
          <p
            className={`${
              darkMode ? "text-gray-300" : "text-gray-600"
            } mb-8 leading-relaxed`}
          >
            {error === "Playbook not found"
              ? "The playbook you are looking for does not exist or has been deleted."
              : error === "Unauthorized"
              ? "You do not have permission to edit this playbook."
              : "Something went wrong while loading the playbook."}
          </p>
          <Button
            onClick={() => router.push("/dashboard/playbooks")}
            className="flex items-center gap-2 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Playbooks
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? "bg-gray-900"
          : "bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50"
      } relative overflow-hidden`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="flex relative z-10">
        {/* Main Content */}
        <div className={`flex-1 ${showStats ? "lg:mr-80" : ""}`}>
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div
              className={`${
                darkMode ? "bg-gray-800/95" : "bg-white/95"
              } backdrop-blur-lg border-b ${
                darkMode ? "border-gray-700" : "border-white/30"
              } px-6 py-4 shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className={`flex items-center gap-2 ${
                      darkMode
                        ? "bg-gray-700/80 hover:bg-gray-700 text-gray-200 border-gray-600"
                        : "bg-white/90 hover:bg-white text-gray-700 border-0 shadow-lg hover:shadow-xl"
                    } transition-all duration-300`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <div>
                    <h1
                      className={`text-2xl font-bold ${
                        darkMode
                          ? "text-white"
                          : "bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 bg-clip-text text-transparent"
                      }`}
                    >
                      Edit Playbook
                    </h1>
                    <p
                      className={`${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Make changes to your playbook
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Dark Mode Toggle */}
                  <Button
                    variant="outline"
                    onClick={() => setDarkMode(!darkMode)}
                    className={`flex items-center gap-2 ${
                      darkMode
                        ? "bg-gray-700/80 hover:bg-gray-700 text-gray-200 border-gray-600"
                        : "bg-white/90 hover:bg-white border-0 shadow-lg hover:shadow-xl"
                    } transition-all duration-300`}
                  >
                    {darkMode ? (
                      <Sun className="w-4 h-4" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )}
                    {darkMode ? "Light" : "Dark"}
                  </Button>

                  {/* Stats Toggle */}
                  <Button
                    variant="outline"
                    onClick={() => setShowStats(!showStats)}
                    className={`flex items-center gap-2 ${
                      darkMode
                        ? "bg-gray-700/80 hover:bg-gray-700 text-gray-200 border-gray-600"
                        : "bg-white/90 hover:bg-white border-0 shadow-lg hover:shadow-xl"
                    } transition-all duration-300`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Stats
                  </Button>

                  {/* Preview Toggle */}
                  <Button
                    variant="outline"
                    onClick={() => setPreviewMode(!previewMode)}
                    className={`flex items-center gap-2 ${
                      darkMode
                        ? "bg-gray-700/80 hover:bg-gray-700 text-gray-200 border-gray-600"
                        : "bg-white/90 hover:bg-white border-0 shadow-lg hover:shadow-xl"
                    } transition-all duration-300`}
                  >
                    <Eye className="w-4 h-4" />
                    {previewMode ? "Edit" : "Preview"}
                  </Button>

                  {/* Save Button */}
                  <Button
                    variant="outline"
                    onClick={() => handleSave()}
                    disabled={saving}
                    className={`flex items-center gap-2 ${
                      darkMode
                        ? "bg-gray-700/80 hover:bg-gray-700 text-gray-200 border-gray-600"
                        : "bg-white/90 hover:bg-white border-0 shadow-lg hover:shadow-xl"
                    } transition-all duration-300`}
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save"}
                  </Button>

                  {/* Publish Button */}
                  <Button
                    onClick={() => handleSave(!playbook.published)}
                    disabled={saving}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Save className="w-4 h-4" />
                    {playbook.published ? "Unpublish" : "Publish"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {!previewMode ? (
                  <motion.div
                    key="edit"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Title */}
                    <Card
                      className={`${
                        darkMode
                          ? "bg-gray-800/90 border-gray-700"
                          : "bg-white/90 border-white/30"
                      } backdrop-blur-lg shadow-xl p-6`}
                    >
                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor="title"
                            className={`block text-sm font-medium ${
                              darkMode ? "text-gray-300" : "text-gray-700"
                            } mb-2`}
                          >
                            Title *
                          </label>
                          <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter playbook title..."
                            className={`w-full px-4 py-3 text-lg border ${
                              darkMode
                                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400"
                                : "bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-blue-500"
                            } rounded-lg focus:outline-none focus:ring-2 transition-all duration-300`}
                            maxLength={200}
                          />
                          <div
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            } mt-1`}
                          >
                            {title.length}/200 characters
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="description"
                            className={`block text-sm font-medium ${
                              darkMode ? "text-gray-300" : "text-gray-700"
                            } mb-2`}
                          >
                            Description
                          </label>
                          <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of your playbook..."
                            rows={3}
                            className={`w-full px-4 py-3 border ${
                              darkMode
                                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400"
                                : "bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-blue-500"
                            } rounded-lg focus:outline-none focus:ring-2 resize-none transition-all duration-300`}
                            maxLength={500}
                          />
                          <div
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            } mt-1`}
                          >
                            {description.length}/500 characters
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Editor */}
                    <Card
                      className={`${
                        darkMode
                          ? "bg-gray-800/90 border-gray-700"
                          : "bg-white/90 border-white/30"
                      } backdrop-blur-lg shadow-xl overflow-hidden`}
                    >
                      <div
                        className={`${
                          darkMode
                            ? "bg-gray-700/50 border-gray-600"
                            : "bg-gray-50/80 border-gray-200"
                        } border-b backdrop-blur-sm px-6 py-3`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3
                              className={`font-medium ${
                                darkMode ? "text-gray-200" : "text-gray-900"
                              }`}
                            >
                              Content
                            </h3>
                            <p
                              className={`text-sm ${
                                darkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              Edit your playbook content using the rich text
                              editor
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div
                              className={`flex items-center gap-2 ${
                                darkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              <Type className="w-4 h-4" />
                              <span>{stats.words} words</span>
                            </div>
                            <div
                              className={`flex items-center gap-2 ${
                                darkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              <Clock className="w-4 h-4" />
                              <span>{stats.readingTime} min read</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={darkMode ? "dark" : ""}>
                        <RichTextEditor
                          content={content}
                          onChange={setContent}
                          placeholder="Start writing your playbook content... Type '/' for commands"
                          className="border-0"
                        />
                      </div>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Preview */}
                    <Card
                      className={`${
                        darkMode
                          ? "bg-gray-800/90 border-gray-700"
                          : "bg-white/90 border-white/30"
                      } backdrop-blur-lg shadow-xl p-8`}
                    >
                      <div className="max-w-none">
                        {title && (
                          <h1
                            className={`text-4xl font-bold ${
                              darkMode
                                ? "text-white"
                                : "bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 bg-clip-text text-transparent"
                            } mb-4`}
                          >
                            {title}
                          </h1>
                        )}
                        {description && (
                          <p
                            className={`text-xl ${
                              darkMode ? "text-gray-300" : "text-gray-600"
                            } mb-8 leading-relaxed`}
                          >
                            {description}
                          </p>
                        )}
                        {content ? (
                          <div
                            className={`prose prose-lg max-w-none ${
                              darkMode
                                ? "prose-invert prose-headings:text-gray-100 prose-p:text-gray-300"
                                : "prose-headings:text-gray-900 prose-p:text-gray-700"
                            } prose-p:leading-relaxed prose-a:text-blue-600 prose-strong:text-gray-900 prose-code:bg-gray-100 prose-code:text-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded`}
                            dangerouslySetInnerHTML={{ __html: content }}
                          />
                        ) : (
                          <div className="text-center py-12">
                            <div
                              className={`w-20 h-20 ${
                                darkMode
                                  ? "bg-gray-700"
                                  : "bg-gradient-to-br from-gray-100 to-gray-200"
                              } rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}
                            >
                              <BookOpen
                                className={`w-10 h-10 ${
                                  darkMode ? "text-gray-400" : "text-gray-400"
                                }`}
                              />
                            </div>
                            <p
                              className={`${
                                darkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              No content yet. Switch to edit mode to start
                              writing.
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Statistics Sidebar */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className={`hidden lg:block fixed right-0 top-0 h-full w-80 ${
                darkMode
                  ? "bg-gray-800/95 border-gray-700"
                  : "bg-white/95 border-white/30"
              } backdrop-blur-lg border-l shadow-2xl`}
            >
              <div className="p-6 h-full overflow-y-auto">
                <div className="space-y-6">
                  {/* Sidebar Header */}
                  <div
                    className={`pb-4 border-b ${
                      darkMode ? "border-gray-700" : "border-gray-200/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`p-2 ${
                          darkMode
                            ? "bg-blue-900/50"
                            : "bg-gradient-to-br from-blue-50 to-indigo-50"
                        } rounded-lg shadow-sm`}
                      >
                        <BarChart3
                          className={`w-5 h-5 ${
                            darkMode ? "text-blue-400" : "text-blue-600"
                          }`}
                        />
                      </div>
                      <h2
                        className={`text-lg font-semibold ${
                          darkMode
                            ? "text-white"
                            : "bg-gradient-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent"
                        }`}
                      >
                        Content Statistics
                      </h2>
                    </div>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Real-time content analysis
                    </p>
                  </div>

                  {/* Statistics Cards */}
                  <div className="space-y-4">
                    {/* Word Count */}
                    <div
                      className={`${
                        darkMode
                          ? "bg-gray-700/50 border-gray-600"
                          : "bg-white/80 border-white/30"
                      } backdrop-blur-sm rounded-xl p-4 border shadow-lg`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 ${
                            darkMode
                              ? "bg-green-900/50"
                              : "bg-gradient-to-br from-green-50 to-emerald-50"
                          } rounded-lg`}
                        >
                          <Type
                            className={`w-4 h-4 ${
                              darkMode ? "text-green-400" : "text-green-600"
                            }`}
                          />
                        </div>
                        <div>
                          <p
                            className={`text-2xl font-bold ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {stats.words.toLocaleString()}
                          </p>
                          <p
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            Words
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Characters */}
                    <div
                      className={`${
                        darkMode
                          ? "bg-gray-700/50 border-gray-600"
                          : "bg-white/80 border-white/30"
                      } backdrop-blur-sm rounded-xl p-4 border shadow-lg`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 ${
                            darkMode
                              ? "bg-blue-900/50"
                              : "bg-gradient-to-br from-blue-50 to-indigo-50"
                          } rounded-lg`}
                        >
                          <FileText
                            className={`w-4 h-4 ${
                              darkMode ? "text-blue-400" : "text-blue-600"
                            }`}
                          />
                        </div>
                        <div>
                          <p
                            className={`text-2xl font-bold ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {stats.characters.toLocaleString()}
                          </p>
                          <p
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            Characters
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Reading Time */}
                    <div
                      className={`${
                        darkMode
                          ? "bg-gray-700/50 border-gray-600"
                          : "bg-white/80 border-white/30"
                      } backdrop-blur-sm rounded-xl p-4 border shadow-lg`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 ${
                            darkMode
                              ? "bg-purple-900/50"
                              : "bg-gradient-to-br from-purple-50 to-violet-50"
                          } rounded-lg`}
                        >
                          <Clock
                            className={`w-4 h-4 ${
                              darkMode ? "text-purple-400" : "text-purple-600"
                            }`}
                          />
                        </div>
                        <div>
                          <p
                            className={`text-2xl font-bold ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {stats.readingTime}
                          </p>
                          <p
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            Min read
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Paragraphs */}
                    <div
                      className={`${
                        darkMode
                          ? "bg-gray-700/50 border-gray-600"
                          : "bg-white/80 border-white/30"
                      } backdrop-blur-sm rounded-xl p-4 border shadow-lg`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 ${
                            darkMode
                              ? "bg-orange-900/50"
                              : "bg-gradient-to-br from-orange-50 to-amber-50"
                          } rounded-lg`}
                        >
                          <Target
                            className={`w-4 h-4 ${
                              darkMode ? "text-orange-400" : "text-orange-600"
                            }`}
                          />
                        </div>
                        <div>
                          <p
                            className={`text-2xl font-bold ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {stats.paragraphs}
                          </p>
                          <p
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            Paragraphs
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div
                    className={`pt-4 border-t ${
                      darkMode ? "border-gray-700" : "border-gray-200/50"
                    }`}
                  >
                    <h3
                      className={`text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      } mb-3`}
                    >
                      Writing Tips
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div
                        className={`p-3 ${
                          darkMode ? "bg-gray-700/30" : "bg-blue-50/80"
                        } rounded-lg border ${
                          darkMode ? "border-gray-600" : "border-blue-200"
                        }`}
                      >
                        <p
                          className={`${
                            darkMode ? "text-gray-300" : "text-blue-800"
                          } font-medium mb-1`}
                        >
                          Optimal Length
                        </p>
                        <p
                          className={`${
                            darkMode ? "text-gray-400" : "text-blue-600"
                          } text-xs`}
                        >
                          {stats.words < 300
                            ? "Consider adding more content for better engagement"
                            : stats.words > 2000
                            ? "Content is comprehensive"
                            : "Good length for readability"}
                        </p>
                      </div>

                      <div
                        className={`p-3 ${
                          darkMode ? "bg-gray-700/30" : "bg-green-50/80"
                        } rounded-lg border ${
                          darkMode ? "border-gray-600" : "border-green-200"
                        }`}
                      >
                        <p
                          className={`${
                            darkMode ? "text-gray-300" : "text-green-800"
                          } font-medium mb-1`}
                        >
                          Readability
                        </p>
                        <p
                          className={`${
                            darkMode ? "text-gray-400" : "text-green-600"
                          } text-xs`}
                        >
                          Average reading time: {stats.readingTime} minutes
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
