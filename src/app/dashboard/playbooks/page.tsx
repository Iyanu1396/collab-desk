"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Share,
  Trash2,
  BookOpen,
  Clock,
  FileText,
  Lock,
  Grid3X3,
  List,
  Calendar,
  X,
} from "lucide-react";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { playbookService, type Playbook } from "@/lib/playbooks";
import { formatDate } from "@/lib/utils";
import { useAuthQuery } from "@/hooks/use-auth-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Helper function to truncate text with ellipsis
const truncateDescription = (text: string, maxLength: number = 120) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

// Helper function to truncate title with ellipsis
const truncateTitle = (text: string, maxLength: number = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

// Generate random word for deletion confirmation
const generateRandomWord = () => {
  const words = [
    "thunder",
    "wizard",
    "galaxy",
    "phoenix",
    "cosmic",
    "dragon",
    "mystic",
    "crystal",
    "storm",
    "solar",
    "lunar",
    "ocean",
    "forest",
    "mountain",
    "river",
    "shadow",
    "light",
    "fire",
    "earth",
    "wind",
    "spirit",
    "dream",
    "star",
    "moon",
  ];
  return words[Math.floor(Math.random() * words.length)];
};

// Deletion Confirmation Modal
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  playbookTitle: string;
  confirmationWord: string;
}

