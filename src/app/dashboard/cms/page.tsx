"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Search,
  Filter,
  RefreshCw,
  Globe,
  AlertCircle,
  Loader2,
  Grid,
  List,
  Calendar,
  Copy,
  ExternalLink,
  Check,
  ChevronRight,
  Tag,
  TrendingUp,
  Clock,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Article {
  id: number;
  title: string;
  url: string;
  description?: string;
  published_at?: string;
  user?: {
    name: string;
    profile_image?: string;
  };
  public_reactions_count?: number;
  comments_count?: number;
  reading_time_minutes?: number;
  tags?: string[];
  cover_image?: string;
}

interface PaginationInfo {
  current_page: number;
  per_page: number;
  total_articles: number;
  has_more: boolean;
}

interface FilterState {
  tag: string;
  dateRange: string;
  state: string;
  username: string;
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
};

const getDateFilter = (range: string) => {
  const now = new Date();
  switch (range) {
    case "today":
      return Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
    case "week":
      return Math.floor(
        (now.getTime() - 7 * 24 * 60 * 60 * 1000) / (1000 * 60 * 60 * 24)
      );
    case "month":
      return Math.floor(
        (now.getTime() - 30 * 24 * 60 * 60 * 1000) / (1000 * 60 * 60 * 1000)
      );
    default:
      return "";
  }
};

