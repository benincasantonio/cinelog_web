import { useEffect, useState } from 'react';
import { ThemeProviderContext } from '../context';
import type { Theme } from '../models';

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: Theme;
	storageKey?: string;
};

export function ThemeProvider({
	children,
	defaultTheme = 'system',
	storageKey = 'vite-ui-theme',
	...props
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(
		() => (localStorage.getItem(storageKey) as Theme) || defaultTheme
	);

	useEffect(() => {
		const root = window.document.documentElement;

		const applyTheme = (theme: 'dark' | 'light') => {
			root.classList.remove('light', 'dark');
			root.classList.add(theme);
		};

		if (theme === 'system') {
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			const applySystemTheme = (
				event?: MediaQueryListEvent | { matches: boolean }
			) => {
				applyTheme((event?.matches ?? mediaQuery.matches) ? 'dark' : 'light');
			};

			applySystemTheme();
			mediaQuery.addEventListener('change', applySystemTheme);

			return () => {
				mediaQuery.removeEventListener('change', applySystemTheme);
			};
		}

		applyTheme(theme);
	}, [theme]);

	const value = {
		theme,
		setTheme: (theme: Theme) => {
			localStorage.setItem(storageKey, theme);
			setTheme(theme);
		},
	};

	return (
		<ThemeProviderContext.Provider {...props} value={value}>
			{children}
		</ThemeProviderContext.Provider>
	);
}
