import { createClient } from "@/lib/supabase/client";
import { getSafeContent } from "@/lib/bytea-decoder";

export interface CollaboratorPlaybook {
  id: string;
  title: string;
  description?: string;
  content: string;
  owner_id: string;
  last_updated_by: string | null;
  is_published: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
  collaborators?: CollaboratorProfile[];
  owner_profile?: Profile;
  last_updated_by_profile?: Profile;
}

export interface CollaboratorProfile {
  profile: {
    user_id: string;
    username: string;
    avatar_url?: string;
    email?: string;
  };
}

export interface CreateCollaboratorPlaybookData {
  title: string;
  description?: string;
  content?: string;
  is_published?: boolean;
}

export interface UpdateCollaboratorPlaybookData {
  title?: string;
  description?: string;
  content?: string;
  is_published?: boolean;
}

export interface Profile {
  user_id: string;
  username: string;
  avatar_url?: string;
  email?: string;
}

class CollaboratorPlaybookService {
  private supabase = createClient();

  async getCollaboratorPlaybooks() {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get playbooks where user is owner
    const { data: ownedPlaybooks, error: ownedError } = await this.supabase
      .from("collaborator_playbooks")
      .select(
        `
        *,
        collaborators:collaborators(
          profile:profiles(user_id, username, avatar_url, email)
        )
      `
      )
      .eq("owner_id", user.id)
      .order("updated_at", { ascending: false });

    if (ownedError) {
      throw new Error(
        `Failed to fetch owned collaborative playbooks: ${ownedError.message}`
      );
    }

    // Get playbooks where user is collaborator
    const { data: collaboratorPlaybooks, error: collabError } =
      await this.supabase
        .from("collaborator_playbooks")
        .select(
          `
        *,
        collaborators:collaborators!inner(
          profile:profiles(user_id, username, avatar_url, email)
        )
      `
        )
        .eq("collaborators.user_id", user.id)
        .order("updated_at", { ascending: false });

    if (collabError) {
      throw new Error(
        `Failed to fetch collaborative playbooks: ${collabError.message}`
      );
    }

    // Combine and deduplicate
    const allPlaybooks = [
      ...(ownedPlaybooks || []),
      ...(collaboratorPlaybooks || []),
    ];
    const uniquePlaybooks = allPlaybooks.filter(
      (playbook, index, arr) =>
        arr.findIndex((p) => p.id === playbook.id) === index
    );

    // Sort by updated_at descending
    const data = uniquePlaybooks.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    // Get unique owner_ids and last_updated_by ids to fetch profiles
    const ownerIds = [...new Set(data.map((p) => p.owner_id))];
    const lastUpdatedByIds = [
      ...new Set(data.map((p) => p.last_updated_by).filter(Boolean)),
    ];
    const allUserIds = [...new Set([...ownerIds, ...lastUpdatedByIds])];

    // Fetch all required profiles
    let profiles: Profile[] = [];
    if (allUserIds.length > 0) {
      const { data: profilesData, error: profilesError } = await this.supabase
        .from("profiles")
        .select("user_id, username, avatar_url, email")
        .in("user_id", allUserIds);

      if (!profilesError) {
        profiles = profilesData || [];
      }
    }

    // Create a profiles lookup map
    const profilesMap = new Map(profiles.map((p) => [p.user_id, p]));

    // Decode bytea content and add owner/last_updated_by profiles
    const decodedData =
      data?.map((playbook) => {
        const ownerProfile = profilesMap.get(playbook.owner_id);
        const lastUpdatedByProfile = playbook.last_updated_by
          ? profilesMap.get(playbook.last_updated_by)
          : undefined;

        return {
          ...playbook,
          content: getSafeContent(playbook.content),
          collaborators: playbook.collaborators || [],
          owner_profile: ownerProfile,
          last_updated_by_profile: lastUpdatedByProfile,
        };
      }) || [];

    return decodedData as CollaboratorPlaybook[];
  }

  async getCollaboratorPlaybook(slug: string) {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await this.supabase
      .from("collaborator_playbooks")
      .select(
        `
        *,
        collaborators:collaborators(
          profile:profiles(user_id, username, avatar_url, email)
        )
      `
      )
      .eq("slug", slug)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      throw new Error(
        `Failed to fetch collaborative playbook: ${error.message}`
      );
    }

    // Check if user has access (owner or collaborator)
    const isOwner = data.owner_id === user.id;
    const isCollaborator = data.collaborators?.some(
      (collab: CollaboratorProfile) => collab.profile.user_id === user.id
    );

