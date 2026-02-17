import { redirect } from "next/navigation";

const DEFAULT_LANG = process.env.DEFAULT_LANGUAGE || "th";

/**
 * Root page redirects to default language
 * Middleware handles browser language detection,
 * but this provides a fallback for direct root access
 */
export default function RootPage() {
  redirect(`/${DEFAULT_LANG}`);
}
