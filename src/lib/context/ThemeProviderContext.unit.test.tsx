import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProviderContext } from './ThemeProviderContext';

describe('ThemeProviderContext', () => {
	it('exposes system theme as default context value', () => {
		let setThemeResult: unknown;
		render(
			<ThemeProviderContext.Consumer>
				{({ theme, setTheme }) => {
					setThemeResult = setTheme('dark');
					return <span data-testid="theme-default">{theme}</span>;
				}}
			</ThemeProviderContext.Consumer>
		);

		expect(screen.getByTestId('theme-default')).toHaveTextContent('system');
		expect(setThemeResult).toBeNull();
	});
});
