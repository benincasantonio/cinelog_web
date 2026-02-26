import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeProviderContext } from '@/lib/context';
import { ThemeProvider } from './ThemeProvider';

describe('ThemeProvider', () => {
	beforeEach(() => {
		localStorage.clear();
		document.documentElement.className = '';
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
});
