import { Suspense } from "react";
import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { fetchDramasServer, fetchTrendingServer, fetchLatestServer } from "@/lib/server-fetch";
import type { Metadata } from "next";
import type { SupportedLanguage } from "@/types/language";
import { isSupportedLanguage } from "@/lib/i18n";
import { HeroSection } from "@/components/HeroSection";
import { ForYouDramas } from "@/components/ForYouDramas";
import { TrendingDramas } from "@/components/TrendingDramas";
import { LatestDramas } from "@/components/LatestDramas";
import { CategorySection } from "@/components/CategorySection";
import { CategoryTagGrid } from "@/components/CategoryTagGrid";

export const revalidate = 3600; // ISR every 1 hour

interface LangPageProps {
  params: Promise<{
    lang: string;
  }>;
}

/**
 * Generate metadata for home page
 */
export async function generateMetadata({ params }: LangPageProps): Promise<Metadata> {
  const { lang } = await params;
  const language = lang as SupportedLanguage;

  if (!isSupportedLanguage(language)) {
    return {};
  }

  return {
    title: language === 'th' ? 'หน้าแรก - DramaBox' : `Home - DramaBox`,
    description: language === 'th'
      ? 'รับชมซีรีส์สั้นฟรีโดยไม่มีโฆษณา ค้นพบเรื่องสั้นน่าสนใจจากหลากหลายประเภท'
      : 'Watch short dramas for free without ads. Discover thousands of interesting dramas from various genres.',
  };
}

export default async function LangHomePage({ params }: LangPageProps) {
  const { lang } = await params;
  const language = lang as SupportedLanguage;

  // Validate language
  if (!isSupportedLanguage(language)) {
    notFound();
  }

  const queryClient = new QueryClient();

  // Parallel prefetch all 3 endpoints
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["dramas", "foryou", language],
      queryFn: () => fetchDramasServer(language),
    }),
    queryClient.prefetchQuery({
      queryKey: ["dramas", "trending", language],
      queryFn: () => fetchTrendingServer(language),
    }),
    queryClient.prefetchQuery({
      queryKey: ["dramas", "latest", language],
      queryFn: () => fetchLatestServer(language),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="min-h-screen">
        <HeroSection
          titleKey="home.forYou"
          fallbackTitle="สำหรับคุณ"
          descriptionKey="home.forYouDescription"
          fallbackDescription="ซีรีส์ที่เลือกเฉพาะสำหรับคุณ ค้นหาเรื่องราวที่น่าสนใจที่ตรงกับรสนิยมของคุณ!"
          icon="sparkles"
          lang={language}
        />

        <div className="container mx-auto px-4 pb-12 space-y-16">
          {/* สำหรับคุณ - For You */}
          <ForYouDramas lang={language} />

          {/* กำลังนิยม - Trending */}
          <CategorySection
            titleKey="home.trending"
            fallbackTitle="กำลังนิยม"
            icon="trending"
            lang={language}
          >
            <TrendingDramas lang={language} />
          </CategorySection>

          {/* ล่าสุด - Latest */}
          <CategorySection
            titleKey="nav.latest"
            fallbackTitle="ล่าสุด"
            icon="clock"
            lang={language}
          >
            <LatestDramas lang={language} />
          </CategorySection>

          {/* แบ่งตามหมวดหมู่จาก Tags */}
          <CategorySection
            fallbackTitle="แบ่งตามหมวดหมู่"
            icon="sparkles"
            lang={language}
            customTitle={language === 'th' ? 'แบ่งตามหมวดหมู่' : 'Browse by Category'}
          >
            <CategoryTagGrid lang={language} />
          </CategorySection>
        </div>
      </main>
    </HydrationBoundary>
  );
}
