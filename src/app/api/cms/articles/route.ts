export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "5");
    const query = searchParams.get("query") || "";

    let apiUrl = `https://dev.to/api/articles?top=10&per_page=${Math.min(
      limit,
      20
    )}`;

    // Add search query if provided
    if (query) {
      apiUrl += `&search=${encodeURIComponent(query)}`;
    }

    const response = await fetch(apiUrl, {
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

    const formattedArticles = articles.map((a: any) => ({
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
    }));

    return Response.json({
      data: formattedArticles,
      count: formattedArticles.length,
      query,
      limit,
    });
  } catch (error) {
    console.error("Error fetching CMS articles:", error);
    return Response.json(
      {
        error: "Failed to load articles",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
