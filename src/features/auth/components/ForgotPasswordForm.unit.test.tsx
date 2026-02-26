import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ForgotPasswordForm } from './ForgotPasswordForm';

// Mock react-i18next
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return {
		...actual,
		Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
			<a href={to}>{children}</a>
		),
	};
});

// Mock auth repository
const mockForgotPassword = vi.fn();
vi.mock('../repositories/auth-repository', () => ({
	forgotPassword: (...args: unknown[]) => mockForgotPassword(...args),
}));

describe('ForgotPasswordForm', () => {
	const mockOnSuccess = vi.fn();
	const testEmail = 'test@example.com';

	const submitButton = () =>
		screen.getByRole('button', {
			name: 'ForgotPasswordForm.submitEmail',
		});

	const fillEmail = (email = testEmail) => {
		fireEvent.change(screen.getByPlaceholderText('ForgotPasswordForm.email'), {
			target: { value: email },
		});
	};

	beforeEach(() => {
		mockForgotPassword.mockClear();
		mockOnSuccess.mockClear();
	});

	describe('Rendering', () => {
		it('should render the email input field', () => {
			render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

			expect(
				screen.getByPlaceholderText('ForgotPasswordForm.email')
			).toBeInTheDocument();
		});

		it('should render the submit button with correct text', () => {
			render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

			expect(
				screen.getByRole('button', {
					name: 'ForgotPasswordForm.submitEmail',
				})
			).toBeInTheDocument();
		});

		it('should render a back to login link', () => {
			render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

			const link = screen.getByText('ForgotPasswordForm.backToLogin');
			expect(link).toBeInTheDocument();
			expect(link).toHaveAttribute('href', '/login');
		});
	});

	describe('Validation', () => {
		it('should not call forgotPassword with empty email', async () => {
			render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

			fireEvent.click(submitButton());

			await waitFor(() => {
				expect(mockForgotPassword).not.toHaveBeenCalled();
			});
		});
	});

	describe('Successful submission', () => {
		it('should call forgotPassword with the entered email', async () => {
			mockForgotPassword.mockResolvedValueOnce(undefined);

			render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

			fillEmail();
			fireEvent.click(submitButton());

			await waitFor(() => {
				expect(mockForgotPassword).toHaveBeenCalledWith({
					email: testEmail,
				});
			});
		});

		it('should call onSuccess with the email after successful submission', async () => {
			mockForgotPassword.mockResolvedValueOnce(undefined);

			render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

			fillEmail();
			fireEvent.click(submitButton());

			await waitFor(() => {
				expect(mockOnSuccess).toHaveBeenCalledWith(testEmail);
			});
		});

		it('should show submitting text while loading', async () => {
			let resolvePromise: () => void;
			const promise = new Promise<void>((resolve) => {
				resolvePromise = resolve;
			});
			mockForgotPassword.mockReturnValueOnce(promise);

			render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

			fillEmail();
			fireEvent.click(submitButton());

			await waitFor(() => {
				expect(
					screen.getByRole('button', {
						name: 'ForgotPasswordForm.submittingEmail',
					})
				).toBeDisabled();
			});

			await act(async () => {
				resolvePromise!();
			});
		});
	});

	describe('Error handling', () => {
		it('should show error message when forgotPassword throws an Error', async () => {
			mockForgotPassword.mockRejectedValueOnce(new Error('User not found'));

			render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

			fillEmail();
			fireEvent.click(submitButton());

			await waitFor(() => {
				expect(screen.getByText('User not found')).toBeInTheDocument();
			});
		});

		it('should show generic error message when forgotPassword throws a non-Error', async () => {
			mockForgotPassword.mockRejectedValueOnce('unknown error');

			render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

			fillEmail();
			fireEvent.click(submitButton());

			await waitFor(() => {
				expect(
					screen.getByText('ForgotPasswordForm.errorEmail')
				).toBeInTheDocument();
			});
		});

		it('should not call onSuccess when forgotPassword fails', async () => {
			mockForgotPassword.mockRejectedValueOnce(new Error('Failed'));

			render(<ForgotPasswordForm onSuccess={mockOnSuccess} />);

			fillEmail();
			fireEvent.click(submitButton());

			await waitFor(() => {
				expect(screen.getByText('Failed')).toBeInTheDocument();
			});
			expect(mockOnSuccess).not.toHaveBeenCalled();
		});
	});
});
