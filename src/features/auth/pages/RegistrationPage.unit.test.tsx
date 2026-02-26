import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock('react-router-dom', () => ({
	useLocation: () => ({ pathname: '/registration' }),
	useNavigate: () => vi.fn(),
}));

vi.mock('../components', () => ({
	AuthTabs: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="auth-tabs">{children}</div>
	),
	RegistrationForm: () => (
		<div data-testid="registration-form">Registration Form</div>
	),
}));

import RegistrationPage from './RegistrationPage';

describe('RegistrationPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render the page title', () => {
		render(<RegistrationPage />);

		const titleElement = document.querySelector('title');
		expect(titleElement).toBeInTheDocument();
		expect(titleElement?.textContent).toBe('RegistrationPage.pageTitle');
	});

	it('should render within AuthTabs', () => {
		render(<RegistrationPage />);

		expect(screen.getByTestId('auth-tabs')).toBeInTheDocument();
	});

	it('should render the card title and description', () => {
		render(<RegistrationPage />);

		expect(screen.getByText('RegistrationPage.title')).toBeInTheDocument();
		expect(
			screen.getByText('RegistrationPage.description')
		).toBeInTheDocument();
	});

	it('should render the RegistrationForm', () => {
		render(<RegistrationPage />);

		expect(screen.getByTestId('registration-form')).toBeInTheDocument();
	});
});
