// app/api/devto/route.ts
export async function GET() {
  try {
    const response = await fetch(
      "https://dev.to/api/articles?top=10&per_page=10",
      {
        headers: {
          Accept: "application/vnd.forem.api-v1+json",
          "User-Agent": "CollabDeck/1.0",
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch: ${response.status} ${response.statusText}`
      );
    }

    const articles = await response.json();

    return Response.json(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      articles.map((a: any) => ({
        id: a.id,
        title: a.title,
        url: `https://dev.to${a.path}`,
        description: a.description,
        published_at: a.published_at,
        user: {
          name: a.user?.name,
          profile_image: a.user?.profile_image_90,
        },
        public_reactions_count: a.public_reactions_count,
        comments_count: a.comments_count,
        reading_time_minutes: a.reading_time_minutes,
        tags: a.tag_list,
        cover_image: a.cover_image,
      }))
    );
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
