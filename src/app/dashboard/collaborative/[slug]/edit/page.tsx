"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Eye,
  Moon,
  Sun,
  Type,
  Clock,
  BookOpen,
  BarChart3,
  Users,
  Crown,
  Sparkles,
  Settings,
} from "lucide-react";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import RichTextEditor from "@/components/editor/rich-text-editor";
import {
  collaboratorPlaybookService,
  type CollaboratorPlaybook,
} from "@/lib/collaborator-playbooks";
import { useAuthQuery } from "@/hooks/use-auth-query";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";
import { useCollaborationPresence } from "@/hooks/use-collaboration-presence";
import PresenceIndicator from "@/components/collaboration/presence-indicator";
import CursorOverlay from "@/components/collaboration/cursor-overlay";

export default function EditCollaborativePlaybookPage() {
  const [playbook, setPlaybook] = useState<CollaboratorPlaybook | null>(null);
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
  const editingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const cursorThrottleRef = useRef<NodeJS.Timeout | null>(null);

  // Collaboration presence
  const {
    otherUsers,
    activeUsersCount,
    isConnected,
    updateEditingStatus,
    updateCursorPosition,
    editingUsers,
    viewingUsers,
  } = useCollaborationPresence({
    playbookId: playbook?.id || "",
    enabled: !!playbook?.id && !!user,
  });

  useEffect(() => {
    loadPlaybook();
    // Load dark mode preference from localStorage
    const savedDarkMode = localStorage.getItem(
      "collaborative-editor-dark-mode"
    );
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }

    // Cleanup function
    return () => {
      if (editingTimeoutRef.current) {
        clearTimeout(editingTimeoutRef.current);
      }
      if (cursorThrottleRef.current) {
        clearTimeout(cursorThrottleRef.current);
      }
    };
  }, [slug]);

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

  const loadPlaybook = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await collaboratorPlaybookService.getCollaboratorPlaybook(
        slug
      );

      if (!data) {
        setError("Playbook not found or access denied");
        return;
      }

      // Check if user has edit permissions (owner or collaborator)
      const isOwner = data.owner_id === user?.id;
      const isCollaborator = data.collaborators?.some(
        (collab) => collab.profile.user_id === user?.id
      );

      if (!isOwner && !isCollaborator) {
        setError("You don't have permission to edit this playbook");
        return;
      }

      setPlaybook(data);
      setTitle(data.title);
      setDescription(data.description || "");
      setContent(data.content);
    } catch (error) {
      console.error("Failed to load collaborative playbook:", error);
      setError("Failed to load playbook or access denied");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (publish?: boolean) => {
    if (!playbook) return;

    setSaving(true);
    try {
      const updateData: {
        title: string;
        description?: string;
        content: string;
        is_published?: boolean;
      } = {
        title: title.trim(),
        description: description.trim() || undefined,
        content: content.trim(),
      };

      if (publish !== undefined) {
        updateData.is_published = publish;
      }

      const updated =
        await collaboratorPlaybookService.updateCollaboratorPlaybook(
          playbook.id,
          updateData
        );

      setPlaybook(updated);
      toast.success(
        publish !== undefined
          ? `Playbook ${publish ? "published" : "unpublished"} successfully!`
          : "Playbook saved successfully!"
      );
    } catch (error) {
      console.error("Failed to update playbook:", error);
      toast.error("Failed to update playbook");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push(`/dashboard/collaborative/${slug}`);
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
  const isOwner = playbook?.owner_id === user?.id;

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          darkMode
            ? "bg-gray-900"
            : "bg-gradient-to-br from-purple-50 via-green-50 to-teal-50"
        } relative overflow-hidden`}
      >
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 -right-4 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
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
            {error === "Playbook not found or access denied"
              ? "Playbook Not Found"
              : error === "You don't have permission to edit this playbook"
              ? "Access Denied"
              : "Error"}
          </h1>
          <p
            className={`${
              darkMode ? "text-gray-300" : "text-gray-600"
            } mb-8 leading-relaxed`}
          >
            {error}
          </p>
          <Button
            onClick={() => router.push("/dashboard/collaborative")}
            className="flex items-center gap-2 mx-auto bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Collaborative Playbooks
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
          : "bg-gradient-to-br from-purple-50 via-green-50 to-teal-50"
      } relative overflow-hidden`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Sticky Presence Indicator - Only show when there are other users */}
      {otherUsers.length > 0 && (
        <PresenceIndicator
          otherUsers={otherUsers}
          activeUsersCount={activeUsersCount}
          isConnected={isConnected}
          editingUsers={editingUsers}
          viewingUsers={viewingUsers}
          sticky={true}
          playbookId={playbook?.id}
        />
      )}

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
                  <div className="flex-1">
                    <h1
                      className={`text-xl lg:text-2xl font-bold ${
                        darkMode
                          ? "text-white"
                          : "bg-gradient-to-r from-purple-900 via-green-900 to-teal-900 bg-clip-text text-transparent"
                      }`}
                    >
                      Edit Collaborative Playbook
                    </h1>
                    <p
                      className={`${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      } text-sm mt-1`}
                    >
                      Collaborate and build knowledge together
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
                  <div className="flex items-center gap-4 ml-auto">
                    {/* Presence Indicator */}
                    <PresenceIndicator
                      otherUsers={otherUsers}
                      activeUsersCount={activeUsersCount}
                      isConnected={isConnected}
                      editingUsers={editingUsers}
                      viewingUsers={viewingUsers}
                      className="hidden sm:flex"
                      playbookId={playbook?.id}
                    />

                    {/* Save Button */}
                    <Button
                      variant="outline"
                      onClick={() => handleSave()}
                      disabled={saving}
                      className={`flex items-center gap-2 text-xs lg:text-sm px-4 py-2 ${
                        darkMode
                          ? "bg-gray-700/80 hover:bg-gray-700 text-gray-200 border-gray-600"
                          : "bg-white/90 hover:bg-white border-0 shadow-lg hover:shadow-xl"
                      } transition-all duration-300`}
                    >
                      <Save className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span>{saving ? "Saving..." : "Save"}</span>
                    </Button>

                    {/* Publish Button - Only for owners */}
                    {isOwner && (
                      <Button
                        onClick={() => handleSave(!playbook.is_published)}
                        disabled={saving}
                        className="flex items-center gap-2 text-xs lg:text-sm px-4 py-2 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Sparkles className="w-3 h-3 lg:w-4 lg:h-4" />
                        <span>
                          {playbook.is_published ? "Unpublish" : "Publish"}
                        </span>
                      </Button>
                    )}
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
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter collaborative playbook title..."
                            className={`w-full px-4 py-3 text-lg border ${
                              darkMode
                                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-400"
                                : "bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-purple-500"
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
                            Description (Optional)
                          </label>
                          <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of your collaborative playbook..."
                            rows={3}
                            className={`w-full px-4 py-3 border ${
                              darkMode
                                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-400"
                                : "bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-purple-500"
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
                              Collaborate with your team on rich content
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
                      <div
                        ref={editorContainerRef}
                        className={`relative ${darkMode ? "dark" : ""}`}
                        onMouseMove={(e) => {
                          // Throttle cursor position updates to avoid spam
                          if (cursorThrottleRef.current) {
                            clearTimeout(cursorThrottleRef.current);
                          }

                          cursorThrottleRef.current = setTimeout(() => {
                            // Track cursor position for real-time collaboration
                            const rect =
                              editorContainerRef.current?.getBoundingClientRect();
                            if (rect) {
                              updateCursorPosition({
                                from: 0, // TipTap position would be better, but this is a basic implementation
                                to: 0,
                                coords: {
                                  x: e.clientX,
                                  y: e.clientY,
                                },
                              });
                            }
                          }, 100); // Throttle to 100ms
                        }}
                      >
                        <RichTextEditor
                          content={content}
                          onChange={(newContent) => {
                            setContent(newContent);
                            // Update editing status when content changes
                            updateEditingStatus(true);

                            // Set editing to false after 2 seconds of inactivity
                            if (editingTimeoutRef.current) {
                              clearTimeout(editingTimeoutRef.current);
                            }
                            editingTimeoutRef.current = setTimeout(() => {
                              updateEditingStatus(false);
                            }, 2000);
                          }}
                          placeholder="Write your collaborative playbook content... Type '/' for commands"
                          className="border-0 min-h-[400px]"
                        />

                        {/* Live Cursor Overlay */}
                        <CursorOverlay
                          users={otherUsers}
                          editorContainer={editorContainerRef.current}
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

        {/* Stats & Team Sidebar */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3 }}
              className="hidden lg:block w-80 bg-white/40 backdrop-blur-md border-l border-white/40 p-4 xl:p-6 space-y-4 xl:space-y-6 overflow-y-auto fixed right-0 top-0 bottom-0"
            >
              <div className="pt-24 space-y-4 xl:space-y-6">
                {/* Content Statistics */}
                <div className="space-y-3 xl:space-y-4">
                  <h3 className="text-base xl:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 xl:w-5 xl:h-5 text-purple-600" />
                    Content Statistics
                  </h3>

                  <div className="grid grid-cols-2 gap-2 xl:gap-4">
                    <div className="bg-white/60 rounded-lg p-3 xl:p-4">
                      <div className="text-lg xl:text-2xl font-bold text-purple-700">
                        {stats.words}
                      </div>
                      <div className="text-xs xl:text-sm text-gray-600">
                        Words
                      </div>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3 xl:p-4">
                      <div className="text-lg xl:text-2xl font-bold text-green-700">
                        {stats.readingTime}
                      </div>
                      <div className="text-xs xl:text-sm text-gray-600">
                        Min Read
                      </div>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3 xl:p-4">
                      <div className="text-lg xl:text-2xl font-bold text-teal-700">
                        {stats.characters}
                      </div>
                      <div className="text-xs xl:text-sm text-gray-600">
                        Characters
                      </div>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3 xl:p-4">
                      <div className="text-lg xl:text-2xl font-bold text-purple-700">
                        {stats.paragraphs}
                      </div>
                      <div className="text-xs xl:text-sm text-gray-600">
                        Paragraphs
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team */}
                <div className="space-y-3 xl:space-y-4">
                  <h3 className="text-base xl:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4 xl:w-5 xl:h-5 text-purple-600" />
                    Team Members ({(playbook?.collaborators?.length || 0) + 1})
                  </h3>

                  <div className="space-y-2 xl:space-y-3">
                    {/* Owner */}
                    <div className="flex items-center gap-3 p-3 xl:p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-xl border border-blue-200/50 shadow-lg">
                      <div className="relative">
                        {playbook?.owner_profile?.avatar_url ? (
                          <img
                            src={playbook.owner_profile.avatar_url}
                            alt={`${
                              playbook.owner_profile.username ||
                              playbook.owner_profile.email ||
                              "Owner"
                            }`}
                            className="w-8 h-8 xl:w-10 xl:h-10 rounded-full object-cover ring-2 xl:ring-4 ring-blue-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 xl:w-10 xl:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-2 xl:ring-4 ring-blue-200 flex-shrink-0">
                            {playbook?.owner_profile?.username ? (
                              <span className="text-white font-bold text-xs xl:text-sm">
                                {playbook.owner_profile.username
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            ) : playbook?.owner_profile?.email ? (
                              <span className="text-white font-bold text-xs xl:text-sm">
                                {playbook.owner_profile.email
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            ) : (
                              <Crown className="w-4 h-4 xl:w-5 xl:h-5 text-white" />
                            )}
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 xl:w-5 xl:h-5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full border border-white flex items-center justify-center shadow-lg">
                          <Crown className="w-2 h-2 xl:w-3 xl:h-3 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm xl:text-base truncate">
                          {isOwner ? (
                            <span>
                              {playbook?.owner_profile?.username ||
                                playbook?.owner_profile?.email ||
                                "You"}{" "}
                              <span className="text-blue-600 font-medium">
                                (you)
                              </span>
                            </span>
                          ) : (
                            playbook?.owner_profile?.username ||
                            playbook?.owner_profile?.email ||
                            "Owner"
                          )}
                        </p>
                        <p className="text-xs xl:text-sm text-blue-600 font-medium flex items-center gap-1">
                          <Crown className="w-2 h-2 xl:w-3 xl:h-3" />
                          Owner
                        </p>
                      </div>
                    </div>

                    {/* Collaborators */}
                    {playbook?.collaborators?.map((collab, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 xl:p-4 bg-gradient-to-r from-emerald-50/80 to-green-50/80 backdrop-blur-sm rounded-xl border border-emerald-200/50 shadow-lg"
                      >
                        {collab.profile.avatar_url ? (
                          <img
                            src={collab.profile.avatar_url}
                            alt={collab.profile.username}
                            className="w-8 h-8 xl:w-10 xl:h-10 rounded-full object-cover ring-2 xl:ring-4 ring-emerald-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 xl:w-10 xl:h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center ring-2 xl:ring-4 ring-emerald-200 flex-shrink-0">
                            <span className="text-white font-bold text-xs xl:text-sm">
                              {collab.profile.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm xl:text-base truncate">
                            {collab.profile.user_id === user?.id ? (
                              <span>
                                {collab.profile.username}{" "}
                                <span className="text-emerald-600 font-medium">
                                  (you)
                                </span>
                              </span>
                            ) : (
                              collab.profile.username
                            )}
                          </p>
                          <p className="text-xs xl:text-sm text-emerald-600 font-medium flex items-center gap-1">
                            <Users className="w-2 h-2 xl:w-3 xl:h-3" />
                            Collaborator
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Playbook Info */}
                <div className="space-y-3 xl:space-y-4">
                  <h3 className="text-base xl:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Settings className="w-4 h-4 xl:w-5 xl:h-5 text-blue-600" />
                    Playbook Info
                  </h3>

                  <div className="space-y-2 xl:space-y-3 text-xs xl:text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-white/30">
                      <span className="text-gray-600">Status</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          playbook?.is_published
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {playbook?.is_published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/30">
                      <span className="text-gray-600">Type</span>
                      <span className="text-purple-800 font-medium">
                        Collaborative
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/30">
                      <span className="text-gray-600">Created</span>
                      <span className="text-gray-900 text-xs truncate">
                        {formatDate(playbook?.created_at || "")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Updated</span>
                      <span className="text-gray-900 text-xs truncate">
                        {formatDate(playbook?.updated_at || "")}
                      </span>
                    </div>
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
