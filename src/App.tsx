import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AnimatedPage } from "@/components/AnimatedPage";
import Index from "./pages/Index";
import DramaDetail from "./pages/DramaDetail";
import Watch from "./pages/Watch";
import Watchlist from "./pages/Watchlist";
import Trending from "./pages/Trending";
import Search from "./pages/Search";
import History from "./pages/History";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedPage><Index /></AnimatedPage>} />
        <Route path="/detail/:bookId" element={<AnimatedPage><DramaDetail /></AnimatedPage>} />
        <Route path="/watch/:bookId/:episodeNum" element={<AnimatedPage><Watch /></AnimatedPage>} />
        <Route path="/watchlist" element={<AnimatedPage><Watchlist /></AnimatedPage>} />
        <Route path="/trending" element={<AnimatedPage><Trending /></AnimatedPage>} />
        <Route path="/search" element={<AnimatedPage><Search /></AnimatedPage>} />
        <Route path="/history" element={<AnimatedPage><History /></AnimatedPage>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

