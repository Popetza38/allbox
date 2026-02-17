/**
 * Dubbed Content (Sulih Suara) Page Components
 *
 * Refactored to use DubbedProvider for state management.
 * Separated into container and presentational components.
 */

"use client";

import { DramaCard } from "@/components/DramaCard";
import { DramaCardSkeleton } from "@/components/DramaCardSkeleton";
import { useDubbedContext } from "@/contexts/DubbedContext";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * Filter Tabs Component
 * Presentational component for filter buttons
 */
interface FilterTabsProps {
  currentClassify: "terbaru" | "terpopuler";
  onClassifyChange: (classify: "terbaru" | "terpopuler") => void;
}

function FilterTabs({ currentClassify, onClassifyChange }: FilterTabsProps) {
  const { language } = useLanguage();
  const { t } = useTranslation(language);

  return (
    <div className="flex gap-2 mb-8">
      <button
        onClick={() => onClassifyChange("terbaru")}
        className={`px-6 py-2.5 rounded-full font-medium transition-all ${
          currentClassify === "terbaru"
            ? "bg-primary text-primary-foreground"
            : "glass hover:bg-muted/50"
        }`}
      >
        {t("filters.latest")}
      </button>
      <button
        onClick={() => onClassifyChange("terpopuler")}
        className={`px-6 py-2.5 rounded-full font-medium transition-all ${
          currentClassify === "terpopuler"
            ? "bg-primary text-primary-foreground"
            : "glass hover:bg-muted/50"
        }`}
      >
        {t("filters.popular")}
      </button>
    </div>
  );
}

/**
 * Pagination Component
 * Presentational component for pagination controls
 */
interface PaginationProps {
  currentPage: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  isFetching: boolean;
  onPrev: () => void;
  onNext: () => void;
}

function Pagination({
  currentPage,
  canGoPrev,
  canGoNext,
  isFetching,
  onPrev,
  onNext,
}: PaginationProps) {
  const { language } = useLanguage();
  const { t } = useTranslation(language);

  return (
    <div className="flex justify-center items-center gap-4 mt-10">
      <button
        onClick={onPrev}
        disabled={!canGoPrev || isFetching}
        className="px-6 py-2.5 rounded-full font-medium glass hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {t("pagination.previous")}
      </button>
      <span className="px-4 py-2 glass rounded-full font-medium">
        {t("pagination.page")} {currentPage}
      </span>
      <button
        onClick={onNext}
        disabled={!canGoNext || isFetching}
        className="px-6 py-2.5 rounded-full font-medium glass hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {t("pagination.next")}
      </button>
    </div>
  );
}

/**
 * Dubbed Content Inner Component
 * Uses DubbedContext for state and data
 */
function DubbedContentInner() {
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const { state, dramas, isLoading, isFetching, setClassify, nextPage, prevPage, canGoNext, canGoPrev } =
    useDubbedContext();

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold gradient-text mb-2">
            {t("page.dubbed.title")}
          </h1>
          <p className="text-muted-foreground">{t("page.dubbed.description")}</p>
        </div>

        {/* Filter Tabs */}
        <FilterTabs
          currentClassify={state.classify}
          onClassifyChange={setClassify}
        />

        {/* Drama Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <DramaCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {dramas?.map((drama, index) => (
                <DramaCard key={drama.bookId} drama={drama} index={index} language={language} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={state.page}
              canGoPrev={canGoPrev}
              canGoNext={canGoNext}
              isFetching={isFetching}
              onPrev={prevPage}
              onNext={nextPage}
            />
          </>
        )}

        {/* Loading Overlay for Page Changes */}
        {isFetching && !isLoading && (
          <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </main>
  );
}

/**
 * Export the inner component for use in DubbedProvider
 */
export { DubbedContentInner, DubbedContentInner as DubbedContent };
export { FilterTabs, Pagination };
