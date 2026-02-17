/**
 * Bottom Navigation Component for Mobile
 *
 * Compound component pattern with children composition for flexibility.
 *
 * @example
 * // Simple usage with items
 * <BottomNavigation>
 *   <BottomNavigation.Item path="/in" icon={Home} label="Home" />
 *   <BottomNavigation.Item path="/in/terbaru" icon={Clock} label="Terbaru" />
 * </BottomNavigation>
 *
 * @example
 * // Custom item rendering
 * <BottomNavigation>
 *   <BottomNavigation.Item path="/in" icon={Home} label="Home">
 *     <CustomItemContent />
 *   </BottomNavigation.Item>
 * </BottomNavigation>
 */

"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { forwardRef, isValidElement, cloneElement, ReactElement } from "react";

/**
 * Navigation Item Props
 */
export interface BottomNavigationItemProps extends Omit<LinkProps, "href"> {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Bottom Navigation Item Component
 */
export const BottomNavigationItem = forwardRef<
  HTMLAnchorElement,
  BottomNavigationItemProps
>(({ path, icon: Icon, label, children, className, ...props }, ref) => {
  const pathname = usePathname();
  const isActive = pathname === path || pathname.startsWith(path + '/');

  // If custom children provided, render them with context
  if (children && isValidElement(children)) {
    return cloneElement(children as ReactElement, {
      isActive,
      path,
      Icon,
      label,
    });
  }

  return (
    <Link
      ref={ref}
      href={path}
      className={cn(
        "flex flex-col items-center justify-center py-2 px-2 min-w-[64px] touch-manipulation transition-all duration-200",
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground active:scale-95",
        className
      )}
      aria-label={label}
      aria-current={isActive ? "page" : undefined}
      {...props}
    >
      <div className={cn(
        "relative mb-1 transition-transform duration-200",
        isActive && "scale-110"
      )}>
        <Icon className={cn(
          "w-6 h-6 transition-all duration-200",
          isActive && "stroke-[2.5px]"
        )} />
        {isActive && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
        )}
      </div>
      <span className={cn(
        "text-xs font-medium transition-all duration-200",
        isActive ? "font-semibold" : "font-normal"
      )}>
        {label}
      </span>
    </Link>
  );
});
BottomNavigationItem.displayName = "BottomNavigationItem";

/**
 * Main Bottom Navigation Props
 */
export interface BottomNavigationProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Main Bottom Navigation Component
 */
export function BottomNavigation({ children, className = "" }: BottomNavigationProps) {
  // Filter for valid BottomNavigationItem children
  const items = Array.isArray(children)
    ? children.filter((child): child is ReactElement => {
        return isValidElement(child) && child.type === BottomNavigationItem;
      })
    : isValidElement(children) && children.type === BottomNavigationItem
      ? [children]
      : [];

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-inset-bottom",
      className
    )}>
      <div className="flex items-center justify-around bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border">
        {items}
      </div>

      {/* Safe area for iPhone X+ */}
      <style jsx>{`
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .safe-area-inset-bottom {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>
    </nav>
  );
}

/**
 * Compound component exports
 */
BottomNavigation.Item = BottomNavigationItem;
