import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock('react-router-dom', () => ({
	useLocation: () => ({ pathname: '/login' }),
	useNavigate: () => vi.fn(),
}));

vi.mock('../components', () => ({
	AuthTabs: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="auth-tabs">{children}</div>
	),
	LoginForm: () => <div data-testid="login-form">Login Form</div>,
}));

import LoginPage from './LoginPage';

describe('LoginPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render the page title', () => {
		render(<LoginPage />);

		const titleElement = document.querySelector('title');
		expect(titleElement).toBeInTheDocument();
		expect(titleElement?.textContent).toBe('LoginPage.pageTitle');
	});

	it('should render within AuthTabs', () => {
		render(<LoginPage />);

		expect(screen.getByTestId('auth-tabs')).toBeInTheDocument();
	});

	it('should render the card title and description', () => {
		render(<LoginPage />);

		expect(screen.getByText('LoginPage.title')).toBeInTheDocument();
		expect(screen.getByText('LoginPage.description')).toBeInTheDocument();
	});

	it('should render the LoginForm', () => {
		render(<LoginPage />);

		expect(screen.getByTestId('login-form')).toBeInTheDocument();
	});
});
