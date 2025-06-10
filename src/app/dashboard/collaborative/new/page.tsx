"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Users,
  Globe,
  EyeOff,
  Loader2,
  Lightbulb,
  UserPlus,
  Shield,
  Sparkles,
} from "lucide-react";
import Button from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import RichTextEditor from "@/components/editor/rich-text-editor";
import { collaboratorPlaybookService } from "@/lib/collaborator-playbooks";
import { useAuthQuery } from "@/hooks/use-auth-query";
import toast from "react-hot-toast";

export default function NewCollaborativePlaybookPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    content?: string;
  }>({});

  const { checkSession } = useAuthQuery();
  const router = useRouter();

  useEffect(() => {
    // Load dark mode preference from localStorage
    const savedDarkMode = localStorage.getItem(
      "collaborative-editor-dark-mode"
    );
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem(
      "collaborative-editor-dark-mode",
      JSON.stringify(darkMode)
    );
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

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

  const validateForm = () => {
    const newErrors: {
      title?: string;
      description?: string;
      content?: string;
    } = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    } else if (title.trim().length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    if (description && description.trim().length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    if (content.trim() && content.trim().length > 50000) {
      newErrors.content = "Content must be less than 50,000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (publishImmediately?: boolean) => {
    if (!checkSession()) return;
    if (!validateForm()) return;

    setIsCreating(true);

    try {
      const playbook =
        await collaboratorPlaybookService.createCollaboratorPlaybook({
          title: title.trim(),
          description: description.trim() || undefined,
          content: content.trim() || "",
          is_published: publishImmediately ?? isPublished,
        });

      toast.success("Collaborative playbook created successfully!");
      router.push(`/dashboard/collaborative/${playbook.slug}`);
    } catch (error) {
      console.error("Failed to create collaborative playbook:", error);
      toast.error("Failed to create collaborative playbook");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/collaborative");
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? "bg-gray-900"
          : "bg-gradient-to-br from-purple-50 via-green-50 to-teal-50"
      } relative overflow-hidden`}
    >
      {/* Animated background elements - Purple/Green theme for collaboration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
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
              } px-4 lg:px-6 py-4 shadow-lg`}
            >
              <div className="flex flex-col gap-4">
                {/* Top Row - Back button and title */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className={`flex items-center gap-2 ${
                      darkMode
                        ? "bg-gray-700/80 hover:bg-gray-700 text-gray-200 border-gray-600"
                        : "bg-white/90 hover:bg-white text-gray-700 border-0 shadow-lg hover:shadow-xl"
                    } transition-all duration-300`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <div className="flex-1">
                    <h1
                      className={`text-xl lg:text-2xl font-bold ${
                        darkMode
                          ? "text-white"
                          : "bg-gradient-to-r from-purple-900 via-green-900 to-teal-900 bg-clip-text text-transparent"
                      }`}
                    >
                      Create Collaborative Playbook
                    </h1>
                    <p
                      className={`${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      } text-sm mt-1`}
                    >
                      Build knowledge together with your team
                    </p>
                  </div>
                </div>

                {/* Bottom Row - Action buttons */}
                <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                  {/* View Controls */}
                  <div className="flex items-center gap-2">
                    {/* Stats Toggle */}
                    <Button
                      variant="outline"
                      onClick={() => setShowStats(!showStats)}
                      className={`lg:flex hidden items-center gap-2 text-xs lg:text-sm px-3 py-2 ${
                        darkMode
                          ? "bg-gray-700/80 hover:bg-gray-700 text-gray-200 border-gray-600"
                          : "bg-white/90 hover:bg-white border-0 shadow-lg hover:shadow-xl"
                      } transition-all duration-300`}
                    >
                      <BarChart3 className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span className="hidden md:inline">
                        {showStats ? "Hide Stats" : "Show Stats"}
                      </span>
                    </Button>

                    {/* Dark Mode Toggle */}
                    <Button
                      variant="outline"
                      onClick={() => setDarkMode(!darkMode)}
                      className={`flex items-center gap-2 text-xs lg:text-sm px-3 py-2 ${
                        darkMode
                          ? "bg-gray-700/80 hover:bg-gray-700 text-gray-200 border-gray-600"
                          : "bg-white/90 hover:bg-white border-0 shadow-lg hover:shadow-xl"
                      } transition-all duration-300`}
                    >
                      {darkMode ? (
                        <Sun className="w-3 h-3 lg:w-4 lg:h-4" />
                      ) : (
                        <Moon className="w-3 h-3 lg:w-4 lg:h-4" />
                      )}
                      <span className="hidden sm:inline">
                        {darkMode ? "Light" : "Dark"}
                      </span>
                    </Button>

                    {/* Preview Toggle */}
                    <Button
                      variant="outline"
                      onClick={() => setPreviewMode(!previewMode)}
                      className={`flex items-center gap-2 text-xs lg:text-sm px-3 py-2 ${
                        darkMode
                          ? "bg-gray-700/80 hover:bg-gray-700 text-gray-200 border-gray-600"
                          : "bg-white/90 hover:bg-white border-0 shadow-lg hover:shadow-xl"
                      } transition-all duration-300`}
                    >
                      <Eye className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span className="hidden sm:inline">
                        {previewMode ? "Edit" : "Preview"}
                      </span>
                    </Button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 ml-auto">
                    {/* Save Draft Button */}
                    <Button
                      variant="outline"
                      onClick={() => handleSubmit(false)}
                      disabled={isCreating || !title.trim()}
                      className={`flex items-center gap-2 text-xs lg:text-sm px-4 py-2 ${
                        darkMode
                          ? "bg-gray-700/80 hover:bg-gray-700 text-gray-200 border-gray-600"
                          : "bg-white/90 hover:bg-white border-0 shadow-lg hover:shadow-xl"
                      } transition-all duration-300`}
                    >
                      <Save className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span>{isCreating ? "Saving..." : "Save Draft"}</span>
                    </Button>

                    {/* Create & Publish Button */}
                    <Button
                      onClick={() => handleSubmit(true)}
                      disabled={isCreating || !title.trim()}
                      className="flex items-center gap-2 text-xs lg:text-sm px-4 py-2 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="w-3 h-3 lg:w-4 lg:h-4 animate-spin" />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 lg:w-4 lg:h-4" />
                          <span>Create & Publish</span>
                        </>
                      )}
                    </Button>
                  </div>
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
                    {/* Title & Description */}
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
                            onChange={(e) => {
                              setTitle(e.target.value);
                              if (errors.title) {
                                setErrors((prev) => ({
                                  ...prev,
                                  title: undefined,
                                }));
                              }
                            }}
                            placeholder="Enter collaborative playbook title..."
                            className={`w-full px-4 py-3 text-lg border ${
                              errors.title
                                ? "border-red-500"
                                : darkMode
                                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-400"
                                : "bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-purple-500"
                            } rounded-lg focus:outline-none focus:ring-2 transition-all duration-300`}
                            maxLength={100}
                          />
                          {errors.title && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.title}
                            </p>
                          )}
                          <div
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            } mt-1`}
                          >
                            {title.length}/100 characters
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="description"
                            className={`block text-sm font-medium ${
                              darkMode ? "text-gray-300" : "text-gray-700"
                            } mb-2`}
                          >
                            Description (Optional)
                          </label>
                          <textarea
                            id="description"
                            value={description}
                            onChange={(e) => {
                              setDescription(e.target.value);
                              if (errors.description) {
                                setErrors((prev) => ({
                                  ...prev,
                                  description: undefined,
                                }));
                              }
                            }}
                            placeholder="Brief description of your collaborative playbook..."
                            rows={3}
                            className={`w-full px-4 py-3 border ${
                              errors.description
                                ? "border-red-500"
                                : darkMode
                                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-400"
                                : "bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-purple-500"
                            } rounded-lg focus:outline-none focus:ring-2 resize-none transition-all duration-300`}
                            maxLength={500}
                          />
                          {errors.description && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.description}
                            </p>
                          )}
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

                    {/* Rich Text Editor */}
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
                              Create rich content that your team can collaborate
                              on
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
                          onChange={(newContent) => {
                            setContent(newContent);
                            if (errors.content) {
                              setErrors((prev) => ({
                                ...prev,
                                content: undefined,
                              }));
                            }
                          }}
                          placeholder="Start writing your collaborative playbook content... Type '/' for commands and embed CMS articles"
                          className="border-0 min-h-[400px]"
                        />
                      </div>
                      {errors.content && (
                        <div className="px-6 py-3 border-t border-red-200 bg-red-50">
                          <p className="text-sm text-red-600">
                            {errors.content}
                          </p>
                        </div>
                      )}
                    </Card>

                    {/* Collaboration Tips */}
                    <Card
                      className={`${
                        darkMode
                          ? "bg-gradient-to-r from-purple-900/20 to-green-900/20 border-purple-800/30"
                          : "bg-gradient-to-r from-purple-50/80 to-green-50/80 border-purple-200"
                      } backdrop-blur-sm border shadow-lg overflow-hidden`}
                    >
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className={`p-2 ${
                              darkMode ? "bg-purple-900/50" : "bg-purple-100"
                            } rounded-lg`}
                          >
                            <Lightbulb
                              className={`w-5 h-5 ${
                                darkMode ? "text-purple-400" : "text-purple-600"
                              }`}
                            />
                          </div>
                          <h4
                            className={`font-semibold ${
                              darkMode ? "text-purple-300" : "text-purple-900"
                            }`}
                          >
                            ✨ Collaborative Playbook Features
                          </h4>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-6 h-6 ${
                                  darkMode ? "bg-green-900/50" : "bg-green-100"
                                } rounded-full flex items-center justify-center mt-0.5`}
                              >
                                <UserPlus
                                  className={`w-3 h-3 ${
                                    darkMode
                                      ? "text-green-400"
                                      : "text-green-600"
                                  }`}
                                />
                              </div>
                              <div>
                                <h5
                                  className={`font-medium ${
                                    darkMode ? "text-gray-200" : "text-gray-900"
                                  } text-sm`}
                                >
                                  Team Collaboration
                                </h5>
                                <p
                                  className={`${
                                    darkMode ? "text-gray-400" : "text-gray-600"
                                  } text-xs`}
                                >
                                  Invite team members and collaborate in
                                  real-time
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div
                                className={`w-6 h-6 ${
                                  darkMode
                                    ? "bg-purple-900/50"
                                    : "bg-purple-100"
                                } rounded-full flex items-center justify-center mt-0.5`}
                              >
                                <Shield
                                  className={`w-3 h-3 ${
                                    darkMode
                                      ? "text-purple-400"
                                      : "text-purple-600"
                                  }`}
                                />
                              </div>
                              <div>
                                <h5
                                  className={`font-medium ${
                                    darkMode ? "text-gray-200" : "text-gray-900"
                                  } text-sm`}
                                >
                                  Access Control
                                </h5>
                                <p
                                  className={`${
                                    darkMode ? "text-gray-400" : "text-gray-600"
                                  } text-xs`}
                                >
                                  Manage who can view and edit your playbooks
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-6 h-6 ${
                                  darkMode ? "bg-teal-900/50" : "bg-teal-100"
                                } rounded-full flex items-center justify-center mt-0.5`}
                              >
                                <Eye
                                  className={`w-3 h-3 ${
                                    darkMode ? "text-teal-400" : "text-teal-600"
                                  }`}
                                />
                              </div>
                              <div>
                                <h5
                                  className={`font-medium ${
                                    darkMode ? "text-gray-200" : "text-gray-900"
                                  } text-sm`}
                                >
                                  Version Tracking
                                </h5>
                                <p
                                  className={`${
                                    darkMode ? "text-gray-400" : "text-gray-600"
                                  } text-xs`}
                                >
                                  Track changes and see who updated what
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div
                                className={`w-6 h-6 ${
                                  darkMode ? "bg-green-900/50" : "bg-green-100"
                                } rounded-full flex items-center justify-center mt-0.5`}
                              >
                                <Globe
                                  className={`w-3 h-3 ${
                                    darkMode
                                      ? "text-green-400"
                                      : "text-green-600"
                                  }`}
                                />
                              </div>
                              <div>
                                <h5
                                  className={`font-medium ${
                                    darkMode ? "text-gray-200" : "text-gray-900"
                                  } text-sm`}
                                >
                                  Public Sharing
                                </h5>
                                <p
                                  className={`${
                                    darkMode ? "text-gray-400" : "text-gray-600"
                                  } text-xs`}
                                >
                                  Publish and share with the world
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
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
                    {/* Preview Mode */}
                    <Card
                      className={`${
                        darkMode
                          ? "bg-gray-800/90 border-gray-700"
                          : "bg-white/90 border-white/30"
                      } backdrop-blur-lg shadow-xl p-8`}
                    >
                      <div className="mb-8">
                        <h1
                          className={`text-4xl font-bold mb-4 ${
                            darkMode
                              ? "text-white"
                              : "bg-gradient-to-r from-purple-900 to-green-900 bg-clip-text text-transparent"
                          }`}
                        >
                          {title || "Untitled Collaborative Playbook"}
                        </h1>
                        {description && (
                          <p
                            className={`text-lg ${
                              darkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            {description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-4 text-sm">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${
                              darkMode
                                ? "bg-purple-900/50 text-purple-300"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            <Users className="w-3 h-3" />
                            Collaborative
                          </span>
                          <span
                            className={`${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {stats.words} words • {stats.readingTime} min read
                          </span>
                        </div>
                      </div>

                      <div
                        className={`prose prose-lg max-w-none ${
                          darkMode
                            ? "prose-invert prose-headings:text-white prose-p:text-gray-300"
                            : "prose-headings:text-gray-900 prose-p:text-gray-800"
                        }`}
                        dangerouslySetInnerHTML={{
                          __html:
                            content ||
                            "<p class='text-gray-500 italic'>Start writing to see preview...</p>",
                        }}
                      />
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3 }}
              className="hidden lg:block w-80 bg-white/40 backdrop-blur-md border-l border-white/40 p-6 space-y-6 overflow-y-auto"
            >
              {/* Content Statistics */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Content Statistics
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/60 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-700">
                      {stats.words}
                    </div>
                    <div className="text-sm text-gray-600">Words</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-700">
                      {stats.readingTime}
                    </div>
                    <div className="text-sm text-gray-600">Min Read</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-4">
                    <div className="text-2xl font-bold text-teal-700">
                      {stats.characters}
                    </div>
                    <div className="text-sm text-gray-600">Characters</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-700">
                      {stats.paragraphs}
                    </div>
                    <div className="text-sm text-gray-600">Paragraphs</div>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Content Goals
                </h3>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Word Count</span>
                      <span className="text-gray-900">{stats.words}/1000</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-green-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            (stats.words / 1000) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Reading Time</span>
                      <span className="text-gray-900">
                        {stats.readingTime}/5 min
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            (stats.readingTime / 5) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Publishing Settings Preview */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  Settings
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-white/30">
                    <span className="text-gray-600">Visibility</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/30">
                    <span className="text-gray-600">Type</span>
                    <span className="text-purple-800 font-medium">
                      Collaborative
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Theme</span>
                    <span className="text-gray-900">
                      {darkMode ? "Dark" : "Light"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
