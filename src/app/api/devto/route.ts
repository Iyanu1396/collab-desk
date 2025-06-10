// app/api/devto/route.ts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract parameters with defaults
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("per_page") || "30");
    const tag = searchParams.get("tag") || "";
    const username = searchParams.get("username") || "";
    const state = searchParams.get("state") || "fresh"; // fresh, rising, or all
    const top = searchParams.get("top") || "";

    // Build API URL with parameters
    const apiUrl = new URL("https://dev.to/api/articles");
    apiUrl.searchParams.set("page", page.toString());
    apiUrl.searchParams.set("per_page", Math.min(perPage, 1000).toString()); // Dev.to max is 1000

    if (tag) apiUrl.searchParams.set("tag", tag);
    if (username) apiUrl.searchParams.set("username", username);
    if (state) apiUrl.searchParams.set("state", state);
    if (top) apiUrl.searchParams.set("top", top);

    const response = await fetch(apiUrl.toString(), {
      headers: {
        Accept: "application/vnd.forem.api-v1+json",
        "User-Agent": "CollabDeck/1.0",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch: ${response.status} ${response.statusText}`
      );
    }

    const articles = await response.json();

    return Response.json({
      articles: articles.map((a: Record<string, unknown>) => ({
        id: a.id,
        title: a.title,
        url: `https://dev.to${a.path}`,
        description: a.description,
        published_at: a.published_at,
        user: {
          name: (a.user as Record<string, unknown>)?.name,
          profile_image: (a.user as Record<string, unknown>)?.profile_image_90,
        },
        public_reactions_count: a.public_reactions_count,
        comments_count: a.comments_count,
        reading_time_minutes: a.reading_time_minutes,
        tags: a.tag_list,
        cover_image: a.cover_image,
      })),
      pagination: {
        current_page: page,
        per_page: perPage,
        total_articles: articles.length,
        has_more: articles.length === perPage, // Estimate if there are more
      },
    });
  } catch (error) {
    console.error("Error fetching Dev.to articles:", error);
    return Response.json(
      {
        error: "Failed to load articles",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
