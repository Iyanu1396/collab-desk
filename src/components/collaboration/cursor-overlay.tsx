"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPresence } from "@/hooks/use-collaboration-presence";

interface CursorOverlayProps {
  users: UserPresence[];
  editorContainer?: HTMLElement | null;
}

interface CursorData {
  user: UserPresence;
  x: number;
  y: number;
}

export default function CursorOverlay({
  users,
  editorContainer,
}: CursorOverlayProps) {
  const [cursors, setCursors] = useState<CursorData[]>([]);

  // Function to get color for user cursor
  const getUserColor = (userId: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-orange-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-teal-500",
    ];
    const index = userId
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  useEffect(() => {
    if (!editorContainer) return;

    const updateCursors = () => {
      const newCursors: CursorData[] = [];

      users.forEach((user) => {
        if (user.cursor_position?.coords) {
          const containerRect = editorContainer.getBoundingClientRect();
          const x = user.cursor_position.coords.x - containerRect.left;
          const y = user.cursor_position.coords.y - containerRect.top;

          // Only show cursors that are within the editor container bounds
          if (
            x >= 0 &&
            x <= containerRect.width &&
            y >= 0 &&
            y <= containerRect.height
          ) {
            newCursors.push({
              user,
              x,
              y,
            });
          }
        }
      });

      setCursors(newCursors);
    };

    updateCursors();

    // Update cursor positions when window resizes or scrolls
    const handleUpdate = () => updateCursors();
    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate);

    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate);
    };
  }, [users, editorContainer]);

  if (!editorContainer) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <AnimatePresence>
        {cursors.map((cursor) => (
          <motion.div
            key={cursor.user.user_id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute"
            style={{
              left: cursor.x,
              top: cursor.y,
              transform: "translate(-2px, -2px)",
            }}
          >
            {/* Cursor pointer */}
            <div className="relative">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="drop-shadow-md"
              >
                <path
                  d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                  fill="white"
                  stroke="#374151"
                  strokeWidth="1"
                />
              </svg>

              {/* Enhanced User avatar and name label */}
              <motion.div
                initial={{ opacity: 0, x: -10, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute top-0 left-6 bg-white rounded-xl shadow-xl border border-gray-200 px-3 py-2 flex items-center gap-3 whitespace-nowrap min-w-[200px] backdrop-blur-sm"
                style={{
                  boxShadow:
                    "0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)",
                }}
              >
                {/* Avatar with status ring */}
                <div className="relative flex-shrink-0">
                  {cursor.user.avatar_url ? (
                    <img
                      src={cursor.user.avatar_url}
                      alt={cursor.user.username || "User"}
                      className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm ${getUserColor(
                        cursor.user.user_id
                      )}`}
                    >
                      {(cursor.user.username || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  {/* Status indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800 truncate">
                    {cursor.user.username || "Anonymous"}
                  </div>
                  {cursor.user.email && (
                    <div className="text-xs text-gray-500 truncate">
                      {cursor.user.email}
                    </div>
                  )}
                </div>

                {/* Editing indicator */}
                {cursor.user.is_editing && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-full flex-shrink-0">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-orange-700">
                      Editing
                    </span>
                  </div>
                )}

                {/* Pointer arrow */}
                <div
                  className="absolute -bottom-1 left-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"
                  style={{
                    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
                  }}
                ></div>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
