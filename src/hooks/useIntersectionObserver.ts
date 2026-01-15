import { useEffect, useRef, useState, useCallback } from "react";

interface IntersectionObserverOptions {
    threshold?: number;
    rootMargin?: string;
    enabled?: boolean;
}

export function useIntersectionObserver(
    options: IntersectionObserverOptions = {}
) {
    const { threshold = 0.1, rootMargin = "100px", enabled = true } = options;

    const [isIntersecting, setIsIntersecting] = useState(false);
    const targetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!enabled || !targetRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting);
            },
            { threshold, rootMargin }
        );

        observer.observe(targetRef.current);

        return () => {
            observer.disconnect();
        };
    }, [threshold, rootMargin, enabled]);

    const resetIntersection = useCallback(() => {
        setIsIntersecting(false);
    }, []);

    return { targetRef, isIntersecting, resetIntersection };
}
