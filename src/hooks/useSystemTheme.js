// hooks/useSystemTheme.js
import { useEffect, useState } from "react";

export function useSystemTheme() {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window === "undefined" || !window.matchMedia) return false;
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return;

        const mq = window.matchMedia("(prefers-color-scheme: dark)");

        const handleChange = (event) => {
            setIsDarkMode(event.matches);
        };

        // initial sync
        handleChange(mq);

        if (mq.addEventListener) mq.addEventListener("change", handleChange);
        else if (mq.addListener) mq.addListener(handleChange);

        return () => {
            if (mq.removeEventListener) mq.removeEventListener("change", handleChange);
            else if (mq.removeListener) mq.removeListener(handleChange);
        };
    }, []);

    return isDarkMode;
}