"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SearchProvider } from "@/contexts/SearchContext";
import type { SupportedLanguage } from "@/types/language";
import { useState, Suspense, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { FEATURES } from "@/lib/constants";

interface ProvidersProps {
  children: React.ReactNode;
  language?: SupportedLanguage;
}

/**
 * Dynamic imports for Vercel Analytics with defer loading
 * These are loaded only after the page is interactive to improve performance
 */
const Analytics = dynamic(
  () => import("@vercel/analytics/react").then(mod => ({ default: mod.Analytics })),
  { ssr: false }
);

const SpeedInsights = dynamic(
  () => import("@vercel/speed-insights/next").then(mod => ({ default: mod.SpeedInsights })),
  { ssr: false }
);

/**
 * Analytics component with defer loading
 * Loads analytics only after page is fully interactive (2 second delay)
 */
function DeferredAnalytics() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Defer analytics loading until after page is interactive
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!shouldLoad) return null;

  return (
    <>
      {FEATURES.VERCEL_ANALYTICS && <Analytics />}
      {FEATURES.SPEED_INSIGHTS && <SpeedInsights />}
    </>
  );
}

export function Providers({ children, language = 'in' }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute default
            gcTime: 1000 * 60 * 30, // 30 minutes cache
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <LanguageProvider initialLanguage={language}>
          <SearchProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </SearchProvider>
        </LanguageProvider>
      </ThemeProvider>
      {/* Vercel Analytics & Speed Insights - deferred loading after page is interactive */}
      <Suspense fallback={null}>
        <DeferredAnalytics />
      </Suspense>
    </QueryClientProvider>
  );
}