const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  playbookTitle,
  confirmationWord,
}: DeleteModalProps) => {
  const [inputWord, setInputWord] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (inputWord.toLowerCase() !== confirmationWord.toLowerCase()) {
      toast.error("Confirmation word doesn't match!");
      return;
    }

    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setInputWord("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Playbook
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete{" "}
              <strong>&quot;{playbookTitle}&quot;</strong>? This action cannot
              be undone.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 mb-2">
                To confirm deletion, please type the word:
              </p>
              <p className="text-lg font-bold text-red-900 bg-red-100 px-3 py-2 rounded border text-center">
                {confirmationWord}
              </p>
            </div>

            <input
              type="text"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              placeholder="Type the confirmation word..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={
                inputWord.toLowerCase() !== confirmationWord.toLowerCase() ||
                isDeleting
              }
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete Playbook"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

type ViewMode = "cards" | "list";

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    playbook: Playbook | null;
    confirmationWord: string;
  }>({
    isOpen: false,
    playbook: null,
    confirmationWord: "",
  });

  const { user } = useAuthQuery();
  const router = useRouter();

  useEffect(() => {
    loadPlaybooks();
  }, [user]);

  const loadPlaybooks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Only fetch playbooks owned by the current user
      const data = await playbookService.getPlaybooks({ owner_id: user.id });
      setPlaybooks(data);
    } catch (error) {
      console.error("Failed to load playbooks:", error);
      toast.error("Failed to load playbooks");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaybook = () => {
    router.push("/dashboard/playbooks/new");
  };

  const handleViewPlaybook = (playbook: Playbook) => {
    if (!playbook.published) {
      toast.error("Only published playbooks can be viewed");
      return;
    }
    router.push(`/dashboard/playbooks/${playbook.slug}`);
  };

  const handleEditPlaybook = (slug: string) => {
    router.push(`/dashboard/playbooks/${slug}/edit`);
  };

  const handleDeleteClick = (playbook: Playbook) => {
    setDeleteModal({
      isOpen: true,
      playbook,
      confirmationWord: generateRandomWord(),
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.playbook) return;

    try {
      await playbookService.deletePlaybook(deleteModal.playbook.id);
      toast.success("Playbook deleted successfully");
      loadPlaybooks();
    } catch (error) {
      console.error("Failed to delete playbook:", error);
      toast.error("Failed to delete playbook");
    }
  };

  const handleTogglePublish = async (playbook: Playbook) => {
    try {
      if (playbook.published) {
        await playbookService.unpublishPlaybook(playbook.id);
        toast.success("Playbook unpublished");
      } else {
        await playbookService.publishPlaybook(playbook.id);
        toast.success("Playbook published");
      }
      loadPlaybooks();
    } catch (error) {
      console.error("Failed to toggle publish:", error);
      toast.error("Failed to update playbook");
    }
  };

  const filteredPlaybooks = playbooks.filter(
    (playbook) =>
      playbook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      playbook.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gray-200 rounded-2xl"></div>
              <div>
                <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-2xl h-80"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center">
                    <FileText className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent leading-tight">
                    Your Playbooks
                  </h1>
                  <p className="text-xl text-gray-600 font-medium mt-1">
                    Personal Knowledge Repository
                  </p>
                </div>
              </div>
              <p className="text-lg text-gray-700 max-w-2xl leading-relaxed">
                Create, organize, and manage your personal documentation. Build
                comprehensive guides and procedures that capture your knowledge
                and expertise.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button
                onClick={handleCreatePlaybook}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-800 text-white font-semibold text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              >
                <Plus className="w-6 h-6 mr-3" />
                <span className="hidden sm:inline">Create New Playbook</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="group"
            >
              <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:scale-105 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {playbooks.length}
                    </p>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Total Playbooks
                    </p>
                  </div>
                </div>
                <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-20"></div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="group"
            >
              <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:scale-105 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                      {playbooks.filter((p) => p.published).length}
                    </p>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Published
                    </p>
                  </div>
                </div>
                <div className="h-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full opacity-20"></div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="group"
            >
              <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:scale-105 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                    <Edit className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      {playbooks.filter((p) => !p.published).length}
                    </p>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Drafts
                    </p>
                  </div>
                </div>
                <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full opacity-20"></div>
              </Card>
            </motion.div>
          </div>

          {/* Enhanced Controls */}
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Enhanced Search */}
              <div className="relative flex-1 max-w-lg">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search your playbooks by title or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm placeholder-gray-500"
                />
              </div>
            </div>

            {/* Enhanced View Toggle */}
            <div className="flex gap-2 p-2 bg-gray-100/80 backdrop-blur-sm rounded-2xl">
              <button
                onClick={() => setViewMode("cards")}
                className={`p-4 rounded-xl transition-all duration-300 ${
                  viewMode === "cards"
                    ? "bg-white text-blue-700 shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                <Grid3X3 className="w-6 h-6" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-4 rounded-xl transition-all duration-300 ${
                  viewMode === "list"
                    ? "bg-white text-blue-700 shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                <List className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {filteredPlaybooks.length === 0 ? (
          <Card className="p-16 text-center bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl shadow-xl">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-blue-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="max-w-md">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {searchQuery
                    ? "No playbooks found"
                    : "Ready to create your first playbook?"}
                </h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {searchQuery
                    ? "Try adjusting your search terms to find what you're looking for."
                    : "Start documenting your processes, procedures, and knowledge with your first personal playbook."}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={handleCreatePlaybook}
                    className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-800 text-white font-semibold text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Plus className="w-6 h-6 mr-3" />
                    Create Your First Playbook
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === "cards" ? (
              <motion.div
                key="cards"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
              >
                {filteredPlaybooks.map((playbook, index) => (
                  <motion.div
                    key={playbook.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <Card className="relative h-full transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 hover:border-blue-400 rounded-2xl p-8 overflow-hidden">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-transparent"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white to-transparent rounded-full blur-2xl"></div>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-6 right-6 z-10">
                        {playbook.published ? (
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg">
                            <Eye className="w-4 h-4" />
                            Live
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
                            <Edit className="w-4 h-4" />
                            Draft
                          </span>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="relative z-10 flex-1 flex flex-col">
                        {/* Title Section */}
                        <div className="mb-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                              <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight mb-2">
                                {truncateTitle(playbook.title, 45)}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">
                                  Updated {formatDate(playbook.updated_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="mb-6 flex-1">
                          {playbook.description ? (
                            <p className="text-gray-700 text-base leading-relaxed line-clamp-3">
                              {truncateDescription(playbook.description, 140)}
                            </p>
                          ) : (
                            <p className="text-gray-500 text-base italic">
                              No description available
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                          {/* View Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPlaybook(playbook)}
                            disabled={!playbook.published}
                            className={`flex-1 min-w-[100px] bg-white/80 backdrop-blur-sm font-semibold transition-all duration-300 ${
                              !playbook.published
                                ? "cursor-not-allowed opacity-50 bg-gray-50"
                                : "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400"
                            }`}
                            title={
                              !playbook.published
                                ? "Only published playbooks can be viewed"
                                : "View playbook"
                            }
                          >
                            {!playbook.published ? (
                              <Lock className="w-4 h-4 mr-2" />
                            ) : (
                              <Eye className="w-4 h-4 mr-2" />
                            )}
                            View
                          </Button>

                          {/* Edit Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPlaybook(playbook.slug)}
                            className="flex-1 min-w-[100px] bg-white/80 backdrop-blur-sm hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-400 font-semibold transition-all duration-300"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>

                          {/* Publish/Unpublish Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTogglePublish(playbook)}
                            className={`px-4 bg-white/80 backdrop-blur-sm transition-all duration-300 ${
                              playbook.published
                                ? "text-orange-600 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-400"
                                : "text-green-600 hover:bg-green-50 hover:text-green-700 hover:border-green-400"
                            }`}
                            title={
                              playbook.published
                                ? "Unpublish playbook"
                                : "Publish playbook"
                            }
                          >
                            <Share className="w-4 h-4" />
                          </Button>

                          {/* Delete Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(playbook)}
                            className="px-4 bg-white/80 backdrop-blur-sm text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400 transition-all duration-300"
                            title="Delete playbook"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    All Playbooks
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {filteredPlaybooks.length} playbooks
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Playbook
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Updated
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPlaybooks.map((playbook, index) => (
                        <motion.tr
                          key={playbook.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-50 rounded-lg">
                                <FileText className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {truncateTitle(playbook.title, 60)}
                                </h4>
                                {playbook.description && (
                                  <p className="text-sm text-gray-500 truncate">
                                    {truncateDescription(
                                      playbook.description,
                                      80
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {playbook.published ? (
                              <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-medium">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                Published
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full text-xs font-medium">
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                Draft
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(playbook.updated_at)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewPlaybook(playbook)}
                                disabled={!playbook.published}
                                className={`flex items-center gap-1 ${
                                  !playbook.published
                                    ? "cursor-not-allowed opacity-50"
                                    : "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                                }`}
                                title={
                                  !playbook.published
                                    ? "Only published playbooks can be viewed"
                                    : "View playbook"
                                }
                              >
                                {!playbook.published ? (
                                  <Lock className="w-3 h-3" />
                                ) : (
                                  <Eye className="w-3 h-3" />
                                )}
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleEditPlaybook(playbook.slug)
                                }
                                className="flex items-center gap-1 hover:bg-gray-50"
                                title="Edit playbook"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTogglePublish(playbook)}
                                className={`flex items-center gap-1 ${
                                  playbook.published
                                    ? "text-orange-600 hover:bg-orange-50 hover:border-orange-300"
                                    : "text-green-600 hover:bg-green-50 hover:border-green-300"
                                }`}
                                title={
                                  playbook.published ? "Unpublish" : "Publish"
                                }
                              >
                                <Share className="w-3 h-3" />
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClick(playbook)}
                                className="flex items-center gap-1 text-red-600 hover:bg-red-50 hover:border-red-300"
                                title="Delete playbook"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleDeleteConfirm}
        playbookTitle={deleteModal.playbook?.title || ""}
        confirmationWord={deleteModal.confirmationWord}
      />
    </div>
  );
}
