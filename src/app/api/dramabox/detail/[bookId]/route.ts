import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { API_CONFIG } from "@/lib/constants";
import { withCache, generateCacheKey } from "@/lib/cache";

// ===========================================
// Vercel Runtime Configuration
// ===========================================
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  // Parallel: fetch params and headers simultaneously
  const [{ bookId }, headersList] = await Promise.all([
    params,
    headers()
  ]);

  const accept = headersList.get("accept") || "";
  const searchParams = request.nextUrl.searchParams;
  const lang = searchParams.get("lang") || API_CONFIG.DEFAULT_LANGUAGE;

  // If browser navigation (Accept: text/html) -> redirect to UI page
  if (accept.includes("text/html")) {
    return NextResponse.redirect(new URL(`/detail/${bookId}`, request.url));
  }

  const cacheKey = generateCacheKey('detail', { bookId, lang });

  // If API fetch -> proxy to upstream
  try {
    // Use withCache wrapper for automatic caching
    const data = await withCache('detail', cacheKey, async () => {
      const upstreamUrl = `${API_CONFIG.UPSTREAM_API}/api/dramabox/detail?bookId=${bookId}&lang=${lang}`;
      console.log(`[API] Fetching from: ${upstreamUrl}`);

      const response = await fetch(upstreamUrl, {
        next: { revalidate: 600 },
        headers: {
          'User-Agent': 'DramaBox-Web/1.0',
        },
      });

      if (!response.ok) {
        console.error(`[API] Upstream error: ${response.status} ${response.statusText}`);
        throw new Error(`Upstream error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    });

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        'X-Cache': 'HIT',
      },
    });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
