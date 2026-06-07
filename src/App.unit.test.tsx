import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockFetchUserInfo = vi.fn();

vi.mock('@/features/auth/stores', () => ({
	useAuthStore: (selector: (state: { fetchUserInfo: () => void }) => unknown) =>
		selector({ fetchUserInfo: mockFetchUserInfo }),
}));

vi.mock('react-router-dom', () => ({
	BrowserRouter: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="browser-router">{children}</div>
	),
}));

vi.mock('./lib/components/ThemeProvider', () => ({
	ThemeProvider: ({
		children,
		defaultTheme,
		storageKey,
	}: {
		children: React.ReactNode;
		defaultTheme?: string;
		storageKey?: string;
	}) => (
		<div
			data-testid="theme-provider"
			data-default-theme={defaultTheme}
			data-storage-key={storageKey}
		>
			{children}
		</div>
	),
}));

vi.mock('./routes', () => ({
	AppRoutes: () => <div data-testid="app-routes">Routes</div>,
}));

import App from './App';

describe('App', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should call fetchUserInfo on mount', () => {
		render(<App />);

		expect(mockFetchUserInfo).toHaveBeenCalledOnce();
	});

	it('should render ThemeProvider', () => {
		render(<App />);

		expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
	});

	it('should configure ThemeProvider with system as the default theme', () => {
		render(<App />);

		expect(screen.getByTestId('theme-provider')).toHaveAttribute(
			'data-default-theme',
			'system'
		);
		expect(screen.getByTestId('theme-provider')).toHaveAttribute(
			'data-storage-key',
			'cinelog-theme'
		);
	});

	it('should render BrowserRouter inside ThemeProvider', () => {
		render(<App />);

		const themeProvider = screen.getByTestId('theme-provider');
		const router = screen.getByTestId('browser-router');
		expect(themeProvider).toContainElement(router);
	});

	it('should render AppRoutes', () => {
		render(<App />);

		expect(screen.getByTestId('app-routes')).toBeInTheDocument();
	});
});
