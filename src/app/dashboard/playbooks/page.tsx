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
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-72"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-white min-h-full">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Your Playbooks
                </h1>
                <p className="text-gray-600 text-lg">
                  Create and manage your personal documentation
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                  <button
                    onClick={() => setViewMode("cards")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === "cards"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                    Cards
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === "list"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <List className="w-4 h-4" />
                    List
                  </button>
                </div>

                <Button
                  onClick={handleCreatePlaybook}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="w-4 h-4" />
                  New Playbook
                </Button>
              </div>
            </div>

            {/* Search and Stats */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-8">
              <div className="flex-1 relative max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search your playbooks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{playbooks.length} Total</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>
                    {playbooks.filter((p) => p.published).length} Published
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>
                    {playbooks.filter((p) => !p.published).length} Drafts
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            {filteredPlaybooks.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-white rounded-2xl p-12 shadow-lg max-w-md mx-auto">
                  <BookOpen className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                    {searchQuery ? "No playbooks found" : "No playbooks yet"}
                  </h3>
                  <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                    {searchQuery
                      ? "Try adjusting your search terms"
                      : "Create your first playbook to get started with documenting your processes"}
                  </p>
                  {!searchQuery && (
                    <Button
                      onClick={handleCreatePlaybook}
                      className="flex items-center gap-2 mx-auto bg-blue-600 hover:bg-blue-700 px-6 py-3 text-lg"
                    >
                      <Plus className="w-5 h-5" />
                      Create Playbook
                    </Button>
                  )}
                </div>
              </div>
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
                        <Card className="relative h-full flex flex-col bg-white border border-gray-200 hover:border-blue-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] rounded-2xl overflow-hidden">
                          {/* Status Badge */}
                          <div className="absolute top-4 right-4 z-10">
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
                          </div>

                          {/* Card Content */}
                          <div className="p-6 flex-1 flex flex-col">
                            {/* Title Section */}
                            <div className="mb-4">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                  <FileText className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight mb-1">
                                    {truncateTitle(playbook.title)}
                                  </h3>
                                  <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    <span>
                                      Updated {formatDate(playbook.updated_at)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Description */}
                            <div className="mb-6 flex-1">
                              {playbook.description ? (
                                <p className="text-gray-600 text-sm leading-relaxed">
                                  {truncateDescription(playbook.description)}
                                </p>
                              ) : (
                                <p className="text-gray-400 text-sm italic">
                                  No description available
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                              {/* View Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewPlaybook(playbook)}
                                disabled={!playbook.published}
                                className={`flex items-center gap-1.5 flex-1 justify-center transition-all ${
                                  !playbook.published
                                    ? "cursor-not-allowed opacity-50 bg-gray-50"
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
                                View
                              </Button>

                              {/* Edit Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleEditPlaybook(playbook.slug)
                                }
                                className="flex items-center gap-1.5 flex-1 justify-center hover:bg-gray-50 hover:text-gray-700"
                              >
                                <Edit className="w-3 h-3" />
                                Edit
                              </Button>

                              {/* Publish/Unpublish Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTogglePublish(playbook)}
                                className={`flex items-center gap-1.5 ${
                                  playbook.published
                                    ? "text-orange-600 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300"
                                    : "text-green-600 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                                }`}
                                title={
                                  playbook.published
                                    ? "Unpublish playbook"
                                    : "Publish playbook"
                                }
                              >
                                <Share className="w-3 h-3" />
                                {playbook.published ? "Unpublish" : "Publish"}
                              </Button>

                              {/* Delete Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClick(playbook)}
                                className="flex items-center gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                title="Delete playbook"
                              >
                                <Trash2 className="w-3 h-3" />
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
                                    onClick={() =>
                                      handleTogglePublish(playbook)
                                    }
                                    className={`flex items-center gap-1 ${
                                      playbook.published
                                        ? "text-orange-600 hover:bg-orange-50 hover:border-orange-300"
                                        : "text-green-600 hover:bg-green-50 hover:border-green-300"
                                    }`}
                                    title={
                                      playbook.published
                                        ? "Unpublish"
                                        : "Publish"
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
        </div>
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
