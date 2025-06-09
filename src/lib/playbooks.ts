import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";

export interface Playbook {
  id: string;
  title: string;
  content: string;
  owner_id: string;
  published: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
  description?: string;
}

export interface CreatePlaybookData {
  title: string;
  content?: string;
  description?: string;
  published?: boolean;
}

export interface UpdatePlaybookData {
  title?: string;
  content?: string;
  description?: string;
  published?: boolean;
}

class PlaybookService {
  private supabase = createClient();

  async getPlaybooks(filters?: {
    owner_id?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = this.supabase
      .from("playbooks")
      .select("*")
      .order("updated_at", { ascending: false });

    if (filters?.owner_id) {
      query = query.eq("owner_id", filters.owner_id);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 10) - 1
      );
    }

    const { data, error } = await query;

    console.log(data);

    if (error) {
      throw new Error(`Failed to fetch playbooks: ${error.message}`);
    }

    return data as Playbook[];
  }

  async getPlaybook(slug: string) {
    const { data, error } = await this.supabase
      .from("playbooks")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      throw new Error(`Failed to fetch playbook: ${error.message}`);
    }

    return data as Playbook;
  }

  async createPlaybook(data: CreatePlaybookData) {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

  

    const { data: playbook, error } = await this.supabase
      .from("playbooks")
      .insert({
        title: data.title,
        content: data.content || "",
        description: data.description,
        published: data.published || false,
        owner_id: user.id,
       
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to create playbook: ${error.message}`);
    }

    return playbook as Playbook;
  }

  async updatePlaybook(id: string, data: UpdatePlaybookData) {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check if user owns this playbook
    const { data: existing } = await this.supabase
      .from("playbooks")
      .select("owner_id")
      .eq("id", id)
      .single();

    if (!existing || existing.owner_id !== user.id) {
      throw new Error("Playbook not found or unauthorized");
    }

    const updateData: Partial<
      UpdatePlaybookData & { updated_at: string; slug?: string }
    > = {
      ...data,
      updated_at: new Date().toISOString(),
    };

   

    const { data: playbook, error } = await this.supabase
      .from("playbooks")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to update playbook: ${error.message}`);
    }

    return playbook as Playbook;
  }

  async deletePlaybook(id: string) {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check if user owns this playbook
    const { data: existing } = await this.supabase
      .from("playbooks")
      .select("owner_id")
      .eq("id", id)
      .single();

    if (!existing || existing.owner_id !== user.id) {
      throw new Error("Playbook not found or unauthorized");
    }

    const { error } = await this.supabase
      .from("playbooks")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete playbook: ${error.message}`);
    }

    return true;
  }

  private async generateUniqueSlug(
    title: string,
    excludeId?: string
  ): Promise<string> {
    const baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      let query = this.supabase
        .from("playbooks")
        .select("slug")
        .eq("slug", slug);

      if (excludeId) {
        query = query.neq("id", excludeId);
      }

      const { data } = await query.single();

      if (!data) {
        // Slug is unique
        break;
      }

      // Try with counter
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  async publishPlaybook(id: string) {
    return this.updatePlaybook(id, { published: true });
  }

  async unpublishPlaybook(id: string) {
    return this.updatePlaybook(id, { published: false });
  }
}

export const playbookService = new PlaybookService();
