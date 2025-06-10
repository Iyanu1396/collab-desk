"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Eye,
  Edit,
  Wifi,
  WifiOff,
  UserCheck,
  Clock,
  Minimize2,
  Maximize2,
  X,
  Mail,
} from "lucide-react";
import { UserPresence } from "@/hooks/use-collaboration-presence";
import { useState } from "react";
import ChatPanel from "./chat-panel";

interface PresenceIndicatorProps {
  otherUsers: UserPresence[];
  activeUsersCount: number;
  isConnected: boolean;
  editingUsers?: UserPresence[];
  viewingUsers?: UserPresence[];
  className?: string;
  sticky?: boolean;
}

interface UserModalProps {
  user: UserPresence;
  isOpen: boolean;
  onClose: () => void;
  getUserColor: (userId: string) => string;
  formatTimeAgo: (timestamp: string) => string;
}

function UserModal({
  user,
  isOpen,
  onClose,
  getUserColor,
  formatTimeAgo,
}: UserModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white rounded-xl shadow-2xl border border-gray-200 p-6 mx-4 max-w-sm w-full"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Info */}
        <div className="text-center">
          {/* Avatar */}
          <div className="relative mx-auto mb-4">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.username || "User"}
                className="w-20 h-20 rounded-full border-4 border-gray-200 shadow-lg"
              />
            ) : (
              <div
                className={`w-20 h-20 rounded-full border-4 border-gray-200 shadow-lg flex items-center justify-center text-white text-2xl font-bold ${getUserColor(
                  user.user_id
                )}`}
              >
                {(user.username || "U").charAt(0).toUpperCase()}
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-lg">
              {user.is_editing ? (
                <Edit className="w-4 h-4 text-orange-500" />
              ) : user.page_focus ? (
                <Eye className="w-4 h-4 text-green-500" />
              ) : (
                <div className="w-4 h-4 bg-gray-400 rounded-full" />
              )}
            </div>
          </div>

          {/* User Details */}
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {user.username || "Anonymous User"}
          </h3>

          {user.email && (
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-3">
              <Mail className="w-4 h-4" />
              <span className="text-sm">{user.email}</span>
            </div>
          )}

          {/* Status */}
          <div className="space-y-2 mb-4">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                user.is_editing
                  ? "bg-orange-100 text-orange-700"
                  : user.page_focus
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {user.is_editing ? (
                <>
                  <Edit className="w-4 h-4" />
                  Currently Editing
                </>
              ) : user.page_focus ? (
                <>
                  <Eye className="w-4 h-4" />
                  Currently Viewing
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  Away
                </>
              )}
            </div>

            <div className="flex items-center justify-center gap-1 text-gray-500 text-xs">
              <Clock className="w-3 h-3" />
              Last seen {formatTimeAgo(user.online_at)}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function PresenceIndicator({
  otherUsers,
  activeUsersCount,
  isConnected,
  editingUsers = [],
  viewingUsers = [],
  className = "",
  sticky = false,
  playbookId,
}: PresenceIndicatorProps & { playbookId?: string }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserPresence | null>(null);
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  // Generate consistent colors for users
  const getUserColor = (userId: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-indigo-500",
      "bg-pink-500",
      "bg-teal-500",
    ];
    const index = userId
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  if (sticky) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`fixed top-4 right-4 z-50 bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-gray-200 ${
            isMinimized ? "p-3" : "p-4"
          } min-w-[280px] max-w-[380px] ${className}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-500" />
              {isMinimized ? "" : "Active Collaborators"}
            </h3>
            <div className="flex items-center gap-2">
              {!isMinimized && (
                <div className="flex items-center gap-1">
                  {isConnected ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full">
                    {isConnected ? `${activeUsersCount} online` : "Offline"}
                  </span>
                </div>
              )}

              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Minimized View */}
          {isMinimized ? (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                {otherUsers.slice(0, 4).map((user) => (
                  <button
                    key={user.user_id}
                    onClick={() => setSelectedUser(user)}
                    className="relative group"
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username || "User"}
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform cursor-pointer"
                      />
                    ) : (
                      <div
                        className={`w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-semibold hover:scale-110 transition-transform cursor-pointer ${getUserColor(
                          user.user_id
                        )}`}
                      >
                        {(user.username || "U").charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Status Indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5">
                      {user.is_editing ? (
                        <Edit className="w-3 h-3 text-orange-500 bg-white rounded-full p-0.5 shadow-sm" />
                      ) : user.page_focus ? (
                        <Eye className="w-3 h-3 text-green-500 bg-white rounded-full p-0.5 shadow-sm" />
                      ) : (
                        <div className="w-2 h-2 bg-gray-400 rounded-full border border-white shadow-sm" />
                      )}
                    </div>
                  </button>
                ))}

                {otherUsers.length > 4 && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center text-gray-600 text-xs font-semibold">
                    +{otherUsers.length - 4}
                  </div>
                )}
              </div>

              {isConnected && (
                <div className="flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-gray-500">
                    {activeUsersCount}
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Expanded View */
            <div>
              {/* Currently Editing */}
              <AnimatePresence>
                {editingUsers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Edit className="w-3 h-3 text-orange-500" />
                      <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
                        Editing Now
                      </span>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                      {editingUsers.map((user) => (
                        <motion.button
                          key={user.user_id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => setSelectedUser(user)}
                          className="w-full flex items-center gap-3 p-2 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors"
                        >
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.username || "User"}
                              className="w-8 h-8 rounded-full border-2 border-orange-300 shadow-sm"
                            />
                          ) : (
                            <div
                              className={`w-8 h-8 rounded-full border-2 border-orange-300 shadow-sm flex items-center justify-center text-white text-xs font-semibold ${getUserColor(
                                user.user_id
                              )}`}
                            >
                              {(user.username || "U").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-gray-900">
                              {user.username || "Anonymous"}
                            </p>
                            <p className="text-xs text-orange-600 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(user.online_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-orange-600 font-medium">
                              Active
                            </span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Currently Viewing */}
              <AnimatePresence>
                {viewingUsers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-3 h-3 text-green-500" />
                      <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                        Viewing
                      </span>
                    </div>
                    <div className="space-y-2">
                      {viewingUsers.map((user) => (
                        <motion.button
                          key={user.user_id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => setSelectedUser(user)}
                          className="w-full flex items-center gap-3 p-2 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                        >
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.username || "User"}
                              className="w-8 h-8 rounded-full border-2 border-green-300 shadow-sm"
                            />
                          ) : (
                            <div
                              className={`w-8 h-8 rounded-full border-2 border-green-300 shadow-sm flex items-center justify-center text-white text-xs font-semibold ${getUserColor(
                                user.user_id
                              )}`}
                            >
                              {(user.username || "U").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-gray-900">
                              {user.username || "Anonymous"}
                            </p>
                            <p className="text-xs text-green-600 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(user.online_at)}
                            </p>
                          </div>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* All Users Summary */}
              {otherUsers.length > 0 && (
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      All Collaborators
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {otherUsers.length} user{otherUsers.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {otherUsers.slice(0, 6).map((user) => (
                      <button
                        key={user.user_id}
                        onClick={() => setSelectedUser(user)}
                        className="relative group"
                      >
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.username || "User"}
                            className="w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform cursor-pointer"
                          />
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-semibold hover:scale-110 transition-transform cursor-pointer ${getUserColor(
                              user.user_id
                            )}`}
                          >
                            {(user.username || "U").charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* Status Indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5">
                          {user.is_editing ? (
                            <Edit className="w-3 h-3 text-orange-500 bg-white rounded-full p-0.5 shadow-sm" />
                          ) : user.page_focus ? (
                            <Eye className="w-3 h-3 text-green-500 bg-white rounded-full p-0.5 shadow-sm" />
                          ) : (
                            <div className="w-2 h-2 bg-gray-400 rounded-full border border-white shadow-sm" />
                          )}
                        </div>
                      </button>
                    ))}

                    {otherUsers.length > 6 && (
                      <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center text-gray-600 text-xs font-semibold">
                        +{otherUsers.length - 6}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {otherUsers.length === 0 && isConnected && (
                <div className="text-center py-6">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Working solo
                  </p>
                  <p className="text-xs text-gray-400">
                    Share this document to collaborate in real-time
                  </p>
                </div>
              )}

              {!isConnected && (
                <div className="text-center py-6 bg-red-50 rounded-lg border border-red-200">
                  <WifiOff className="w-12 h-12 text-red-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-red-600 mb-1">
                    Connection Lost
                  </p>
                  <p className="text-xs text-red-500">Trying to reconnect...</p>
                </div>
              )}
            </div>
          )}

          {/* Chat Panel - only show when not minimized and playbookId is available */}
          {!isMinimized && playbookId && (
            <ChatPanel
              playbookId={playbookId}
              isExpanded={isChatExpanded}
              onToggle={() => setIsChatExpanded(!isChatExpanded)}
            />
          )}
        </motion.div>

        {/* User Detail Modal */}
        <AnimatePresence>
          {selectedUser && (
            <UserModal
              user={selectedUser}
              isOpen={!!selectedUser}
              onClose={() => setSelectedUser(null)}
              getUserColor={getUserColor}
              formatTimeAgo={formatTimeAgo}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  // Non-sticky compact version
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
        <span className="text-sm text-gray-600 font-medium">
          {isConnected ? `${activeUsersCount} online` : "Disconnected"}
        </span>
      </div>

      {/* User Avatars */}
      {otherUsers.length > 0 && (
        <div className="flex items-center">
          <div className="flex -space-x-2">
            <AnimatePresence>
              {otherUsers.slice(0, 3).map((user) => (
                <motion.div
                  key={user.user_id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="relative group"
                >
                  {/* Avatar */}
                  <div className="relative">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username || "User"}
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div
                        className={`w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-semibold ${getUserColor(
                          user.user_id
                        )}`}
                      >
                        {(user.username || "U").charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Status Indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5">
                      {user.is_editing ? (
                        <Edit className="w-3 h-3 text-orange-500 bg-white rounded-full p-0.5" />
                      ) : user.page_focus ? (
                        <Eye className="w-3 h-3 text-green-500 bg-white rounded-full p-0.5" />
                      ) : (
                        <div className="w-2 h-2 bg-gray-400 rounded-full border border-white" />
                      )}
                    </div>
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="font-medium">
                      {user.username || "Anonymous"}
                    </div>
                    <div className="text-gray-300">
                      {user.is_editing
                        ? "Editing"
                        : user.page_focus
                        ? "Viewing"
                        : "Away"}{" "}
                      • {formatTimeAgo(user.online_at)}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Overflow indicator */}
          {otherUsers.length > 3 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center text-gray-600 text-xs font-semibold ml-1"
            >
              +{otherUsers.length - 3}
            </motion.div>
          )}
        </div>
      )}

      {/* Empty state */}
      {otherUsers.length === 0 && isConnected && (
        <div className="flex items-center gap-2 text-gray-500">
          <Users className="w-4 h-4" />
          <span className="text-sm">Only you</span>
        </div>
      )}
    </div>
  );
}
