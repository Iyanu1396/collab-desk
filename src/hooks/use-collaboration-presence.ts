import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthQuery } from "./use-auth-query";
import toast from "react-hot-toast";

export interface UserPresence {
  user_id: string;
  username?: string;
  avatar_url?: string;
  email?: string;
  online_at: string;
  cursor_position?: {
    from: number;
    to: number;
    coords?: { x: number; y: number };
  };
  is_editing?: boolean;
  page_focus?: boolean;
}

interface UserProfile {
  user_id: string;
  username: string;
  avatar_url?: string;
  email?: string;
}

interface UseCollaborationPresenceProps {
  playbookId: string;
  enabled?: boolean;
}

export function useCollaborationPresence({
  playbookId,
  enabled = true,
}: UseCollaborationPresenceProps) {
  const [presenceState, setPresenceState] = useState<
    Record<string, UserPresence>
  >({});
  const [isConnected, setIsConnected] = useState(false);
  const [userProfiles, setUserProfiles] = useState<Map<string, UserProfile>>(
    new Map()
  );
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const { user } = useAuthQuery();
  const supabase = createClient();

  // Fetch user profile from profiles table
  const fetchUserProfile = async (
    userId: string
  ): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url, email")
        .eq("user_id", userId)
        .single();

      if (error || !data) return null;
      return data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  // Create presence data with user profile info
  const createPresenceData = async (overrides = {}) => {
    if (!user) return null;

    let profile = userProfiles.get(user.id);
    if (!profile) {
      profile = await fetchUserProfile(user.id);
      if (profile) {
        setUserProfiles((prev) => new Map(prev).set(user.id, profile!));
      }
    }

    return {
      user_id: user.id,
      username:
        profile?.username ||
        user.user_metadata?.username ||
        user.email?.split("@")[0] ||
        "Anonymous",
      avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || null,
      email: profile?.email || user.email,
      online_at: new Date().toISOString(),
      is_editing: false,
      page_focus: true,
      ...overrides,
    };
  };

  useEffect(() => {
    if (!enabled || !user || !playbookId) return;

    const channel = supabase.channel(`collaboration-${playbookId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channelRef.current = channel;

    // Subscribe to presence state changes
    channel
      .on("presence", { event: "sync" }, async () => {
        const state = channel.presenceState();
        const transformedState: Record<string, UserPresence> = {};

        // Process each user's presence
        for (const [userId, presences] of Object.entries(state)) {
          if (presences && presences.length > 0) {
            const presence = presences[0] as UserPresence;

            // Fetch profile if we don't have it
            if (!userProfiles.has(userId) && userId !== user.id) {
              const profile = await fetchUserProfile(userId);
              if (profile) {
                setUserProfiles((prev) => new Map(prev).set(userId, profile));
                // Update presence data with profile info
                transformedState[userId] = {
                  ...presence,
                  username: profile.username,
                  avatar_url: profile.avatar_url,
                  email: profile.email,
                };
              } else {
                transformedState[userId] = presence;
              }
            } else {
              const profile = userProfiles.get(userId);
              transformedState[userId] = {
                ...presence,
                username: profile?.username || presence.username,
                avatar_url: profile?.avatar_url || presence.avatar_url,
                email: profile?.email || presence.email,
              };
            }
          }
        }

        setPresenceState(transformedState);
        setIsConnected(true);
      })
      .on("presence", { event: "join" }, async ({ key, newPresences }) => {
        if (key !== user.id && newPresences.length > 0) {
          const presence = newPresences[0] as UserPresence;
          const username = presence.username || "Someone";

          toast.success(`${username} joined the document`, {
            icon: "👋",
            duration: 3000,
          });

          console.log("User joined:", key, newPresences);
        }
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        if (key !== user.id && leftPresences.length > 0) {
          const presence = leftPresences[0] as UserPresence;
          const username = presence.username || "Someone";

          toast.error(`${username} left the document`, {
            icon: "👋",
            duration: 3000,
          });

          console.log("User left:", key, leftPresences);
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Track initial presence with profile data
          const presenceData = await createPresenceData();
          if (presenceData) {
            await channel.track(presenceData);
          }
        }
      });

    // Handle page visibility changes
    const handleVisibilityChange = async () => {
      if (channel) {
        const presenceData = await createPresenceData({
          page_focus: !document.hidden,
        });
        if (presenceData) {
          channel.track(presenceData);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [enabled, user, playbookId, supabase]);

  // Function to update user's editing status
  const updateEditingStatus = async (
    isEditing: boolean,
    cursorPosition?: { from: number; to: number }
  ) => {
    if (!channelRef.current || !user) return;

    // Get current presence state for this user
    const currentPresence = presenceState[user.id];

    // Only update if editing status actually changed to prevent join/leave spam
    if (currentPresence?.is_editing === isEditing) return;

    const presenceData = await createPresenceData({
      is_editing: isEditing,
      cursor_position: cursorPosition,
    });

    if (presenceData) {
      channelRef.current.track(presenceData);

      // Show toast for editing status change only when status actually changes
      if (isEditing && !currentPresence?.is_editing) {
        const currentUsers = Object.values(presenceState).filter(
          (p) => p.user_id !== user.id
        );
        if (currentUsers.length > 0) {
          toast.success("You are now editing", {
            icon: "✏️",
            duration: 1500,
          });
        }
      }
    }
  };

  // Function to update cursor position without changing editing status
  const updateCursorPosition = async (cursorPosition: {
    from: number;
    to: number;
    coords?: { x: number; y: number };
  }) => {
    if (!channelRef.current || !user) return;

    const currentPresence = presenceState[user.id];

    const presenceData = await createPresenceData({
      is_editing: currentPresence?.is_editing || false,
      cursor_position: cursorPosition,
    });

    if (presenceData) {
      channelRef.current.track(presenceData);
    }
  };

  // Get other users (excluding current user) with enhanced profile data
  const otherUsers = Object.values(presenceState)
    .filter((presence) => presence.user_id !== user?.id)
    .map((presence) => {
      const profile = userProfiles.get(presence.user_id);
      return {
        ...presence,
        username: profile?.username || presence.username || "Anonymous",
        avatar_url: profile?.avatar_url || presence.avatar_url,
        email: profile?.email || presence.email,
      };
    });

  // Get count of active users
  const activeUsersCount = Object.keys(presenceState).length;

  // Track editing users for notifications
  const editingUsers = otherUsers.filter((user) => user.is_editing);
  const viewingUsers = otherUsers.filter(
    (user) => user.page_focus && !user.is_editing
  );

  return {
    presenceState,
    otherUsers,
    activeUsersCount,
    isConnected,
    updateEditingStatus,
    updateCursorPosition,
    editingUsers,
    viewingUsers,
  };
}
