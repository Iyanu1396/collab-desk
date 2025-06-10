"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Copy,
  Check,
  Calendar,
  User,
  Heart,
  MessageCircle,
  Code,
  Eye,
} from "lucide-react";
import Button from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { copyToClipboard, formatDate, truncateText } from "@/lib/utils";
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

interface ArticleCardProps {
  article: Article;
  onEmbed?: (article: Article) => void;
}

export default function ArticleCard({ article, onEmbed }: ArticleCardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [showEmbedCode, setShowEmbedCode] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await copyToClipboard(article.url);
      setIsCopied(true);
      toast.success("URL copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const handleCopyEmbedCode = async () => {
    const embedCode = `<iframe src="${article.url}/embed" width="100%" height="400" frameborder="0"></iframe>`;
    try {
      await copyToClipboard(embedCode);
      toast.success("Embed code copied to clipboard!");
    } catch {
      toast.error("Failed to copy embed code");
    }
  };

  const handleEmbedInEditor = () => {
    onEmbed?.(article);
    toast.success("Article embedded in editor!");
  };

  return (
    <Card hover className="group">
      <CardHeader className="pb-4">
        {article.cover_image && (
          <div className="aspect-video w-full mb-4 overflow-hidden rounded-lg">
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        <CardTitle className="line-clamp-2 group-hover:text-blue-600 transition-colors">
          {article.title}
        </CardTitle>

        {article.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mt-2">
            {truncateText(article.description, 120)}
          </p>
        )}

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{article.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            {article.user && (
              <div className="flex items-center gap-2">
                {article.user.profile_image && (
                  <img
                    src={article.user.profile_image}
                    alt={article.user.name}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {article.user.name}
                </span>
              </div>
            )}

            {article.published_at && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(article.published_at)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {article.public_reactions_count !== undefined && (
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {article.public_reactions_count}
              </span>
            )}

            {article.comments_count !== undefined && (
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {article.comments_count}
              </span>
            )}

            {article.reading_time_minutes && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {article.reading_time_minutes}m read
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyUrl}
              className="flex items-center gap-2"
            >
              {isCopied ? (
                <>
                  <Check className="w-3 h-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy URL
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmbedCode(!showEmbedCode)}
              className="flex items-center gap-2"
            >
              <Code className="w-3 h-3" />
              Embed
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {onEmbed && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleEmbedInEditor}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-3 h-3" />
                Add to Editor
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(article.url, "_blank")}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-3 h-3" />
              View
            </Button>
          </div>
        </div>

        {showEmbedCode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full mt-4 p-3 bg-gray-50 rounded-lg border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Embed Code:
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyEmbedCode}
                className="flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                Copy
              </Button>
            </div>
            <code className="text-xs text-gray-600 block bg-white p-2 rounded border font-mono">
              {`<iframe src="${article.url}/embed" width="100%" height="400" frameborder="0"></iframe>`}
            </code>
          </motion.div>
        )}
      </CardFooter>
    </Card>
  );
}
