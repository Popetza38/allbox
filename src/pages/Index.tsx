import { useQuery } from "@tanstack/react-query";
import { Sparkles, TrendingUp, Clock, Crown } from "lucide-react";
import { Header } from "@/components/Header";
import { DramaGrid } from "@/components/DramaGrid";
import { SectionHeader } from "@/components/SectionHeader";
import { LoadingGrid } from "@/components/LoadingGrid";
import { fetchForYou, fetchTrending, fetchLatest, fetchVIP } from "@/lib/api";

// Helper to ensure we always have an array
const ensureArray = (data: unknown): unknown[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    // Try common response formats
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.dramas)) return obj.dramas;
    if (Array.isArray(obj.items)) return obj.items;
    if (Array.isArray(obj.list)) return obj.list;
  }
  return [];
};

const Index = () => {
  const { data: forYouDramas, isLoading: forYouLoading } = useQuery({
    queryKey: ["forYou"],
    queryFn: fetchForYou,
  });

  const { data: trendingDramas, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: fetchTrending,
  });

  const { data: latestDramas, isLoading: latestLoading } = useQuery({
    queryKey: ["latest"],
    queryFn: fetchLatest,
  });

  const { data: vipDramas, isLoading: vipLoading } = useQuery({
    queryKey: ["vip"],
    queryFn: fetchVIP,
  });

  // Ensure all data is arrays
  const forYouList = ensureArray(forYouDramas);
  const trendingList = ensureArray(trendingDramas);
  const latestList = ensureArray(latestDramas);
  const vipList = ensureArray(vipDramas);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-12">
        {/* Hero Background Glow */}
        <div className="relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] opacity-20"
              style={{
                background:
                  "radial-gradient(ellipse, hsl(336 91% 63% / 0.4) 0%, transparent 70%)",
              }}
            />
          </div>

          {/* For You Section */}
          <section className="relative container py-8">
            <SectionHeader
              title="แนะนำสำหรับคุณ"
              subtitle="ซีรีส์ที่คัดสรรมาเพื่อคุณโดยเฉพาะ ค้นพบเรื่องราวสนุกๆ ที่เหมาะกับรสนิยมของคุณ!"
              icon={Sparkles}
            />
            {forYouLoading ? (
              <LoadingGrid count={6} />
            ) : forYouList.length > 0 ? (
              <DramaGrid dramas={forYouList.slice(0, 12) as any} />
            ) : null}
          </section>
        </div>

        {/* Trending Section */}
        <section className="container py-8">
          <SectionHeader
            title="กำลังฮิต"
            subtitle="ซีรีส์ที่กำลังเป็นกระแสและมีผู้ชมมากที่สุด"
            icon={TrendingUp}
            href="/trending"
          />
          {trendingLoading ? (
            <LoadingGrid count={6} />
          ) : trendingList.length > 0 ? (
            <DramaGrid dramas={trendingList.slice(0, 12) as any} />
          ) : null}
        </section>

        {/* VIP Section */}
        <section className="container py-8">
          <SectionHeader
            title="VIP พิเศษ"
            subtitle="ซีรีส์พิเศษสำหรับสมาชิก VIP"
            icon={Crown}
          />
          {vipLoading ? (
            <LoadingGrid count={6} />
          ) : vipList.length > 0 ? (
            <DramaGrid dramas={vipList.slice(0, 12) as any} />
          ) : null}
        </section>

        {/* Latest Section */}
        <section className="container py-8">
          <SectionHeader
            title="อัปเดตล่าสุด"
            subtitle="อัปเดตซีรีส์ใหม่ทุกวัน"
            icon={Clock}
          />
          {latestLoading ? (
            <LoadingGrid count={6} />
          ) : latestList.length > 0 ? (
            <DramaGrid dramas={latestList.slice(0, 12) as any} />
          ) : null}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container text-center text-muted-foreground text-sm">
          <p>© 2026 DramaBox สตรีมมิ่งซีรีส์สั้นที่ดีที่สุด</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
