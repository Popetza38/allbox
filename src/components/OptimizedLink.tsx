/**
 * Optimized Link component with prefetch on hover
 * Improves perceived navigation speed by prefetching pages on hover
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useCallback, useRef } from "react";

interface OptimizedLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  prefetch?: boolean;
  disabled?: boolean;
  onPrefetchStart?: () => void;
  onPrefetchComplete?: () => void;
  onPrefetchError?: (error: Error) => void;
}

/**
 * Link component with prefetch on hover capability
 * Prefetches the page when user hovers over the link
 */
export function OptimizedLink({
  href,
  children,
  prefetch = true,
  disabled = false,
  onPrefetchStart,
  onPrefetchComplete,
  onPrefetchError,
  ...props
}: OptimizedLinkProps) {
  const router = useRouter();
  const [hasPrefetched, setHasPrefetched] = useState(false);
  const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize the href to avoid unnecessary re-renders
  const memoizedHref = useMemo(() => href, [href]);

  /**
   * Prefetch the page
   */
  const prefetchPage = useCallback(async () => {
    if (disabled || hasPrefetched || !prefetch) {
      return;
    }

    try {
      onPrefetchStart?.();

      // Clear any existing timeout
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }

      // Debounce prefetch slightly to avoid unnecessary prefetches
      prefetchTimeoutRef.current = setTimeout(async () => {
        try {
          await router.prefetch(memoizedHref);
          setHasPrefetched(true);
          onPrefetchComplete?.();
        } catch (error) {
          console.error(`[OptimizedLink] Failed to prefetch ${memoizedHref}:`, error);
          onPrefetchError?.(error as Error);
        }
      }, 100); // 100ms delay to avoid prefetching during quick mouse movements
    } catch (error) {
      console.error(`[OptimizedLink] Prefetch error for ${memoizedHref}:`, error);
      onPrefetchError?.(error as Error);
    }
  }, [
    disabled,
    hasPrefetched,
    prefetch,
    memoizedHref,
    router,
    onPrefetchStart,
    onPrefetchComplete,
    onPrefetchError,
  ]);

  /**
   * Handle mouse enter - start prefetching
   */
  const handleMouseEnter = useCallback(() => {
    prefetchPage();
  }, [prefetchPage]);

  /**
   * Handle mouse leave - clear any pending prefetch
   */
  const handleMouseLeave = useCallback(() => {
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
      prefetchTimeoutRef.current = null;
    }
  }, []);

  // Cleanup timeout on unmount
  useState(() => {
    return () => {
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }
    };
  });

  if (disabled) {
    return (
      <span {...props} className={props.className}>
        {children}
      </span>
    );
  }

  return (
    <Link
      href={memoizedHref}
      prefetch={false} // Disable automatic prefetch, we handle it manually
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter} // Also prefetch on keyboard focus
      {...props}
    >
      {children}
    </Link>
  );
}

/**
 * Quick usage component for common cases
 */
interface SmartLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function SmartLink({ href, children, className }: SmartLinkProps) {
  return (
    <OptimizedLink
      href={href}
      className={className}
      prefetch={true}
    >
      {children}
    </OptimizedLink>
  );
}
