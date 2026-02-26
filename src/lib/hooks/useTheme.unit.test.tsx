import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { ThemeProviderContext } from '../context';
import { useTheme } from './useTheme';

describe('useTheme', () => {
	it('should return context value when used within provider', () => {
		const mockContext = { theme: 'dark' as const, setTheme: () => null };

		const wrapper = ({ children }: { children: ReactNode }) => (
			<ThemeProviderContext.Provider value={mockContext}>
				{children}
			</ThemeProviderContext.Provider>
		);

		const { result } = renderHook(() => useTheme(), { wrapper });

		expect(result.current.theme).toBe('dark');
		expect(result.current.setTheme).toBeDefined();
	});

	it('should throw when context is undefined', () => {
		// Provide undefined explicitly to the context to trigger the throw
		const wrapper = ({ children }: { children: ReactNode }) => (
			<ThemeProviderContext.Provider value={undefined as never}>
				{children}
			</ThemeProviderContext.Provider>
		);

		expect(() => {
			renderHook(() => useTheme(), { wrapper });
		}).toThrow('useTheme must be used within a ThemeProvider');
	});
});
