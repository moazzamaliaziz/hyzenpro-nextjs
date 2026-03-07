'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const cycle = () => {
        if (theme === 'light') setTheme('dark');
        else if (theme === 'dark') setTheme('system');
        else setTheme('light');
    };

    return (
        <button
            onClick={cycle}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-400"
            title={`Theme: ${theme}`}
            aria-label={`Current theme: ${theme}. Click to cycle.`}
        >
            {theme === 'light' && <Sun className="w-[18px] h-[18px]" />}
            {theme === 'dark' && <Moon className="w-[18px] h-[18px]" />}
            {theme === 'system' && <Monitor className="w-[18px] h-[18px]" />}
        </button>
    );
}
