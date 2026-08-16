'use client';

import { createContext, useContext, useEffect } from 'react';

type Theme = 'light';

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: 'light';
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    resolvedTheme: 'light',
    setTheme: () => { },
});

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('dark');
        root.classList.add('light');
        localStorage.removeItem('hyzenpro-theme');
    }, []);

    return (
        <ThemeContext.Provider value={{ theme: 'light', resolvedTheme: 'light', setTheme: () => { } }}>
            {children}
        </ThemeContext.Provider>
    );
}
