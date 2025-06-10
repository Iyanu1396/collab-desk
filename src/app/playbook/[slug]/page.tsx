"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Users,
  Crown,
  Eye,
  Lock,
  Share2,
  ArrowLeft,
  Globe,
  BookOpen,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import {
  collaboratorPlaybookService,
  type CollaboratorPlaybook,
} from "@/lib/collaborator-playbooks";
import { formatDate } from "@/lib/utils";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import toast from "react-hot-toast";

function PublicPlaybookPage() {
  const [playbook, setPlaybook] = useState<CollaboratorPlaybook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  useEffect(() => {
    if (slug) {
      loadPlaybook();
    }
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPlaybook = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await collaboratorPlaybookService.getPublishedPlaybook(slug);

      if (!data) {
        setError("Playbook not found or has been unpublished");
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

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-lg font-medium text-gray-700">
            Loading playbook...
          </p>
        </motion.div>
      </div>
    );
  }

  if (error || !playbook) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Playbook Unavailable
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {error || "This playbook has been unpublished or doesn't exist."}
          </p>
          <Button
            onClick={handleBackToHome}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50"
        >
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={handleBackToHome}
                  className="bg-white/80 backdrop-blur-sm hover:bg-white border-white/40"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Home
                </Button>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Public Playbook
                  </span>
                </div>
              </div>
              <Button
                onClick={handleShare}
                variant="outline"
                className="bg-white/80 backdrop-blur-sm hover:bg-white border-white/40"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title and Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-8 bg-white/90 backdrop-blur-sm border-white/40 shadow-xl">
                  <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                      {playbook.title}
                    </h1>
                    {playbook.description && (
                      <p className="text-xl text-gray-600 leading-relaxed">
                        {playbook.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-green-600">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">Published</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                          Updated {formatDate(playbook.updated_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-8 bg-white/90 backdrop-blur-sm border-white/40 shadow-xl">
                  <div
                    className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-em:text-gray-600"
                    dangerouslySetInnerHTML={{ __html: playbook.content }}
                  />
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Owner Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6 bg-white/90 backdrop-blur-sm border-white/40 shadow-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    Owner
                  </h3>
                  <div className="flex items-center gap-3">
                    {playbook.owner_profile?.avatar_url ? (
                      <img
                        src={playbook.owner_profile.avatar_url}
                        alt={playbook.owner_profile.username}
                        className="w-12 h-12 rounded-full border-2 border-gray-200 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {(playbook.owner_profile?.username || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">
                        {playbook.owner_profile?.username || "Anonymous"}
                      </p>
                      {playbook.owner_profile?.email && (
                        <p className="text-sm text-gray-500">
                          {playbook.owner_profile.email}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Collaborators */}
              {playbook.collaborators && playbook.collaborators.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="p-6 bg-white/90 backdrop-blur-sm border-white/40 shadow-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      Collaborators ({playbook.collaborators.length})
                    </h3>
                    <div className="space-y-3">
                      {playbook.collaborators.map((collab) => (
                        <div
                          key={collab.profile.user_id}
                          className="flex items-center gap-3"
                        >
                          {collab.profile.avatar_url ? (
                            <img
                              src={collab.profile.avatar_url}
                              alt={collab.profile.username}
                              className="w-10 h-10 rounded-full border-2 border-gray-200 shadow-sm"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                              {collab.profile.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {collab.profile.username}
                            </p>
                            {collab.profile.email && (
                              <p className="text-sm text-gray-500">
                                {collab.profile.email}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Playbook Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="p-6 bg-white/90 backdrop-blur-sm border-white/40 shadow-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-500" />
                    Playbook Info
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Type</span>
                      <span className="text-purple-600 font-medium">
                        Collaborative
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Status</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        Published
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Created</span>
                      <span className="text-gray-900">
                        {formatDate(playbook.created_at)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Last Updated</span>
                      <span className="text-gray-900">
                        {formatDate(playbook.updated_at)}
                      </span>
                    </div>
                    {playbook.last_updated_by_profile && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Updated By</span>
                        <div className="flex items-center gap-2">
                          {playbook.last_updated_by_profile.avatar_url ? (
                            <img
                              src={playbook.last_updated_by_profile.avatar_url}
                              alt={playbook.last_updated_by_profile.username}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {playbook.last_updated_by_profile.username
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                          <span className="text-gray-900 font-medium">
                            {playbook.last_updated_by_profile.username}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default PublicPlaybookPage;
