"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  BookOpen,
  Clock,
  FileText,
  Grid3X3,
  List,
  Calendar,
  X,
  Users,
  Crown,
  UserPlus,
  Filter,
  Globe,
  EyeOff,
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
              Delete Collaborative Playbook
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
              be undone and will remove access for all collaborators.
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

// Add Collaborator Modal
interface AddCollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (userId: string) => void;
  playbookId: string;
}

const AddCollaboratorModal = ({
  isOpen,
  onClose,
  onAdd,
}: AddCollaboratorModalProps) => {
  const [email, setEmail] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { user } = useAuthQuery();

  const handleSearch = async () => {
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

      // Filter out current user from results
      const filteredResults = results.filter((profile) => {
        return profile.user_id !== user?.id;
      });

      if (filteredResults.length === 0) {
        toast.error(
          "You cannot add yourself as a collaborator - you are already the owner!"
        );
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
    if (!selectedUser) return;

    setIsAdding(true);
    try {
      await onAdd(selectedUser.user_id);
      handleClose();
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setSearchResults([]);
    setSelectedUser(null);
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
              Add Collaborator
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button
                onClick={handleSearch}
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
                        ? "border-blue-500 bg-blue-50"
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
              onClick={handleClose}
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
        </div>
      </motion.div>
    </div>
  );
};

type ViewMode = "cards" | "list";
type FilterMode = "all" | "owned" | "collaborating";

export default function CollaborativePage() {
  const [playbooks, setPlaybooks] = useState<CollaboratorPlaybook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    playbook: CollaboratorPlaybook | null;
    confirmationWord: string;
  }>({
    isOpen: false,
    playbook: null,
    confirmationWord: "",
  });
  const [addCollaboratorModal, setAddCollaboratorModal] = useState<{
    isOpen: boolean;
    playbookId: string;
  }>({
    isOpen: false,
    playbookId: "",
  });

  const { user, checkSession } = useAuthQuery();
  const router = useRouter();

  useEffect(() => {
    if (checkSession()) {
      loadPlaybooks();
    }
  }, []);

  const loadPlaybooks = async () => {
    try {
      setLoading(true);
      const data = await collaboratorPlaybookService.getCollaboratorPlaybooks();
      setPlaybooks(data);
    } catch (error) {
      console.error("Failed to load collaborative playbooks:", error);
      toast.error("Failed to load collaborative playbooks");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaybook = () => {
    router.push("/dashboard/collaborative/new");
  };

  const handleViewPlaybook = (playbook: CollaboratorPlaybook) => {
    if (playbook.is_published) {
      window.open(`/dashboard/collaborative/${playbook.slug}`, "_blank");
    } else {
      toast.error("This playbook is not published yet");
    }
  };

  const handleEditPlaybook = (slug: string) => {
    router.push(`/dashboard/collaborative/${slug}/edit`);
  };

  const handleDeleteClick = (playbook: CollaboratorPlaybook) => {
    const confirmationWord = generateRandomWord();
    setDeleteModal({
      isOpen: true,
      playbook,
      confirmationWord,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.playbook) return;

    try {
      await collaboratorPlaybookService.deleteCollaboratorPlaybook(
        deleteModal.playbook.id
      );
      toast.success("Playbook deleted successfully!");
      loadPlaybooks();
    } catch (error) {
      console.error("Failed to delete playbook:", error);
      toast.error("Failed to delete playbook");
    }
  };

  const handleTogglePublish = async (playbook: CollaboratorPlaybook) => {
    try {
      await collaboratorPlaybookService.togglePublish(playbook.id);
      toast.success(
        `Playbook ${
          playbook.is_published ? "unpublished" : "published"
        } successfully!`
      );
      loadPlaybooks();
    } catch (error) {
      console.error("Failed to toggle publish status:", error);
      toast.error("Failed to update publish status");
    }
  };

  const handleAddCollaborator = (playbookId: string) => {
    setAddCollaboratorModal({
      isOpen: true,
      playbookId,
    });
  };

  const handleAddCollaboratorConfirm = async (userId: string) => {
    try {
      await collaboratorPlaybookService.addCollaborator(
        addCollaboratorModal.playbookId,
        userId
      );
      toast.success("Collaborator added successfully!");
      loadPlaybooks();
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
    }
  };

  // Filter playbooks based on selected filter mode
  const filteredPlaybooks = playbooks.filter((playbook) => {
    const matchesSearch = playbook.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    switch (filterMode) {
      case "owned":
        return playbook.owner_id === user?.id;
      case "collaborating":
        return playbook.owner_id !== user?.id;
      default:
        return true;
    }
  });

  const isOwner = (playbook: CollaboratorPlaybook) =>
    playbook.owner_id === user?.id;

  // Helper to get total team members count (owner + collaborators)
  const getTotalTeamMembersCount = (playbook: CollaboratorPlaybook) => {
    const collaboratorCount = playbook.collaborators?.length || 0;
    // Always add 1 for the owner
    return collaboratorCount + 1;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
            ))}
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
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center">
                    <BookOpen className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent leading-tight">
                    Team Playbooks
                  </h1>
                  <p className="text-xl text-gray-600 font-medium mt-1">
                    Collaborative Knowledge Management
                  </p>
                </div>
              </div>
              <p className="text-lg text-gray-700 max-w-2xl leading-relaxed">
                Create, share, and collaborate on playbooks with your team.
                Build comprehensive guides, procedures, and knowledge bases that
                everyone can contribute to and learn from.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button
                onClick={handleCreatePlaybook}
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-800 text-white font-semibold text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
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
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {playbooks.length}
                    </p>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Total Playbooks
                    </p>
                  </div>
                </div>
                <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-20"></div>
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
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      {playbooks.filter((p) => isOwner(p)).length}
                    </p>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Your Playbooks
                    </p>
                  </div>
                </div>
                <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full opacity-20"></div>
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
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                      {playbooks.filter((p) => !isOwner(p)).length}
                    </p>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Collaborating
                    </p>
                  </div>
                </div>
                <div className="h-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full opacity-20"></div>
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
                  placeholder="Search playbooks by title, content, or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-white/80 backdrop-blur-sm placeholder-gray-500"
                />
              </div>

              {/* Enhanced Filter */}
              <div className="flex gap-2 p-2 bg-gray-100/80 backdrop-blur-sm rounded-2xl">
                {[
                  {
                    key: "all",
                    label: "All Playbooks",
                    icon: Filter,
                    color: "indigo",
                  },
                  {
                    key: "owned",
                    label: "My Playbooks",
                    icon: Crown,
                    color: "blue",
                  },
                  {
                    key: "collaborating",
                    label: "Shared with Me",
                    icon: Users,
                    color: "emerald",
                  },
                ].map(({ key, label, icon: Icon, color }) => (
                  <button
                    key={key}
                    onClick={() => setFilterMode(key as FilterMode)}
                    className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-3 ${
                      filterMode === key
                        ? `bg-white shadow-lg text-${color}-700 transform scale-105`
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden md:inline">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced View Toggle */}
            <div className="flex gap-2 p-2 bg-gray-100/80 backdrop-blur-sm rounded-2xl">
              <button
                onClick={() => setViewMode("cards")}
                className={`p-4 rounded-xl transition-all duration-300 ${
                  viewMode === "cards"
                    ? "bg-white text-indigo-700 shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                <Grid3X3 className="w-6 h-6" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-4 rounded-xl transition-all duration-300 ${
                  viewMode === "list"
                    ? "bg-white text-indigo-700 shadow-lg transform scale-105"
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
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-indigo-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="max-w-md">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {searchQuery
                    ? "No playbooks found"
                    : filterMode === "owned"
                    ? "No playbooks created yet"
                    : filterMode === "collaborating"
                    ? "No shared playbooks yet"
                    : "Ready to build your first playbook?"}
                </h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {searchQuery
                    ? "Try adjusting your search terms or filters to find what you're looking for."
                    : "Create comprehensive guides, procedures, and knowledge bases that your team can collaborate on and learn from."}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={handleCreatePlaybook}
                    className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-800 text-white font-semibold text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Plus className="w-6 h-6 mr-3" />
                    Create Your First Playbook
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ) : viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredPlaybooks.map((playbook) => (
                <motion.div
                  key={playbook.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="group"
                >
                  <Card
                    className={`relative h-full transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 ${
                      isOwner(playbook)
                        ? "bg-gradient-to-br from-blue-50/80 via-indigo-50/80 to-purple-50/80 border-2 border-blue-200/50 hover:border-indigo-400"
                        : "bg-gradient-to-br from-emerald-50/80 via-green-50/80 to-teal-50/80 border-2 border-emerald-200/50 hover:border-emerald-400"
                    } backdrop-blur-sm rounded-2xl p-8 overflow-hidden`}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-transparent"></div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white to-transparent rounded-full blur-2xl"></div>
                    </div>

                    {/* Header with Badges */}
                    <div className="relative z-10 flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3 flex-wrap">
                        {isOwner(playbook) ? (
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
                            <Crown className="w-4 h-4" />
                            Owner
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg">
                            <Users className="w-4 h-4" />
                            Collaborator
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold shadow-lg ${
                            playbook.is_published
                              ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white"
                              : "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                          }`}
                        >
                          {playbook.is_published ? (
                            <>
                              <Globe className="w-4 h-4" />
                              Live
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4" />
                              Draft
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Playbook Title */}
                    <h3 className="relative z-10 text-xl font-bold text-gray-900 mb-4 group-hover:text-indigo-700 transition-colors leading-tight">
                      {truncateTitle(playbook.title, 45)}
                    </h3>

                    {/* Description */}
                    <div className="relative z-10 mb-6">
                      {playbook.description ? (
                        <p className="text-gray-700 text-base leading-relaxed line-clamp-3">
                          {truncateDescription(playbook.description, 140)}
                        </p>
                      ) : playbook.content ? (
                        <p className="text-gray-600 text-base leading-relaxed line-clamp-3 italic">
                          {truncateDescription(
                            playbook.content.replace(/<[^>]*>/g, ""),
                            140
                          )}
                        </p>
                      ) : (
                        <p className="text-gray-500 text-base italic">
                          No description available
                        </p>
                      )}
                    </div>

                    {/* Team Members Section */}
                    <div className="relative z-10 mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            Team Members
                          </p>
                          <p className="text-xs text-gray-600">
                            {getTotalTeamMembersCount(playbook)} member
                            {getTotalTeamMembersCount(playbook) !== 1
                              ? "s"
                              : ""}{" "}
                            total
                          </p>
                        </div>
                      </div>
                      <div className="flex -space-x-3 overflow-hidden">
                        {/* Owner Avatar - Always show first */}
                        <div
                          className="inline-block h-10 w-10 rounded-full ring-4 ring-white relative group/avatar transform hover:scale-110 transition-transform duration-200"
                          title={`${
                            playbook.owner_profile?.username ||
                            playbook.owner_profile?.email ||
                            "Owner"
                          } (Owner)`}
                        >
                          {playbook.owner_profile?.avatar_url ? (
                            <img
                              src={playbook.owner_profile.avatar_url}
                              alt={`${
                                playbook.owner_profile.username ||
                                playbook.owner_profile.email ||
                                "Owner"
                              } (Owner)`}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                              {playbook.owner_profile?.username ? (
                                <span className="text-white font-bold text-sm">
                                  {playbook.owner_profile.username
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              ) : playbook.owner_profile?.email ? (
                                <span className="text-white font-bold text-sm">
                                  {playbook.owner_profile.email
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              ) : (
                                <Crown className="w-5 h-5 text-white" />
                              )}
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full border-2 border-white flex items-center justify-center">
                            <Crown className="w-2 h-2 text-white" />
                          </div>
                        </div>

                        {/* Collaborators Avatars */}
                        {playbook.collaborators &&
                          playbook.collaborators
                            .slice(0, 3)
                            .map((collab, idx) => (
                              <div
                                key={idx}
                                className="inline-block h-10 w-10 rounded-full ring-4 ring-white transform hover:scale-110 transition-transform duration-200"
                                title={collab.profile.username}
                              >
                                {collab.profile.avatar_url ? (
                                  <img
                                    src={collab.profile.avatar_url}
                                    alt={collab.profile.username}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                                    <span className="text-sm font-bold text-white">
                                      {collab.profile.username
                                        .charAt(0)
                                        .toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}

                        {/* Show +N for additional collaborators */}
                        {playbook.collaborators &&
                          playbook.collaborators.length > 3 && (
                            <div className="inline-block h-10 w-10 rounded-full ring-4 ring-white bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                              <span className="text-sm font-bold text-gray-700">
                                +{playbook.collaborators.length - 3}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="relative z-10 pt-4 border-t border-gray-200 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">
                          {formatDate(playbook.updated_at)}
                        </span>
                      </div>
                      {playbook.last_updated_by && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>
                            Last updated by{" "}
                            <span className="font-semibold text-gray-700">
                              {playbook.last_updated_by === user?.id
                                ? "you"
                                : playbook.last_updated_by_profile?.username ||
                                  playbook.last_updated_by_profile?.email ||
                                  "someone"}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="relative z-10 flex flex-wrap gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPlaybook(playbook)}
                        className="flex-1 min-w-[100px] bg-white/80 backdrop-blur-sm hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-all duration-300 font-semibold"
                        disabled={!playbook.is_published}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(`/playbook/${playbook.slug}`, "_blank")
                        }
                        className="px-4 bg-white/80 backdrop-blur-sm hover:bg-green-50 hover:border-green-400 hover:text-green-700 transition-all duration-300"
                        disabled={!playbook.is_published}
                        title="Open Public View"
                      >
                        <Globe className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPlaybook(playbook.slug)}
                        className="flex-1 min-w-[100px] bg-white/80 backdrop-blur-sm hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-700 transition-all duration-300 font-semibold"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePublish(playbook)}
                        className="px-4 bg-white/80 backdrop-blur-sm hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-700 transition-all duration-300"
                        title={playbook.is_published ? "Unpublish" : "Publish"}
                      >
                        {playbook.is_published ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Globe className="w-4 h-4" />
                        )}
                      </Button>
                      {isOwner(playbook) && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddCollaborator(playbook.id)}
                            className="px-4 bg-white/80 backdrop-blur-sm hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700 transition-all duration-300"
                            title="Add Collaborator"
                          >
                            <UserPlus className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(playbook)}
                            className="px-4 bg-white/80 backdrop-blur-sm text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-400 transition-all duration-300"
                            title="Delete Playbook"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team Members
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
                  {filteredPlaybooks.map((playbook) => (
                    <tr key={playbook.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {truncateTitle(playbook.title, 40)}
                            </div>
                            {playbook.description ? (
                              <div className="text-sm text-gray-600">
                                {truncateDescription(playbook.description, 60)}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">
                                ID: {playbook.id.slice(0, 8)}...
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isOwner(playbook) ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm">
                            <Crown className="w-3 h-3" />
                            Owner
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm">
                            <Users className="w-3 h-3" />
                            Collaborator
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                            playbook.is_published
                              ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                              : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                          }`}
                        >
                          {playbook.is_published ? (
                            <>
                              <Globe className="w-3 h-3" />
                              Published
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              Draft
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {getTotalTeamMembersCount(playbook)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(playbook.updated_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPlaybook(playbook)}
                            disabled={!playbook.is_published}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPlaybook(playbook.slug)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTogglePublish(playbook)}
                          >
                            {playbook.is_published ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Globe className="w-4 h-4" />
                            )}
                          </Button>
                          {isOwner(playbook) && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleAddCollaborator(playbook.id)
                                }
                              >
                                <UserPlus className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClick(playbook)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Modals */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({
            isOpen: false,
            playbook: null,
            confirmationWord: "",
          })
        }
        onConfirm={handleDeleteConfirm}
        playbookTitle={deleteModal.playbook?.title || ""}
        confirmationWord={deleteModal.confirmationWord}
      />

      <AddCollaboratorModal
        isOpen={addCollaboratorModal.isOpen}
        onClose={() =>
          setAddCollaboratorModal({ isOpen: false, playbookId: "" })
        }
        onAdd={handleAddCollaboratorConfirm}
        playbookId={addCollaboratorModal.playbookId}
      />
    </div>
  );
}
