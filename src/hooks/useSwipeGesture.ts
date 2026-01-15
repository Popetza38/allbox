import { useEffect, useRef, useState, TouchEvent } from "react";

interface SwipeCallbacks {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
}

interface SwipeConfig {
    minSwipeDistance?: number;
    maxSwipeTime?: number;
}

export function useSwipeGesture(
    callbacks: SwipeCallbacks,
    config: SwipeConfig = {}
) {
    const { minSwipeDistance = 50, maxSwipeTime = 300 } = config;

    const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
    const [isSwiping, setIsSwiping] = useState(false);

    const handleTouchStart = (e: TouchEvent) => {
        const touch = e.touches[0];
        touchStart.current = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now(),
        };
        setIsSwiping(true);
    };

    const handleTouchEnd = (e: TouchEvent) => {
        if (!touchStart.current) return;
        setIsSwiping(false);

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStart.current.x;
        const deltaY = touch.clientY - touchStart.current.y;
        const deltaTime = Date.now() - touchStart.current.time;

        // Check if swipe was fast enough
        if (deltaTime > maxSwipeTime) {
            touchStart.current = null;
            return;
        }

        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        // Determine swipe direction (prioritize horizontal)
        if (absDeltaX > absDeltaY && absDeltaX >= minSwipeDistance) {
            if (deltaX > 0) {
                callbacks.onSwipeRight?.();
            } else {
                callbacks.onSwipeLeft?.();
            }
        } else if (absDeltaY > absDeltaX && absDeltaY >= minSwipeDistance) {
            if (deltaY > 0) {
                callbacks.onSwipeDown?.();
            } else {
                callbacks.onSwipeUp?.();
            }
        }

        touchStart.current = null;
    };

    const handleTouchCancel = () => {
        touchStart.current = null;
        setIsSwiping(false);
    };

    return {
        touchHandlers: {
            onTouchStart: handleTouchStart,
            onTouchEnd: handleTouchEnd,
            onTouchCancel: handleTouchCancel,
        },
        isSwiping,
    };
}
