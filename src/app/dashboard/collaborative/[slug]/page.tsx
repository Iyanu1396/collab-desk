"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Edit,
  Share,
  Trash2,
  EyeOff,
  Calendar,
  Clock,
  BookOpen,
  ExternalLink,
  Heart,
  Bookmark,
  MoreVertical,
  Globe,
  X,
  AlertTriangle,
  Users,
  Crown,
  UserPlus,
  UserMinus,
  Maximize,
  Minimize,
} from "lucide-react";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  collaboratorPlaybookService,
  type CollaboratorPlaybook,
  type Profile,
} from "@/lib/collaborator-playbooks";
import { formatDate } from "@/lib/utils";
import { useAuthQuery } from "@/hooks/use-auth-query";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

export default function CollaborativePlaybookPage() {
  const [playbook, setPlaybook] = useState<CollaboratorPlaybook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddCollaboratorModal, setShowAddCollaboratorModal] =
    useState(false);
  const [showRemoveCollaboratorModal, setShowRemoveCollaboratorModal] =
    useState<{
      show: boolean;
      collaborator: Profile | null;
    }>({ show: false, collaborator: null });
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Add Collaborator Modal State
  const [email, setEmail] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

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
      const data = await collaboratorPlaybookService.getCollaboratorPlaybook(
        slug
      );

      if (!data) {
        setError("Playbook not found or access denied");
        return;
      }

      setPlaybook(data);
    } catch (error) {
      console.error("Failed to load collaborative playbook:", error);
      setError("Failed to load playbook or access denied");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/collaborative/${slug}/edit`);
  };

  const handleDeleteClick = () => {
    setShowDropdown(false);
    setShowDeleteModal(true);
    setDeleteConfirmText("");
  };

  const handleDeleteConfirm = async () => {
    if (!playbook || deleteConfirmText.toLowerCase() !== "delete") return;

    try {
      await collaboratorPlaybookService.deleteCollaboratorPlaybook(playbook.id);
      toast.success("Collaborative playbook deleted successfully");
      router.push("/dashboard/collaborative");
    } catch (error) {
      console.error("Failed to delete playbook:", error);
      toast.error("Failed to delete playbook");
    }
  };

  const handleTogglePublish = async () => {
    if (!playbook) return;

    try {
      const updated = await collaboratorPlaybookService.togglePublish(
        playbook.id
      );
      setPlaybook(updated);
      toast.success(
        `Playbook ${
          updated.is_published ? "published" : "unpublished"
        } successfully`
      );
    } catch (error) {
      console.error("Failed to toggle publish:", error);
      toast.error("Failed to update playbook");
    }
  };

  const handleShare = async () => {
    if (!playbook) return;

    const url = playbook.is_published
      ? `${window.location.origin}/playbook/${playbook.slug}`
      : window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
  };

  const handleBack = () => {
    router.push("/dashboard/collaborative");
  };

  const handleSearchCollaborators = async () => {
    if (!email.trim()) return;

    // Check if user is trying to add themselves
    if (email.toLowerCase() === user?.email?.toLowerCase()) {
      toast.error(
        "You cannot add yourself as a collaborator - you are already the owner!"
      );
      return;
    }

    setIsSearching(true);
    try {
      const results = await collaboratorPlaybookService.searchProfiles(email);

      // Check if no users found at all
      if (results.length === 0) {
        toast.error("User not found with this email address");
        setSearchResults([]);
        return;
      }

      // Filter out current user and existing collaborators
      const filteredResults = results.filter((profile) => {
        const isCurrentUser = profile.user_id === user?.id;
        const isExistingCollaborator = playbook?.collaborators?.some(
          (collab) => collab.profile.user_id === profile.user_id
        );
        return !isCurrentUser && !isExistingCollaborator;
      });

      if (filteredResults.length === 0 && results.length > 0) {
        toast.error("This user is already a collaborator or is the owner");
        setSearchResults([]);
      } else {
        setSearchResults(filteredResults);
      }
    } catch {
      toast.error("Failed to search users");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = (user: Profile) => {
    setSelectedUser(user);
  };

  const handleAddCollaborator = async () => {
    if (!selectedUser || !playbook) return;

    setIsAdding(true);
    try {
      await collaboratorPlaybookService.addCollaborator(
        playbook.id,
        selectedUser.user_id
      );
      toast.success("Collaborator added successfully!");
      setShowAddCollaboratorModal(false);
      setEmail("");
      setSearchResults([]);
      setSelectedUser(null);
      loadPlaybook(); // Refresh to show new collaborator
    } catch (error: unknown) {
      console.error("Failed to add collaborator:", error);

      // Handle specific error messages
      const errorMessage = error instanceof Error ? error.message : "";
      if (errorMessage.includes("cannot add yourself")) {
        toast.error(
          "You cannot add yourself as a collaborator - you are already the owner!"
        );
      } else if (errorMessage.includes("User not found in profiles")) {
        toast.error("User not found in the system");
      } else if (errorMessage.includes("already a collaborator")) {
        toast.error("This user is already a collaborator");
      } else {
        toast.error("Failed to add collaborator");
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveCollaborator = async () => {
    if (!showRemoveCollaboratorModal.collaborator || !playbook) return;

    try {
      await collaboratorPlaybookService.removeCollaborator(
        playbook.id,
        showRemoveCollaboratorModal.collaborator.user_id
      );
      toast.success("Collaborator removed successfully!");
      setShowRemoveCollaboratorModal({ show: false, collaborator: null });
      loadPlaybook(); // Refresh to hide removed collaborator
    } catch (error) {
      console.error("Failed to remove collaborator:", error);
      toast.error("Failed to remove collaborator");
    }
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(
      isBookmarked ? "Removed from bookmarks" : "Added to bookmarks"
    );
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? "Removed like" : "Liked!");
  };

  const isOwner = user && playbook && playbook.owner_id === user.id;

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 via-blue-50 to-cyan-50 relative overflow-hidden">
        {/* Enhanced Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
          <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-white/20 rounded-full animate-float`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            ></div>
          ))}
        </div>

        <div className="flex relative z-10">
          <div className="flex-1">
            <div className="max-w-6xl mx-auto p-6 lg:p-8">
              <div className="space-y-8">
                {/* Enhanced Header Loading */}
                <div className="space-y-6">
                  <motion.div
                    animate={{
                      opacity: [0.5, 1, 0.5],
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="h-12 bg-gradient-to-r from-white/40 via-white/60 to-white/40 backdrop-blur-sm rounded-2xl w-48 shadow-lg"
                  ></motion.div>
                  <motion.div
                    animate={{
                      opacity: [0.6, 1, 0.6],
                      x: [0, 10, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="h-16 bg-gradient-to-r from-white/50 via-white/70 to-white/50 backdrop-blur-sm rounded-2xl w-3/4 shadow-xl"
                  ></motion.div>
                  <div className="flex gap-4">
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          opacity: [0.4, 0.8, 0.4],
                          y: [0, -5, 0],
                        }}
                        transition={{
                          duration: 2 + i * 0.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.2,
                        }}
                        className="h-10 bg-gradient-to-r from-white/40 via-white/60 to-white/40 backdrop-blur-sm rounded-xl w-28 shadow-lg"
                      ></motion.div>
                    ))}
                  </div>
                </div>

                {/* Enhanced Content Loading */}
                <motion.div
                  animate={{
                    opacity: [0.7, 1, 0.7],
                    scale: [1, 1.01, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="bg-white/70 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/30 space-y-8"
                >
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        opacity: [0.5, 1, 0.5],
                        x: [0, 20, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.3,
                      }}
                      className={`h-6 bg-gradient-to-r from-white/60 via-white/80 to-white/60 rounded-lg shadow-md ${
                        i % 3 === 0 ? "w-full" : i % 3 === 1 ? "w-5/6" : "w-4/6"
                      }`}
                    ></motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading text with typewriter effect */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center"
          >
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Loading Your Playbook...
            </div>
            <div className="text-sm text-gray-600 mt-2">
              Preparing collaborative workspace
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Collaborative Playbooks
          </Button>
        </Card>
      </div>
    );
  }

  if (!playbook) return null;

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 via-blue-50 to-cyan-50 relative overflow-hidden ${
        isFullscreen ? "fixed inset-0 z-50" : ""
      }`}
    >
      {/* Enhanced Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-bounce"></div>
      </div>

      {/* Floating particles for enhanced ambiance */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${50 + Math.random() * 50}%`,
            }}
          />
        ))}
      </div>

      <div className="flex relative z-10">
        {/* Main Content */}
        <div className={`flex-1 ${isFullscreen ? "w-full" : "lg:mr-80"}`}>
          <div
            className={`${
              isFullscreen ? "max-w-6xl" : "max-w-4xl"
            } mx-auto p-6 lg:p-8`}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              {/* Enhanced Header */}
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="flex items-center gap-4"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBack}
                    className="group bg-white/80 backdrop-blur-sm border-white/40 hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                    Back to Collaborative
                  </Button>
                </motion.div>

                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                  >
                    <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-purple-700 via-blue-600 to-cyan-600 bg-clip-text text-transparent leading-tight hover:scale-105 transition-transform duration-500 cursor-default">
                      {playbook.title}
                    </h1>
                  </motion.div>

                  {playbook.description && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                    >
                      <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-4xl">
                        {playbook.description}
                      </p>
                    </motion.div>
                  )}

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="flex flex-wrap items-center gap-4"
                  >
                    {/* Enhanced Owner/Collaborator Badge */}
                    {isOwner ? (
                      <motion.span 
                        whileHover={{ scale: 1.05 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Crown className="w-4 h-4" />
                        Owner
                      </motion.span>
                    ) : (
                      <motion.span 
                        whileHover={{ scale: 1.05 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Users className="w-4 h-4" />
                        Collaborator
                      </motion.span>
                    )}

                    {/* Enhanced Publish Status */}
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 ${
                        playbook.is_published
                          ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
                          : "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
                      }`}
                    >
                      {playbook.is_published ? (
                        <>
                          <Globe className="w-4 h-4" />
                          Published
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4" />
                          Draft
                        </>
                      )}
                    </motion.span>

                    {/* Enhanced Collaborators Count */}
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Users className="w-4 h-4" />
                      {playbook.collaborators?.length + 1 || 0} collaborator
                      {(playbook.collaborators?.length + 1 || 0) !== 1 ? "s" : ""}
                    </motion.span>

                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                      Updated {formatDate(playbook.updated_at)}
                    </motion.div>
                  </motion.div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {(isOwner ||
                      playbook.collaborators?.some(
                        (collab) => collab.profile.user_id === user?.id
                      )) && (
                      <Button
                        onClick={handleEdit}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}

                    <Button
                      onClick={handleShare}
                      variant="outline"
                      className="bg-white/80 backdrop-blur-sm border-white/40 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>

                    <Button
                      onClick={toggleFullscreen}
                      variant="outline"
                      className="bg-white/80 backdrop-blur-sm border-white/40 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300"
                      title={
                        isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                      }
                    >
                      {isFullscreen ? (
                        <Minimize className="w-4 h-4 mr-2" />
                      ) : (
                        <Maximize className="w-4 h-4 mr-2" />
                      )}
                      {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    </Button>

                    {playbook.is_published && (
                      <Button
                        onClick={() =>
                          window.open(
                            `/dashboard/collaborative/${playbook.slug}`,
                            "_blank"
                          )
                        }
                        variant="outline"
                        className="bg-white/80 backdrop-blur-sm border-white/40 hover:bg-white/90"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Public
                      </Button>
                    )}

                    <Button
                      onClick={toggleBookmark}
                      variant="outline"
                      className="bg-white/80 backdrop-blur-sm border-white/40 hover:bg-white/90"
                    >
                      <Bookmark
                        className={`w-4 h-4 mr-2 ${
                          isBookmarked ? "fill-current" : ""
                        }`}
                      />
                      {isBookmarked ? "Bookmarked" : "Bookmark"}
                    </Button>

                    <Button
                      onClick={toggleLike}
                      variant="outline"
                      className="bg-white/80 backdrop-blur-sm border-white/40 hover:bg-white/90"
                    >
                      <Heart
                        className={`w-4 h-4 mr-2 ${
                          isLiked ? "fill-current text-red-500" : ""
                        }`}
                      />
                      {isLiked ? "Liked" : "Like"}
                    </Button>

                    {/* Owner Actions Dropdown */}
                    {isOwner && (
                      <div className="relative">
                        <Button
                          onClick={() => setShowDropdown(!showDropdown)}
                          variant="outline"
                          className="bg-white/80 backdrop-blur-sm border-white/40 hover:bg-white/90"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>

                        <AnimatePresence>
                          {showDropdown && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-white/40 z-50"
                            >
                              <div className="py-1">
                                <button
                                  onClick={handleTogglePublish}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-white/60 flex items-center gap-2"
                                >
                                  {playbook.is_published ? (
                                    <>
                                      <EyeOff className="w-4 h-4" />
                                      Unpublish
                                    </>
                                  ) : (
                                    <>
                                      <Globe className="w-4 h-4" />
                                      Publish
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() =>
                                    setShowAddCollaboratorModal(true)
                                  }
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-white/60 flex items-center gap-2"
                                >
                                  <UserPlus className="w-4 h-4" />
                                  Add Collaborator
                                </button>
                                <button
                                  onClick={handleDeleteClick}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Playbook
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20"
              >
                <div className="prose prose-lg max-w-none">
                  {playbook.content ? (
                    <div
                      className="text-gray-800 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: playbook.content }}
                    />
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">This playbook is empty</p>
                      <p>Click &quot;Edit&quot; to start adding content</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Sidebar - Hide in fullscreen mode */}
        {!isFullscreen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="hidden lg:block w-80 bg-white/40 backdrop-blur-md border-l border-white/40 p-6 space-y-6 overflow-y-auto shadow-2xl"
          >
            {/* Collaborators */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Team Members ({(playbook.collaborators?.length || 0) + 1})
              </h3>

              {/* Owner */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-xl border border-blue-200/50 shadow-lg">
                  <div className="relative">
                    {playbook.owner_profile?.avatar_url ? (
                      <img
                        src={playbook.owner_profile.avatar_url}
                        alt={`${
                          playbook.owner_profile.username ||
                          playbook.owner_profile.email ||
                          "Owner"
                        }`}
                        className="w-12 h-12 rounded-full object-cover ring-4 ring-blue-200"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-4 ring-blue-200">
                        {playbook.owner_profile?.username ? (
                          <span className="text-white font-bold text-lg">
                            {playbook.owner_profile.username
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        ) : playbook.owner_profile?.email ? (
                          <span className="text-white font-bold text-lg">
                            {playbook.owner_profile.email
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        ) : (
                          <Crown className="w-6 h-6 text-white" />
                        )}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                      <Crown className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-lg">
                      {isOwner ? (
                        <span>
                          {playbook.owner_profile?.username ||
                            playbook.owner_profile?.email ||
                            "You"}{" "}
                          <span className="text-blue-600 font-medium">
                            (you)
                          </span>
                        </span>
                      ) : (
                        playbook.owner_profile?.username ||
                        playbook.owner_profile?.email ||
                        "Owner"
                      )}
                    </p>
                    <p className="text-sm text-blue-600 font-medium flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Owner
                    </p>
                  </div>
                </div>

                {/* Collaborators List */}
                {playbook.collaborators?.map((collab, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50/80 to-green-50/80 backdrop-blur-sm rounded-xl border border-emerald-200/50 shadow-lg"
                  >
                    {collab.profile.avatar_url ? (
                      <img
                        src={collab.profile.avatar_url}
                        alt={collab.profile.username}
                        className="w-12 h-12 rounded-full object-cover ring-4 ring-emerald-200"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center ring-4 ring-emerald-200">
                        <span className="text-white font-bold text-lg">
                          {collab.profile.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-lg">
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
                      <p className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Collaborator
                      </p>
                    </div>
                    {isOwner && collab.profile.user_id !== user?.id && (
                      <button
                        onClick={() =>
                          setShowRemoveCollaboratorModal({
                            show: true,
                            collaborator: collab.profile,
                          })
                        }
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Remove collaborator"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {isOwner && (
                <Button
                  onClick={() => setShowAddCollaboratorModal(true)}
                  variant="outline"
                  size="sm"
                  className="w-full bg-white/60 border-white/40 hover:bg-white/80 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Collaborator
                </Button>
              )}
            </div>

            {/* Last Updated Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Recent Activity
              </h3>

              <div className="space-y-3">
                <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Last Updated</span>
                  </div>
                  <p className="text-gray-900 font-semibold">
                    {formatDate(playbook.updated_at)}
                  </p>
                  {playbook.last_updated_by && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <Clock className="w-3 h-3" />
                        <span>Updated by</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700">
                        {playbook.last_updated_by === user?.id
                          ? "You"
                          : playbook.last_updated_by_profile?.username ||
                            playbook.last_updated_by_profile?.email ||
                            "Someone"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Created</span>
                  </div>
                  <p className="text-gray-900 font-semibold">
                    {formatDate(playbook.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Playbook
                  </h3>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="text-gray-600 mb-4">
                Are you sure you want to delete{" "}
                <strong>&quot;{playbook.title}&quot;</strong>? This will remove
                access for all collaborators.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <strong>delete</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="delete"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteConfirm}
                  disabled={deleteConfirmText.toLowerCase() !== "delete"}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete Playbook
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Collaborator Modal */}
      <AnimatePresence>
        {showAddCollaboratorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Collaborator
                </h3>
                <button
                  onClick={() => setShowAddCollaboratorModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search by email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter user's email..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleSearchCollaborators()
                    }
                  />
                  <Button
                    onClick={handleSearchCollaborators}
                    disabled={!email.trim() || isSearching}
                    size="sm"
                  >
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select user
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {searchResults.map((user) => (
                      <div
                        key={user.user_id}
                        onClick={() => handleSelectUser(user)}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          selectedUser?.user_id === user.user_id
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.username}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.username}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddCollaboratorModal(false)}
                  className="flex-1"
                  disabled={isAdding}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddCollaborator}
                  disabled={!selectedUser || isAdding}
                  className="flex-1"
                >
                  {isAdding ? "Adding..." : "Add Collaborator"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Remove Collaborator Modal */}
      <AnimatePresence>
        {showRemoveCollaboratorModal.show &&
          showRemoveCollaboratorModal.collaborator && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <UserMinus className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Remove Collaborator
                    </h3>
                    <p className="text-sm text-gray-600">
                      This action cannot be undone
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 mb-6">
                  Are you sure you want to remove{" "}
                  <strong>
                    {showRemoveCollaboratorModal.collaborator.username}
                  </strong>{" "}
                  from this playbook? They will lose access immediately.
                </p>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setShowRemoveCollaboratorModal({
                        show: false,
                        collaborator: null,
                      })
                    }
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRemoveCollaborator}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    Remove Collaborator
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
      </AnimatePresence>
    </div>
  );
}
