"use client";

import { DramaCard } from "@/components/DramaCard";
import { useForYouDramas, useTrendingDramas, useLatestDramas } from "@/hooks/useDramas";
import type { SupportedLanguage } from "@/types/language";
import type { Drama } from "@/types/drama";

interface CategoryTagGridProps {
    lang: SupportedLanguage;
}

// Define priority categories with Thai labels
const PRIORITY_CATEGORIES = [
    { en: 'Romance', th: 'โรแมนติก' },
    { en: 'Revenge', th: 'แก้แค้น' },
    { en: 'Counterattack', th: 'ตบหน้าเอาคืน' },
    { en: 'Hidden Identity', th: 'หักมุม' },
    { en: 'Powerful Male Lead', th: 'ชายเก่ง' },
    { en: 'Independent Woman', th: 'หญิงแกร่ง' },
    { en: 'Historical', th: 'พีเรียด' },
    { en: 'Billionaire', th: 'ท่านประธาน' },
    { en: 'Love Triangle', th: 'รักสามเส้า' },
    { en: 'Forced Love', th: 'บังคับรัก' },
    { en: 'Secret Baby', th: 'อุ้มลูกหนี' },
    { en: 'Destined Love', th: 'พรหมลิขิต' },
    { en: 'Rebirth', th: 'เกิดใหม่' },
    { en: 'Supernatural', th: 'เหนือธรรมชาติ' },
    { en: 'Time Travel', th: 'ข้ามเวลา' },
    { en: 'Mafia', th: 'มาเฟีย' },
];

const SKIP_TAGS = new Set(['Modern', 'BG']);

export function CategoryTagGrid({ lang }: CategoryTagGridProps) {
    const { data: forYou } = useForYouDramas(lang);
    const { data: trending } = useTrendingDramas(lang);
    const { data: latest } = useLatestDramas(lang);

    // Combine and deduplicate
    const allDramas = [...(forYou || []), ...(trending || []), ...(latest || [])];
    const uniqueMap = new Map<string, Drama>();
    allDramas.forEach(d => {
        if (!uniqueMap.has(d.bookId)) {
            uniqueMap.set(d.bookId, d);
        }
    });

    // Group by tag
    const categoryMap = new Map<string, { thName: string; enName: string; dramas: Drama[] }>();

    uniqueMap.forEach(drama => {
        const tags = drama.tagV3s || [];
        tags.forEach(tag => {
            if (SKIP_TAGS.has(tag.tagEnName)) return;

            if (!categoryMap.has(tag.tagEnName)) {
                categoryMap.set(tag.tagEnName, {
                    thName: tag.tagName,
                    enName: tag.tagEnName,
                    dramas: [],
                });
            }
            const cat = categoryMap.get(tag.tagEnName)!;
            if (!cat.dramas.find(d => d.bookId === drama.bookId)) {
                cat.dramas.push(drama);
            }
        });
    });

    // Sort: priority categories first, then by drama count
    const sortedCategories = Array.from(categoryMap.entries())
        .filter(([, val]) => val.dramas.length >= 2)
        .sort(([keyA,], [keyB, valB]) => {
            const idxA = PRIORITY_CATEGORIES.findIndex(p => p.en === keyA);
            const idxB = PRIORITY_CATEGORIES.findIndex(p => p.en === keyB);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return valB.dramas.length - categoryMap.get(keyA)!.dramas.length;
        })
        .slice(0, 8);

    if (sortedCategories.length === 0) {
        return (
            <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {sortedCategories.map(([key, category]) => (
                <div key={key} className="animate-fade-up">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm">
                            {lang === 'th' ? category.thName : category.enName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {category.dramas.length} {lang === 'th' ? 'เรื่อง' : 'dramas'}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                        {category.dramas.slice(0, 6).map((drama, index) => (
                            <DramaCard key={drama.bookId} drama={drama} index={index} language={lang} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