    if (!isOwner && !isCollaborator) {
      throw new Error("Access denied to this playbook");
    }

    // Fetch owner and last_updated_by profiles
    const userIds = [data.owner_id, data.last_updated_by].filter(Boolean);
    let profiles: Profile[] = [];

    if (userIds.length > 0) {
      const { data: profilesData, error: profilesError } = await this.supabase
        .from("profiles")
        .select("user_id, username, avatar_url, email")
        .in("user_id", userIds);

      if (!profilesError) {
        profiles = profilesData || [];
      }
    }

    // Create a profiles lookup map
    const profilesMap = new Map(profiles.map((p) => [p.user_id, p]));

    const ownerProfile = profilesMap.get(data.owner_id);
    const lastUpdatedByProfile = data.last_updated_by
      ? profilesMap.get(data.last_updated_by)
      : undefined;

    // Decode bytea content
    const decodedData = {
      ...data,
      content: getSafeContent(data.content),
      collaborators: data.collaborators || [],
      owner_profile: ownerProfile,
      last_updated_by_profile: lastUpdatedByProfile,
    };

    return decodedData as CollaboratorPlaybook;
  }

  async createCollaboratorPlaybook(data: CreateCollaboratorPlaybookData) {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data: playbook, error } = await this.supabase
      .from("collaborator_playbooks")
      .insert({
        title: data.title,
        description: data.description,
        content: data.content || "",
        is_published: data.is_published ?? true,
        owner_id: user.id,
        last_updated_by: user.id,
      })
      .select(
        `
        *,
        collaborators:collaborators(
          profile:profiles(user_id, username, avatar_url, email)
        )
      `
      )
      .single();

    if (error) {
      throw new Error(
        `Failed to create collaborative playbook: ${error.message}`
      );
    }

    // Decode bytea content
    const decodedPlaybook = {
      ...playbook,
      content: getSafeContent(playbook.content),
      collaborators: playbook.collaborators || [],
    };

    return decodedPlaybook as CollaboratorPlaybook;
  }

  async updateCollaboratorPlaybook(
    id: string,
    data: UpdateCollaboratorPlaybookData
  ) {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check if user has access (owner or collaborator)
    const { data: existing } = await this.supabase
      .from("collaborator_playbooks")
      .select(
        `
        *,
        collaborators:collaborators(
          profile:profiles(user_id)
        )
      `
      )
      .eq("id", id)
      .single();

    if (!existing) {
      throw new Error("Playbook not found");
    }

    const isOwner = existing.owner_id === user.id;
    const isCollaborator = existing.collaborators?.some(
      (collab: CollaboratorProfile) => collab.profile.user_id === user.id
    );

    if (!isOwner && !isCollaborator) {
      throw new Error("Access denied to this playbook");
    }

    const updateData = {
      ...data,
      last_updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    const { data: playbook, error } = await this.supabase
      .from("collaborator_playbooks")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        collaborators:collaborators(
          profile:profiles(user_id, username, avatar_url, email)
        )
      `
      )
      .single();

    if (error) {
      throw new Error(
        `Failed to update collaborative playbook: ${error.message}`
      );
    }

    // Decode bytea content
    const decodedPlaybook = {
      ...playbook,
      content: getSafeContent(playbook.content),
      collaborators: playbook.collaborators || [],
    };

    return decodedPlaybook as CollaboratorPlaybook;
  }

  async deleteCollaboratorPlaybook(id: string) {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check if user is the owner (only owners can delete)
    const { data: existing } = await this.supabase
      .from("collaborator_playbooks")
      .select("owner_id")
      .eq("id", id)
      .single();

    if (!existing || existing.owner_id !== user.id) {
      throw new Error("Only the owner can delete this playbook");
    }

    const { error } = await this.supabase
      .from("collaborator_playbooks")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(
        `Failed to delete collaborative playbook: ${error.message}`
      );
    }

    return true;
  }

  async searchProfiles(email: string) {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("user_id, username, avatar_url, email")
      .ilike("email", `%${email}%`)
      .limit(5);

    if (error) {
      throw new Error(`Failed to search profiles: ${error.message}`);
    }

    return data as Profile[];
  }

  async addCollaborator(playbookId: string, userId: string) {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check if user is trying to add themselves
    if (userId === user.id) {
      throw new Error(
        "You cannot add yourself as a collaborator - you are already the owner!"
      );
    }

    // Check if user is the owner
    const { data: playbook } = await this.supabase
      .from("collaborator_playbooks")
      .select("owner_id")
      .eq("id", playbookId)
      .single();

    if (!playbook || playbook.owner_id !== user.id) {
      throw new Error("Only the owner can add collaborators");
    }

    // Check if user exists in profiles table
    const { data: userProfile } = await this.supabase
      .from("profiles")
      .select("user_id")
      .eq("user_id", userId)
      .single();

    if (!userProfile) {
      throw new Error("User not found in profiles");
    }

    // Check if user is already a collaborator
    const { data: existingCollab } = await this.supabase
      .from("collaborators")
      .select("*")
      .eq("playbook_id", playbookId)
      .eq("user_id", userId)
      .single();

    if (existingCollab) {
      throw new Error("User is already a collaborator");
    }

    const { error } = await this.supabase.from("collaborators").insert({
      playbook_id: playbookId,
      user_id: userId,
    });

    if (error) {
      throw new Error(`Failed to add collaborator: ${error.message}`);
    }

    return true;
  }

  async removeCollaborator(playbookId: string, userId: string) {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check if user is the owner
    const { data: playbook } = await this.supabase
      .from("collaborator_playbooks")
      .select("owner_id")
      .eq("id", playbookId)
      .single();

    if (!playbook || playbook.owner_id !== user.id) {
      throw new Error("Only the owner can remove collaborators");
    }

    const { error } = await this.supabase
      .from("collaborators")
      .delete()
      .eq("playbook_id", playbookId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to remove collaborator: ${error.message}`);
    }

    return true;
  }

  async togglePublish(id: string) {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get current state and check access
    const { data: existing } = await this.supabase
      .from("collaborator_playbooks")
      .select(
        `
        *,
        collaborators:collaborators(
          profile:profiles(user_id)
        )
      `
      )
      .eq("id", id)
      .single();

    if (!existing) {
      throw new Error("Playbook not found");
    }

    const isOwner = existing.owner_id === user.id;
    const isCollaborator = existing.collaborators?.some(
      (collab: CollaboratorProfile) => collab.profile.user_id === user.id
    );

    if (!isOwner && !isCollaborator) {
      throw new Error("Access denied to this playbook");
    }

    const { data: playbook, error } = await this.supabase
      .from("collaborator_playbooks")
      .update({
        is_published: !existing.is_published,
        last_updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        `
        *,
        collaborators:collaborators(
          profile:profiles(user_id, username, avatar_url, email)
        )
      `
      )
      .single();

    if (error) {
      throw new Error(`Failed to toggle publish status: ${error.message}`);
    }

    // Decode bytea content
    const decodedPlaybook = {
      ...playbook,
      content: getSafeContent(playbook.content),
      collaborators: playbook.collaborators || [],
    };

    return decodedPlaybook as CollaboratorPlaybook;
  }

  // Public method to fetch published playbook by slug (no authentication required)
  async getPublishedPlaybook(slug: string) {
    const { data, error } = await this.supabase
      .from("collaborator_playbooks")
      .select(
        `
        *,
        collaborators:collaborators(
          profile:profiles(user_id, username, avatar_url, email)
        )
      `
      )
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      throw new Error(
        `Failed to fetch published collaborative playbook: ${error.message}`
      );
    }

    // Fetch owner and last_updated_by profiles
    const userIds = [data.owner_id, data.last_updated_by].filter(Boolean);
    let profiles: Profile[] = [];

    if (userIds.length > 0) {
      const { data: profilesData, error: profilesError } = await this.supabase
        .from("profiles")
        .select("user_id, username, avatar_url, email")
        .in("user_id", userIds);

      if (!profilesError) {
        profiles = profilesData || [];
      }
    }

    // Create a profiles lookup map
    const profilesMap = new Map(profiles.map((p) => [p.user_id, p]));

    const ownerProfile = profilesMap.get(data.owner_id);
    const lastUpdatedByProfile = data.last_updated_by
      ? profilesMap.get(data.last_updated_by)
      : undefined;

    // Decode bytea content and add profiles
    const decodedPlaybook = {
      ...data,
      content: getSafeContent(data.content),
      collaborators: data.collaborators || [],
      owner_profile: ownerProfile,
      last_updated_by_profile: lastUpdatedByProfile,
    };

    return decodedPlaybook as CollaboratorPlaybook;
  }
}

export const collaboratorPlaybookService = new CollaboratorPlaybookService();
