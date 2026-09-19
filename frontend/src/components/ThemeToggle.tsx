import { useEffect, useState } from "react";

const THEME_KEY = "expense-theme";

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(() => localStorage.getItem(THEME_KEY) === "dark");

    useEffect(() => {
        document.documentElement.classList.toggle("dark", isDark);
        localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    }, [isDark]);

    return (
        <button
            type="button"
            onClick={() => setIsDark((current) => !current)}
            className="theme-toggle"
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            title={isDark ? "Switch to light theme" : "Switch to dark theme"}
        >
            {isDark ? "☀" : "☾"}
        </button>
    );
}
