import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { DramaGrid } from "@/components/DramaGrid";
import { SectionHeader } from "@/components/SectionHeader";
import { LoadingGrid } from "@/components/LoadingGrid";
import { fetchTrending, Drama } from "@/lib/api";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const ITEMS_PER_PAGE = 12;

const Trending = () => {
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

  const { data: dramas, isLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: fetchTrending,
  });

  const allDramas = dramas || [];
  const displayedDramas = allDramas.slice(0, displayCount) as Drama[];
  const hasMore = displayCount < allDramas.length;

  // Infinite scroll hook
  const { targetRef, isIntersecting, resetIntersection } = useIntersectionObserver({
    enabled: hasMore && !isLoading,
    rootMargin: "200px",
  });

  // Load more when intersection detected
  useEffect(() => {
    if (isIntersecting && hasMore) {
      setDisplayCount((prev) => Math.min(prev + ITEMS_PER_PAGE, allDramas.length));
      resetIntersection();
    }
  }, [isIntersecting, hasMore, allDramas.length, resetIntersection]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-12">
        <section className="container py-8">
          <SectionHeader
            title="กำลังฮิต"
            subtitle="ซีรีส์ที่กำลังเป็นกระแสและมีผู้ชมมากที่สุด"
            icon={TrendingUp}
          />
          {isLoading ? (
            <LoadingGrid count={12} />
          ) : displayedDramas.length > 0 ? (
            <>
              <DramaGrid dramas={displayedDramas} />

              {/* Load more trigger */}
              {hasMore && (
                <div
                  ref={targetRef}
                  className="flex justify-center py-8"
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>กำลังโหลดเพิ่ม...</span>
                  </div>
                </div>
              )}

              {/* Show count */}
              <p className="text-center text-sm text-muted-foreground mt-4">
                แสดง {displayedDramas.length} จาก {allDramas.length} เรื่อง
              </p>
            </>
          ) : (
            <p className="text-muted-foreground text-center py-12">
              ไม่มีซีรีส์ที่กำลังฮิต
            </p>
          )}
        </section>
      </main>
    </div>
  );
};

export default Trending;

