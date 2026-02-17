"use client";

import { ReactNode } from "react";
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import Clock from 'lucide-react/dist/esm/icons/clock';
import type { SupportedLanguage } from "@/types/language";
import { t } from "@/lib/i18n";

interface CategorySectionProps {
    titleKey?: string;
    fallbackTitle: string;
    customTitle?: string;
    icon?: "sparkles" | "trending" | "clock";
    lang: SupportedLanguage;
    children: ReactNode;
}

const icons = {
    sparkles: Sparkles,
    trending: TrendingUp,
    clock: Clock,
};

export function CategorySection({
    titleKey,
    fallbackTitle,
    customTitle,
    icon = "sparkles",
    lang,
    children,
}: CategorySectionProps) {
    const IconComponent = icons[icon];
    const displayTitle = customTitle || (titleKey ? t(lang, titleKey) : fallbackTitle) || fallbackTitle;

    return (
        <section className="relative">
            {/* Section divider with glow */}
            <div className="absolute -top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-display font-bold text-2xl md:text-3xl gradient-text">
                    {displayTitle}
                </h2>
            </div>

            {children}
        </section>
    );
}
