"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Edit,
  Share,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  User,
  Clock,
  BookOpen,
  ExternalLink,
  Heart,
  Bookmark,
  MoreVertical,
  ChevronRight,
  Globe,
  Lock,
  X,
  AlertTriangle,
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
  const [relatedPlaybooks, setRelatedPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { user } = useAuthQuery();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  useEffect(() => {
    loadPlaybook();
    loadRelatedPlaybooks();
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

  const loadRelatedPlaybooks = async () => {
    try {
      // Get 8 random playbooks that are published
      const data = await playbookService.getPlaybooks({ limit: 12 });
      // Filter out current playbook and only show published ones
      const filtered = data
        .filter((p) => p.slug !== slug && p.published)
        .slice(0, 5);
      setRelatedPlaybooks(filtered);
    } catch (error) {
      console.error("Failed to load related playbooks:", error);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/playbooks/${slug}/edit`);
  };

  // const handleDeleteClick = () => {
  //   setShowDropdown(false);
  //   setShowDeleteModal(true);
  //   setDeleteConfirmText("");
  // };

  const handleDeleteConfirm = async () => {
    if (!playbook || deleteConfirmText.toLowerCase() !== "delete") return;

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
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
  };

  const handleBack = () => {
    router.push("/dashboard/playbooks");
  };

  const handleRelatedPlaybookClick = (relatedSlug: string) => {
    router.push(`/dashboard/playbooks/${relatedSlug}`);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 via-blue-50 to-cyan-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="flex relative z-10">
          {/* Main Content Loading */}
          <div className="flex-1 lg:mr-80">
            <div className="max-w-4xl mx-auto p-6 lg:p-8">
              <div className="animate-pulse space-y-8">
                {/* Header */}
                <div className="space-y-4">
                  <div className="h-8 bg-white/40 backdrop-blur-sm rounded-lg w-32"></div>
                  <div className="h-12 bg-white/40 backdrop-blur-sm rounded-lg w-3/4"></div>
                  <div className="flex gap-4">
                    <div className="h-8 bg-white/40 backdrop-blur-sm rounded-lg w-24"></div>
                    <div className="h-8 bg-white/40 backdrop-blur-sm rounded-lg w-20"></div>
                  </div>
                </div>
                {/* Content */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-2xl space-y-6 border border-white/20">
                  <div className="h-6 bg-white/60 rounded w-full"></div>
                  <div className="h-6 bg-white/60 rounded w-5/6"></div>
                  <div className="h-6 bg-white/60 rounded w-4/6"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-white/60 rounded"></div>
                    <div className="h-4 bg-white/60 rounded w-5/6"></div>
                    <div className="h-4 bg-white/60 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar Loading */}
          <div className="hidden lg:block fixed right-0 top-0 h-full w-80 bg-white/80 backdrop-blur-lg border-l border-white/30 shadow-2xl p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-6 bg-white/60 rounded w-32"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white/60 rounded-xl h-24"></div>
              ))}
            </div>
          </div>
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

  if (error || !playbook) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 flex items-center justify-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 -right-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white/90 backdrop-blur-lg p-12 rounded-3xl shadow-2xl max-w-md mx-4 border border-white/20 relative z-10"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <BookOpen className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            {error === "Playbook not found" ? "Playbook Not Found" : "Error"}
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {error === "Playbook not found"
              ? "The playbook you are looking for does not exist or has been deleted."
              : "Something went wrong while loading the playbook."}
          </p>
          <Button 
            onClick={handleBack} 
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-6000"></div>
      </div>

      <div className="flex relative z-10">
        {/* Main Content */}
        <div className="flex-1 lg:mr-80">
          <div className="max-w-4xl mx-auto p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Back Button */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex items-center gap-2 bg-white/90 backdrop-blur-sm hover:bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 text-gray-700 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Playbooks
                </Button>
              </motion.div>

              {/* Header Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                {/* Title and Status */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 bg-clip-text text-transparent leading-tight mb-3">
                        {playbook.title}
                      </h1>
                      
                      {/* Meta Information */}
                      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full">
                          <User className="w-4 h-4" />
                          <span className="font-medium">
                            {playbook.owner_id || "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full">
                          <Calendar className="w-4 h-4" />
                          <span>Updated {formatDate(playbook.updated_at)}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full">
                          <Clock className="w-4 h-4" />
                          <span>Created {formatDate(playbook.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                      {playbook.published ? (
                        <span className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium shadow-lg border border-green-200">
                          <Globe className="w-4 h-4" />
                          Published
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium shadow-lg border border-orange-200">
                          <Lock className="w-4 h-4" />
                          Draft
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {playbook.description && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-xl">
                      <p className="text-xl text-gray-700 leading-relaxed">
                        {playbook.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Quick Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={toggleLike}
                      className={`flex items-center gap-2 transition-all duration-300 border-0 shadow-lg hover:shadow-xl ${
                        isLiked 
                          ? "bg-gradient-to-r from-red-50 to-pink-50 text-red-600 hover:from-red-100 hover:to-pink-100" 
                          : "bg-white/90 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
                      />
                      Like
                    </Button>

                    <Button
                      variant="outline"
                      onClick={toggleBookmark}
                      className={`flex items-center gap-2 transition-all duration-300 border-0 shadow-lg hover:shadow-xl ${
                        isBookmarked 
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-100 hover:to-indigo-100" 
                          : "bg-white/90 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600"
                      }`}
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          isBookmarked ? "fill-current" : ""
                        }`}
                      />
                      Save
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleShare}
                      className="flex items-center gap-2 bg-white/90 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 transition-all duration-300 border-0 shadow-lg hover:shadow-xl"
                    >
                      <Share className="w-4 h-4" />
                      Share
                    </Button>
                  </div>

                  {/* Owner Actions */}
                  {isOwner && (
                    <div className="flex items-center gap-2 ml-auto">
                      <Button
                        variant="outline"
                        onClick={handleTogglePublish}
                        className={`flex items-center gap-2 transition-all duration-300 border-0 shadow-lg hover:shadow-xl ${
                          playbook.published
                            ? "text-orange-600 hover:text-orange-700 bg-white/90 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50"
                            : "text-green-600 hover:text-green-700 bg-white/90 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50"
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
                        onClick={handleEdit}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Playbook
                      </Button>

                      {/* More Actions Dropdown */}
                      {/* <div className="relative">
                        <Button
                          variant="outline"
                          onClick={() => setShowDropdown(!showDropdown)}
                          className="flex items-center gap-2 bg-white/90 hover:bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>

                        <AnimatePresence>
                          {showDropdown && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/30 z-50 overflow-hidden"
                            >
                              <button
                                onClick={handleDeleteClick}
                                className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 whitespace-nowrap"
                              >
                                <Trash2 className="w-4 h-4 flex-shrink-0" />
                                <span>Delete Playbook</span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div> */}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Content Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-2xl rounded-3xl overflow-hidden border border-white/20">
                  <div className="p-8 lg:p-12">
                    {playbook.content ? (
                      <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-strong:text-gray-900 prose-code:bg-gray-100 prose-code:text-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded">
                        <div
                          dangerouslySetInnerHTML={{ __html: playbook.content }}
                        />
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                          <BookOpen className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          No Content Yet
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                          This playbook doesn&apos;t have any content yet.
                          {isOwner &&
                            " Click the edit button to add some content."}
                        </p>
                        {isOwner && (
                          <Button
                            onClick={handleEdit}
                            className="flex items-center gap-2 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
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
            </motion.div>
          </div>
        </div>

        {/* Sidebar with Related Playbooks */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="hidden lg:block fixed right-0 top-0 h-full w-80 bg-white/95 backdrop-blur-lg border-l border-white/30 shadow-2xl"
        >
          <div className="p-6 h-full overflow-y-auto">
            <div className="space-y-6">
              {/* Sidebar Header */}
              <div className="pb-4 border-b border-gray-200/50">
                <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent mb-2">
                  Related Playbooks
                </h2>
                <p className="text-sm text-gray-600">
                  Discover other published playbooks
                </p>
              </div>

              {/* Related Playbooks List */}
              <div className="space-y-4">
                {relatedPlaybooks.length > 0 ? (
                  relatedPlaybooks.map((related, index) => (
                    <motion.div
                      key={related.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      onClick={() => handleRelatedPlaybookClick(related.slug)}
                      className="group bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:scale-105"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors shadow-sm">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm">
                            {related.title}
                          </h3>
                          {related.description && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {related.description.length > 80
                                ? related.description.substring(0, 80) + "..."
                                : related.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(related.updated_at)}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">
                      No related playbooks found
                    </p>
                  </div>
                )}
              </div>

              {/* View All Button */}
              {relatedPlaybooks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="pt-4 border-t border-gray-200/50"
                >
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="w-full flex items-center justify-center gap-2 bg-white/80 hover:bg-white transition-all duration-300 border-0 shadow-lg hover:shadow-xl"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View All Playbooks
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile Related Playbooks */}
      <div className="lg:hidden">
        <div className="max-w-4xl mx-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent">
              Related Playbooks
            </h2>
            
            {relatedPlaybooks.length > 0 ? (
              <div className="grid gap-4">
                {relatedPlaybooks.slice(0, 3).map((related, index) => (
                  <motion.div
                    key={related.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    onClick={() => handleRelatedPlaybookClick(related.slug)}
                    className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 line-clamp-2 text-sm">
                          {related.title}
                        </h3>
                        {related.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {related.description.length > 100
                              ? related.description.substring(0, 100) + "..."
                              : related.description}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No related playbooks found</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 max-w-md w-full mx-4 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Playbook
                  </h3>
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Are you sure you want to delete <span className="font-semibold text-gray-900">&quot;{playbook?.title}&quot;</span>? This action cannot be undone.
                </p>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type <span className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">delete</span> to confirm:
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
                    className="flex-1 border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteConfirm}
                    disabled={deleteConfirmText.toLowerCase() !== "delete"}
                    className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    Delete Playbook
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
      
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
        .animation-delay-6000 {
          animation-delay: 6s;
        }
      `}</style>
    </div>
  );
}
