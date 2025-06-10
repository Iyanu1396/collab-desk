 "use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Send,
  MoreHorizontal,
  Check,
  X,
  Reply,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Comment, CommentReply } from "@/types/collaboration";
import { createClient } from "@/lib/supabase/client";
import { useAuthQuery } from "@/hooks/use-auth-query";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import toast from "react-hot-toast";

interface LiveCommentsProps {
  playbookId: string;
  editorContainer?: HTMLElement | null;
}

interface CommentThread {
  comment: Comment;
  position: { x: number; y: number };
  isActive: boolean;
}

export default function LiveComments({
  playbookId,
  editorContainer,
}: LiveCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentThreads, setCommentThreads] = useState<CommentThread[]>([]);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [newCommentPosition, setNewCommentPosition] = useState<{
    from: number;
    to: number;
    x: number;
    y: number;
    selectedText: string;
  } | null>(null);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const { user } = useAuthQuery();
  const supabase = createClient();

  // Subscribe to real-time comment updates
  useEffect(() => {
    if (!playbookId) return;

    const channel = supabase
      .channel(`comments-${playbookId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "playbook_comments",
          filter: `playbook_id=eq.${playbookId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newComment = payload.new as Comment;
            setComments((prev) => [...prev, newComment]);
            toast.success(`New comment from ${newComment.user_profile.username}`);
          } else if (payload.eventType === "UPDATE") {
            setComments((prev) =>
              prev.map((comment) =>
                comment.id === payload.new.id ? (payload.new as Comment) : comment
              )
            );
          } else if (payload.eventType === "DELETE") {
            setComments((prev) =>
              prev.filter((comment) => comment.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Load existing comments
    loadComments();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [playbookId]);

  // Update comment thread positions when comments change
  useEffect(() => {
    if (!editorContainer) return;

    const threads = comments.map((comment) => {
      const containerRect = editorContainer.getBoundingClientRect();
      // This is a simplified position calculation
      // In a real implementation, you'd need to map text positions to pixel coordinates
      const x = containerRect.width - 300; // Position comments on the right side
      const y = Math.max(50, comment.position.from * 0.5); // Rough estimation

      return {
        comment,
        position: { x, y },
        isActive: !comment.resolved,
      };
    });

    setCommentThreads(threads);
  }, [comments, editorContainer]);

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from("playbook_comments")
        .select(`
          *,
          user_profile:profiles(username, avatar_url),
          replies:comment_replies(
            *,
            user_profile:profiles(username, avatar_url)
          )
        `)
        .eq("playbook_id", playbookId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Failed to load comments:", error);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || !editorContainer || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();

    if (selectedText.length === 0) return;

    const containerRect = editorContainer.getBoundingClientRect();
    const rangeRect = range.getBoundingClientRect();

    setNewCommentPosition({
      from: range.startOffset,
      to: range.endOffset,
      x: rangeRect.right - containerRect.left + 10,
      y: rangeRect.top - containerRect.top,
      selectedText,
    });
    setIsAddingComment(true);
  };

  const createComment = async () => {
    if (!newCommentPosition || !newCommentContent.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from("playbook_comments")
        .insert({
          playbook_id: playbookId,
          user_id: user.id,
          content: newCommentContent,
          position: {
            from: newCommentPosition.from,
            to: newCommentPosition.to,
            text_selection: newCommentPosition.selectedText,
          },
          resolved: false,
        })
        .select(`
          *,
          user_profile:profiles(username, avatar_url)
        `)
        .single();

      if (error) throw error;

      setNewCommentContent("");
      setIsAddingComment(false);
      setNewCommentPosition(null);
      toast.success("Comment added!");
    } catch (error) {
      console.error("Failed to create comment:", error);
      toast.error("Failed to create comment");
    }
  };

  const resolveComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("playbook_comments")
        .update({ resolved: true })
        .eq("id", commentId);

      if (error) throw error;
      toast.success("Comment resolved!");
    } catch (error) {
      console.error("Failed to resolve comment:", error);
      toast.error("Failed to resolve comment");
    }
  };

  const addReply = async (commentId: string) => {
    if (!replyContent.trim() || !user) return;

    try {
      const { error } = await supabase
        .from("comment_replies")
        .insert({
          comment_id: commentId,
          user_id: user.id,
          content: replyContent,
        });

      if (error) throw error;

      setReplyContent("");
      setReplyingTo(null);
      toast.success("Reply added!");
    } catch (error) {
      console.error("Failed to add reply:", error);
      toast.error("Failed to add reply");
    }
  };

  return (
    <div className="relative">
      {/* Selection Handler */}
      <div
        className="absolute inset-0 pointer-events-none"
        onMouseUp={handleTextSelection}
      />

      {/* New Comment Form */}
      <AnimatePresence>
        {isAddingComment && newCommentPosition && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute z-50"
            style={{
              left: newCommentPosition.x,
              top: newCommentPosition.y,
            }}
          >
            <Card className="w-80 p-4 shadow-xl border-2 border-blue-200">
              <div className="space-y-3">
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  "{newCommentPosition.selectedText}"
                </div>
                <textarea
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-2 border border-gray-200 rounded resize-none"
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAddingComment(false);
                      setNewCommentPosition(null);
                      setNewCommentContent("");
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={createComment}
                    disabled={!newCommentContent.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Comment
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment Threads */}
      <AnimatePresence>
        {commentThreads.map((thread) => (
          <motion.div
            key={thread.comment.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute z-40"
            style={{
              left: thread.position.x,
              top: thread.position.y,
            }}
          >
            <Card className={`w-80 p-4 shadow-lg ${
              thread.comment.resolved ? 'bg-gray-50 opacity-75' : 'bg-white'
            }`}>
              <div className="space-y-3">
                {/* Comment Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {thread.comment.user_profile.avatar_url ? (
                      <img
                        src={thread.comment.user_profile.avatar_url}
                        alt={thread.comment.user_profile.username}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {thread.comment.user_profile.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium">
                      {thread.comment.user_profile.username}
                    </span>
                    {thread.comment.resolved && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {!thread.comment.resolved && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resolveComment(thread.comment.id)}
                        className="px-2 py-1"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-2 py-1"
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Selected Text */}
                <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded border-l-2 border-yellow-300">
                  "{thread.comment.position.text_selection}"
                </div>

                {/* Comment Content */}
                <div className="text-sm text-gray-800">
                  {thread.comment.content}
                </div>

                {/* Replies */}
                {thread.comment.replies.length > 0 && (
                  <div className="space-y-2 ml-4 border-l-2 border-gray-100 pl-4">
                    {thread.comment.replies.map((reply) => (
                      <div key={reply.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {reply.user_profile.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-medium text-gray-600">
                            {reply.user_profile.username}
                          </span>
                        </div>
                        <div className="text-xs text-gray-700">
                          {reply.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                {replyingTo === thread.comment.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      className="w-full p-2 text-sm border border-gray-200 rounded resize-none"
                      rows={2}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReplyingTo(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => addReply(thread.comment.id)}
                        disabled={!replyContent.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                ) : (
                  !thread.comment.resolved && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReplyingTo(thread.comment.id)}
                      className="w-full"
                    >
                      <Reply className="w-3 h-3 mr-1" />
                      Reply
                    </Button>
                  )
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}