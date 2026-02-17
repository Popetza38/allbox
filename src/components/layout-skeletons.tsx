/**
 * Skeleton components for layout Suspense boundaries
 * These provide visual feedback during progressive rendering
 */

export function HeaderSkeleton() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
          <div className="w-24 h-6 rounded-lg bg-muted animate-pulse" />
        </div>
        {/* Nav & Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6">
            <div className="w-16 h-5 rounded-lg bg-muted animate-pulse" />
            <div className="w-16 h-5 rounded-lg bg-muted animate-pulse" />
            <div className="w-20 h-5 rounded-lg bg-muted animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
            <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MainContentSkeleton() {
  return (
    <div className="pt-20 px-4">
      <div className="container mx-auto">
        {/* Hero Section */}
        <div className="mb-8 p-8 rounded-2xl bg-muted/30 animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-muted animate-pulse" />
            <div className="w-64 h-8 rounded-lg bg-muted animate-pulse" />
          </div>
          <div className="w-96 h-6 rounded-lg bg-muted animate-pulse" />
        </div>
        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function FooterSkeleton() {
  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
              <div className="w-32 h-6 rounded-lg bg-muted animate-pulse" />
            </div>
            <div className="w-full h-4 rounded-lg bg-muted animate-pulse" />
            <div className="w-3/4 h-4 rounded-lg bg-muted animate-pulse" />
          </div>
          {/* Navigation */}
          <div className="space-y-4">
            <div className="w-24 h-6 rounded-lg bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="w-20 h-4 rounded-lg bg-muted animate-pulse" />
              <div className="w-24 h-4 rounded-lg bg-muted animate-pulse" />
              <div className="w-20 h-4 rounded-lg bg-muted animate-pulse" />
            </div>
          </div>
          {/* More */}
          <div className="space-y-4">
            <div className="w-20 h-6 rounded-lg bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="w-16 h-4 rounded-lg bg-muted animate-pulse" />
              <div className="w-24 h-4 rounded-lg bg-muted animate-pulse" />
              <div className="w-20 h-4 rounded-lg bg-muted animate-pulse" />
            </div>
          </div>
        </div>
        {/* Bottom */}
        <div className="border-t border-border/50 mt-8 pt-8">
          <div className="w-48 h-4 rounded-lg bg-muted animate-pulse mx-auto" />
        </div>
      </div>
    </footer>
  );
}
