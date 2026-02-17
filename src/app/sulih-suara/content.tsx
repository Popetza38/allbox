/**
 * Dubbed Content (Sulih Suara) Page
 *
 * Refactored to use DubbedProvider for state management.
 * This provides better separation of concerns and reusability.
 */

"use client";

import { DubbedProvider } from "@/contexts/DubbedContext";
import { DubbedContentInner } from "./DubbedContentInner";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * Container component that wraps content with DubbedProvider
 * State management is now handled by DubbedContext
 */
export default function SulihSuaraContent() {
  const { language } = useLanguage();

  return (
    <DubbedProvider language={language}>
      <DubbedContentInner />
    </DubbedProvider>
  );
}
