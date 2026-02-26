import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
	useNavigate: () => mockNavigate,
}));

let capturedOnSuccess: (email: string) => void;
vi.mock('../components', () => ({
	ForgotPasswordForm: ({
		onSuccess,
	}: {
		onSuccess: (email: string) => void;
	}) => {
		capturedOnSuccess = onSuccess;
		return <div data-testid="forgot-password-form">Form</div>;
	},
}));

import ForgotPasswordPage from './ForgotPasswordPage';

describe('ForgotPasswordPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render the page title', () => {
		render(<ForgotPasswordPage />);

		const titleElement = document.querySelector('title');
		expect(titleElement).toBeInTheDocument();
		expect(titleElement?.textContent).toBe('ForgotPasswordPage.pageTitle');
	});

	it('should render the card title and description', () => {
		render(<ForgotPasswordPage />);

		expect(screen.getByText('ForgotPasswordPage.title')).toBeInTheDocument();
		expect(
			screen.getByText('ForgotPasswordPage.description')
		).toBeInTheDocument();
	});

	it('should render the ForgotPasswordForm', () => {
		render(<ForgotPasswordPage />);

		expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();
	});

	it('should navigate to /reset-password with email state on success', () => {
		render(<ForgotPasswordPage />);

		capturedOnSuccess('test@example.com');

		expect(mockNavigate).toHaveBeenCalledWith('/reset-password', {
			state: { email: 'test@example.com' },
		});
	});
});
