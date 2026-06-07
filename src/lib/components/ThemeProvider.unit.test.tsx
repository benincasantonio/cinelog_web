import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProviderContext } from '@/lib/context';
import { ThemeProvider } from './ThemeProvider';

describe('ThemeProvider', () => {
	beforeEach(() => {
		localStorage.clear();
		document.documentElement.className = '';
		vi.unstubAllGlobals();
	});

	it('uses stored theme and applies class', () => {
		localStorage.setItem('vite-ui-theme', 'light');
		render(
			<ThemeProvider>
				<ThemeProviderContext.Consumer>
					{({ theme }) => <span data-testid="theme-value">{theme}</span>}
				</ThemeProviderContext.Consumer>
			</ThemeProvider>
		);

		expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
		expect(document.documentElement).toHaveClass('light');
	});

	it('updates theme and localStorage through context setter', async () => {
		render(
			<ThemeProvider defaultTheme="light">
				<ThemeProviderContext.Consumer>
					{({ theme, setTheme }) => (
						<div>
							<span data-testid="theme-value">{theme}</span>
							<button type="button" onClick={() => setTheme('dark')}>
								set-dark
							</button>
						</div>
					)}
				</ThemeProviderContext.Consumer>
			</ThemeProvider>
		);

		fireEvent.click(screen.getByRole('button', { name: 'set-dark' }));
		await waitFor(() => {
			expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
		});
		expect(localStorage.getItem('vite-ui-theme')).toBe('dark');
		expect(document.documentElement).toHaveClass('dark');
	});

	it('applies system dark theme when defaultTheme is system', () => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn().mockReturnValue({
				matches: true,
				media: '(prefers-color-scheme: dark)',
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
			})
		);

		render(
			<ThemeProvider defaultTheme="system">
				<span data-testid="child">child</span>
			</ThemeProvider>
		);

		expect(screen.getByTestId('child')).toBeInTheDocument();
		expect(document.documentElement).toHaveClass('dark');
		vi.unstubAllGlobals();
	});

	it('applies system light theme when matchMedia is not dark', () => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn().mockReturnValue({
				matches: false,
				media: '(prefers-color-scheme: dark)',
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
			})
		);

		render(
			<ThemeProvider defaultTheme="system">
				<span data-testid="child-light">child</span>
			</ThemeProvider>
		);

		expect(screen.getByTestId('child-light')).toBeInTheDocument();
		expect(document.documentElement).toHaveClass('light');
	});

	it('updates the applied theme when system preference changes', async () => {
		let changeListener:
			| ((event: MediaQueryListEvent | { matches: boolean }) => void)
			| undefined;

		vi.stubGlobal(
			'matchMedia',
			vi.fn().mockReturnValue({
				matches: false,
				media: '(prefers-color-scheme: dark)',
				addEventListener: vi.fn(
					(
						eventName: string,
						listener: (
							event: MediaQueryListEvent | { matches: boolean }
						) => void
					) => {
						if (eventName === 'change') changeListener = listener;
					}
				),
				removeEventListener: vi.fn(),
			})
		);

		render(
			<ThemeProvider defaultTheme="system">
				<span data-testid="child-system-change">child</span>
			</ThemeProvider>
		);

		expect(document.documentElement).toHaveClass('light');
		changeListener?.({ matches: true });

		await waitFor(() => {
			expect(document.documentElement).toHaveClass('dark');
		});
	});
});
