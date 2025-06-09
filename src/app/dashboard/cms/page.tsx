"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  const router = useRouter();

  const fetchArticles = async () => {
    try {
      setError(null);
      const response = await fetch("/api/devto");

      if (!response.ok) {
        throw new Error("Failed to fetch articles");
      }

      const data = await response.json();
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchArticles();
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
              <img src="${article.cover_image}" alt="${article.title}" class="w-full h-full object-cover" />
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

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
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
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <>
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div
        className="h-full max-h-screen overflow-y-auto scrollbar-hide p-6 space-y-6"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              CMS Explorer
            </h1>
            <p className="text-gray-600 mt-1">
              Browse and embed articles from Dev.to community
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white border rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${
                  viewMode === "grid"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
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

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Search className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredArticles.length}
                </p>
                <p className="text-sm text-gray-600">Filtered Results</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">Latest</p>
                <p className="text-sm text-gray-600">Fresh Content</p>
              </div>
            </div>
          </div>
        </div>

        {/* Articles Grid/List */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No articles found
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Try adjusting your search terms"
                : "No articles available at the moment"}
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={viewMode === "grid" ? "" : "flex gap-4"}
              >
                <div
                  className={`bg-white rounded-lg border hover:shadow-md transition-all duration-200 group ${
                    viewMode === "grid" ? "p-6" : "p-4 flex-1"
                  }`}
                >
                  {viewMode === "grid" && article.cover_image && (
                    <div className="aspect-video w-full mb-4 overflow-hidden rounded-lg">
                      <img
                        src={article.cover_image}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>

                    {article.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {article.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-3">
                        {article.user && (
                          <span className="flex items-center gap-1">
                            {article.user.profile_image && (
                              <img
                                src={article.user.profile_image}
                                alt={article.user.name}
                                className="w-4 h-4 rounded-full"
                              />
                            )}
                            {article.user.name}
                          </span>
                        )}
                        {article.published_at && (
                          <span>{formatDate(article.published_at)}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {article.public_reactions_count !== undefined && (
                          <span>❤️ {article.public_reactions_count}</span>
                        )}
                        {article.comments_count !== undefined && (
                          <span>💬 {article.comments_count}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyEmbedCode(article)}
                        className="flex-1 flex items-center justify-center gap-1 text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        {copiedStates[article.id] ? (
                          <>
                            <Check className="w-3 h-3" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy Embed
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleEmbedInEditor(article)}
                        className="flex-1 flex items-center justify-center gap-1 text-xs bg-green-50 text-green-700 px-3 py-2 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        Add to Editor
                      </button>

                      <button
                        onClick={() => window.open(article.url, "_blank")}
                        className="text-xs bg-gray-50 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