export default function CMSExplorer() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [refreshing, setRefreshing] = useState(false);
  const [copiedStates, setCopiedStates] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    tag: "",
    dateRange: "",
    state: "fresh",
    username: "",
  });
  const [debouncedUsername, setDebouncedUsername] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const router = useRouter();

  // Debounce username filter to prevent reload on every keystroke
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedUsername(filters.username);
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [filters.username]);

  const buildApiUrl = useCallback(
    (page: number) => {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: "30",
        state: filters.state,
      });

      if (filters.tag) params.set("tag", filters.tag);
      if (debouncedUsername) params.set("username", debouncedUsername);
      if (filters.dateRange) {
        const topValue = getDateFilter(filters.dateRange);
        if (topValue) params.set("top", topValue.toString());
      }

      return `/api/devto?${params.toString()}`;
    },
    [filters.tag, filters.dateRange, filters.state, debouncedUsername]
  );

  const fetchArticles = async (page: number = 1, append: boolean = false) => {
    try {
      setError(null);
      if (!append) setLoading(true);
      if (append) setIsLoadingMore(true);

      const response = await fetch(buildApiUrl(page));

      if (!response.ok) {
        throw new Error("Failed to fetch articles");
      }

      const data = await response.json();

      // Handle both old and new API response formats
      const articles = data.articles || data; // New format has 'articles' property, old format is direct array
      const paginationInfo = data.pagination || {
        current_page: page,
        per_page: 30,
        total_articles: articles.length,
        has_more: articles.length === 30, // Estimate if there are more
      };

      if (append) {
        setArticles((prev) => [...prev, ...articles]);
        toast.success(`Loaded ${articles.length} more articles!`);
      } else {
        setArticles(articles);
        setCurrentPage(1);
      }

      setPagination(paginationInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [buildApiUrl]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await fetchArticles(1);
  };

  const handleLoadMore = async () => {
    if (pagination?.has_more) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      await fetchArticles(nextPage, true);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      tag: "",
      dateRange: "",
      state: "fresh",
      username: "",
    });
    setDebouncedUsername("");
    setSearchTerm("");
  };

  const handleCopyEmbedCode = async (article: Article) => {
    const embedCode = `<iframe src="${article.url}/embed" width="100%" height="400" frameborder="0"></iframe>`;
    const success = await copyToClipboard(embedCode);

    if (success) {
      setCopiedStates((prev) => ({ ...prev, [article.id]: true }));
      toast.success("Embed code copied to clipboard!");
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [article.id]: false }));
      }, 2000);
    } else {
      toast.error("Failed to copy embed code");
    }
  };

  const handleEmbedInEditor = (article: Article) => {
    // Create a formatted article content for the editor
    const articleContent = `
      <div class="cms-embed border border-gray-200 rounded-lg p-6 my-4 bg-gray-50">
        <div class="flex items-start gap-4">
          ${
            article.cover_image
              ? `
            <div class="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
              <img src="${article.cover_image}" alt="${article.title}" class="w-full h-full object-cover" loading="lazy" />
            </div>
          `
              : ""
          }
          <div class="flex-1">
            <h3 class="font-semibold text-xl mb-3 text-gray-900">${
              article.title
            }</h3>
            ${
              article.description
                ? `<p class="text-gray-600 text-base mb-4">${article.description}</p>`
                : ""
            }
            <div class="flex items-center gap-3 text-sm text-gray-500">
              <span>By ${article.user?.name || "Unknown"}</span>
              <span>•</span>
              ${
                article.published_at
                  ? `<span>${formatDate(article.published_at)}</span>`
                  : ""
              }
              <span>•</span>
              <a href="${
                article.url
              }" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">
                Read on Dev.to →
              </a>
            </div>
            ${
              article.public_reactions_count !== undefined ||
              article.comments_count !== undefined
                ? `
              <div class="flex items-center gap-4 mt-3 text-sm text-gray-500">
                ${
                  article.public_reactions_count !== undefined
                    ? `<span>❤️ ${article.public_reactions_count} likes</span>`
                    : ""
                }
                ${
                  article.comments_count !== undefined
                    ? `<span>💬 ${article.comments_count} comments</span>`
                    : ""
                }
              </div>
            `
                : ""
            }
          </div>
        </div>
      </div>
      <p><br></p>
      <p>Add your thoughts and analysis about this article here...</p>
    `;

    // Navigate to new playbook with pre-filled content
    const encodedContent = encodeURIComponent(articleContent);
    const suggestedTitle = `Analysis: ${article.title}`;
    const encodedTitle = encodeURIComponent(suggestedTitle);

    router.push(
      `/dashboard/playbooks/new?title=${encodedTitle}&content=${encodedContent}`
    );

    toast.success(`Opening new playbook with "${article.title}"!`);
  };

  const filteredArticles = articles.filter((article) => {
    // Only show articles that have cover images
    if (!article.cover_image) {
      return false;
    }

    const searchLower = searchTerm.toLowerCase();
    return (
      article.title?.toLowerCase().includes(searchLower) ||
      article.description?.toLowerCase().includes(searchLower) ||
      article.user?.name?.toLowerCase().includes(searchLower) ||
      article.tags?.some((tag) => tag?.toLowerCase().includes(searchLower))
    );
  });

  const hasActiveFilters =
    filters.tag ||
    filters.dateRange ||
    filters.username ||
    filters.state !== "fresh";

  if (loading && articles.length === 0) {
    return (
      <div className="p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-white min-h-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Loading Articles
              </h3>
              <p className="text-gray-600">
                Fetching the latest content from Dev.to...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && articles.length === 0) {
    return (
      <div className="p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-white min-h-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md">
              <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Failed to Load Articles
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-white min-h-full">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              CMS Explorer
            </h1>
            <p className="text-gray-600 text-lg mt-1">
              Browse and embed articles from Dev.to community
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white border rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles, authors, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
                hasActiveFilters
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {
                    [
                      filters.tag,
                      filters.dateRange,
                      filters.username,
                      filters.state !== "fresh" ? "1" : "",
                    ].filter(Boolean).length
                  }
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-4 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tag
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="e.g. javascript"
                      value={filters.tag}
                      onChange={(e) =>
                        handleFilterChange("tag", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) =>
                      handleFilterChange("dateRange", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All time</option>
                    <option value="today">Today</option>
                    <option value="week">This week</option>
                    <option value="month">This month</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type
                  </label>
                  <select
                    value={filters.state}
                    onChange={(e) =>
                      handleFilterChange("state", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="fresh">Fresh</option>
                    <option value="rising">Rising</option>
                    <option value="all">All</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author
                  </label>
                  <input
                    type="text"
                    placeholder="Username"
                    value={filters.username}
                    onChange={(e) =>
                      handleFilterChange("username", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {articles.length}
                </p>
                <p className="text-sm text-gray-600">Total Articles</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Search className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredArticles.length}
                </p>
                <p className="text-sm text-gray-600">Search Results</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {pagination?.current_page || 1}
                </p>
                <p className="text-sm text-gray-600">Current Page</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {filters.state}
                </p>
                <p className="text-sm text-gray-600">Content Filter</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {(searchTerm || hasActiveFilters) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <Search className="w-4 h-4" />
              <span className="font-medium">
                {filteredArticles.length === 0
                  ? "No articles found"
                  : `Found ${filteredArticles.length} article${
                      filteredArticles.length === 1 ? "" : "s"
                    }`}
                {searchTerm && ` matching "${searchTerm}"`}
                {hasActiveFilters && " with current filters"}
              </span>
            </div>
          </div>
        )}

        {/* Articles Grid/List */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl p-12 shadow-lg max-w-md mx-auto">
              <Search className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                No articles found
              </h3>
              <p className="text-gray-600 text-lg mb-6">
                {searchTerm || hasActiveFilters
                  ? "Try adjusting your search terms or filters"
                  : "No articles available at the moment"}
              </p>
              {(searchTerm || hasActiveFilters) && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  : "space-y-6"
              }
            >
              {filteredArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={viewMode === "grid" ? "" : "flex gap-6"}
                >
                  <div
                    className={`bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer ${
                      viewMode === "grid" ? "p-6" : "p-6 flex-1"
                    }`}
                  >
                    {viewMode === "grid" && article.cover_image && (
                      <div className="aspect-video w-full mb-6 overflow-hidden rounded-xl">
                        <Image
                          src={article.cover_image}
                          alt={article.title}
                          width={400}
                          height={225}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          unoptimized
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="font-semibold text-xl text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                        {article.title}
                      </h3>

                      {article.description && (
                        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                          {article.description}
                        </p>
                      )}

                      {/* Tags */}
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {article.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                              onClick={() => handleFilterChange("tag", tag)}
                            >
                              #{tag}
                            </span>
                          ))}
                          {article.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{article.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-3">
                          {article.user && (
                            <div className="flex items-center gap-2">
                              {article.user.profile_image && (
                                <Image
                                  src={article.user.profile_image}
                                  alt={article.user.name}
                                  width={24}
                                  height={24}
                                  className="w-6 h-6 rounded-full"
                                  unoptimized
                                />
                              )}
                              <span className="font-medium">
                                {article.user.name}
                              </span>
                            </div>
                          )}
                          {article.published_at && (
                            <>
                              <span>•</span>
                              <span>{formatDate(article.published_at)}</span>
                            </>
                          )}
                          {article.reading_time_minutes && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {article.reading_time_minutes} min read
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {article.public_reactions_count !== undefined && (
                            <span className="flex items-center gap-1">
                              ❤️ {article.public_reactions_count}
                            </span>
                          )}
                          {article.comments_count !== undefined && (
                            <span className="flex items-center gap-1">
                              💬 {article.comments_count}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleCopyEmbedCode(article)}
                          className="flex-1 flex items-center justify-center gap-2 text-sm bg-blue-50 text-blue-700 px-4 py-2.5 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                        >
                          {copiedStates[article.id] ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy Embed
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleEmbedInEditor(article)}
                          className="flex-1 flex items-center justify-center gap-2 text-sm bg-green-50 text-green-700 px-4 py-2.5 rounded-lg hover:bg-green-100 transition-colors font-medium"
                        >
                          Add to Editor
                        </button>

                        <button
                          onClick={() => window.open(article.url, "_blank")}
                          className="text-sm bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 font-medium"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Load More Button */}
            {pagination?.has_more && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading more...
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-5 h-5" />
                      Load More Articles
                    </>
                  )}
                </button>
                <p className="text-sm text-gray-600 mt-2">
                  Showing {filteredArticles.length} articles • Page{" "}
                  {pagination.current_page}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
