import { useEffect, useCallback } from "react";

interface KeyboardShortcuts {
    onPlayPause?: () => void;
    onSeekForward?: () => void;
    onSeekBackward?: () => void;
    onVolumeUp?: () => void;
    onVolumeDown?: () => void;
    onMute?: () => void;
    onFullscreen?: () => void;
    onNextEpisode?: () => void;
    onPrevEpisode?: () => void;
    onPictureInPicture?: () => void;
}

export function useKeyboardShortcuts(
    shortcuts: KeyboardShortcuts,
    enabled: boolean = true
) {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in input fields
            const target = event.target as HTMLElement;
            if (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable
            ) {
                return;
            }

            switch (event.code) {
                case "Space":
                    event.preventDefault();
                    shortcuts.onPlayPause?.();
                    break;
                case "ArrowRight":
                    event.preventDefault();
                    shortcuts.onSeekForward?.();
                    break;
                case "ArrowLeft":
                    event.preventDefault();
                    shortcuts.onSeekBackward?.();
                    break;
                case "ArrowUp":
                    event.preventDefault();
                    shortcuts.onVolumeUp?.();
                    break;
                case "ArrowDown":
                    event.preventDefault();
                    shortcuts.onVolumeDown?.();
                    break;
                case "KeyM":
                    shortcuts.onMute?.();
                    break;
                case "KeyF":
                    shortcuts.onFullscreen?.();
                    break;
                case "KeyN":
                    shortcuts.onNextEpisode?.();
                    break;
                case "KeyP":
                    shortcuts.onPrevEpisode?.();
                    break;
                case "KeyI":
                    shortcuts.onPictureInPicture?.();
                    break;
            }
        },
        [shortcuts]
    );

    useEffect(() => {
        if (!enabled) return;

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown, enabled]);
}

// Keyboard shortcuts legend for UI display
export const KEYBOARD_SHORTCUTS = [
    { key: "Space", action: "เล่น / หยุด" },
    { key: "← / →", action: "เลื่อน ±10 วินาที" },
    { key: "↑ / ↓", action: "ปรับเสียง ±10%" },
    { key: "M", action: "ปิด/เปิดเสียง" },
    { key: "F", action: "เต็มจอ" },
    { key: "N", action: "ตอนถัดไป" },
    { key: "P", action: "ตอนก่อนหน้า" },
    { key: "I", action: "Picture-in-Picture" },
];
