import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResetPasswordForm } from './ResetPasswordForm';

// Mock react-i18next
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

// Mock auth repository
const mockResetPassword = vi.fn();
vi.mock('../repositories/auth-repository', () => ({
	resetPassword: (...args: unknown[]) => mockResetPassword(...args),
}));

describe('ResetPasswordForm', () => {
	const mockOnBack = vi.fn();
	const testEmail = 'test@example.com';
	const validPassword = 'newpassword123';

	const fillResetFields = ({
		code = '123456',
		password = validPassword,
		confirmPassword = validPassword,
	}: {
		code?: string;
		password?: string;
		confirmPassword?: string;
	} = {}) => {
		fireEvent.change(
			screen.getByPlaceholderText('ResetPasswordForm.codePlaceholder'),
			{ target: { value: code } }
		);
		fireEvent.change(
			screen.getByPlaceholderText('ResetPasswordForm.newPassword'),
			{ target: { value: password } }
		);
		fireEvent.change(
			screen.getByPlaceholderText('ResetPasswordForm.confirmPassword'),
			{ target: { value: confirmPassword } }
		);
	};

	const submitResetForm = () => {
		fireEvent.click(
			screen.getByRole('button', {
				name: 'ResetPasswordForm.submitReset',
			})
		);
	};

	beforeEach(() => {
		mockResetPassword.mockClear();
		mockOnBack.mockClear();
		mockNavigate.mockClear();
	});

	describe('Rendering', () => {
		it('should render the code input field', () => {
			render(<ResetPasswordForm email={testEmail} onBack={mockOnBack} />);

			expect(
				screen.getByPlaceholderText('ResetPasswordForm.codePlaceholder')
			).toBeInTheDocument();
		});

		it('should render the new password input field', () => {
			render(<ResetPasswordForm email={testEmail} onBack={mockOnBack} />);

			expect(
				screen.getByPlaceholderText('ResetPasswordForm.newPassword')
			).toBeInTheDocument();
		});

		it('should render the confirm password input field', () => {
			render(<ResetPasswordForm email={testEmail} onBack={mockOnBack} />);

			expect(
				screen.getByPlaceholderText('ResetPasswordForm.confirmPassword')
			).toBeInTheDocument();
		});

		it('should render the submit button', () => {
			render(<ResetPasswordForm email={testEmail} onBack={mockOnBack} />);

			expect(
				screen.getByRole('button', {
					name: 'ResetPasswordForm.submitReset',
				})
			).toBeInTheDocument();
		});

		it('should render the back button', () => {
			render(<ResetPasswordForm email={testEmail} onBack={mockOnBack} />);

			expect(
				screen.getByRole('button', {
					name: 'ResetPasswordForm.backToEmail',
				})
			).toBeInTheDocument();
		});

		it('should display the email the code was sent to', () => {
			render(<ResetPasswordForm email={testEmail} onBack={mockOnBack} />);

			expect(
				screen.getByText('ResetPasswordForm.emailSentTo')
			).toBeInTheDocument();
		});
	});

	describe('Prefilling', () => {
		it('should prefill the code field when initialCode is provided', () => {
			render(
				<ResetPasswordForm
					email={testEmail}
					initialCode="ABC123"
					onBack={mockOnBack}
				/>
			);

			const codeInput = screen.getByPlaceholderText(
				'ResetPasswordForm.codePlaceholder'
			);
			expect(codeInput).toHaveValue('ABC123');
		});

		it('should leave code field empty when initialCode is not provided', () => {
			render(<ResetPasswordForm email={testEmail} onBack={mockOnBack} />);

			const codeInput = screen.getByPlaceholderText(
				'ResetPasswordForm.codePlaceholder'
			);
			expect(codeInput).toHaveValue('');
		});

		it('should submit with the prefilled code value', async () => {
			mockResetPassword.mockResolvedValueOnce(undefined);

			render(
				<ResetPasswordForm
					email={testEmail}
					initialCode="PREFILLED"
					onBack={mockOnBack}
				/>
			);

			fillResetFields({ code: 'PREFILLED' });
			submitResetForm();

			await waitFor(() => {
				expect(mockResetPassword).toHaveBeenCalledWith({
					email: testEmail,
					code: 'PREFILLED',
					new_password: validPassword,
				});
			});
		});
	});

	describe('Back button', () => {
		it('should call onBack when back button is clicked', async () => {
			render(<ResetPasswordForm email={testEmail} onBack={mockOnBack} />);

			const backButton = screen.getByRole('button', {
				name: 'ResetPasswordForm.backToEmail',
			});
			fireEvent.click(backButton);

			expect(mockOnBack).toHaveBeenCalledTimes(1);
		});
	});

	describe('Validation', () => {
		it('should not call resetPassword with empty fields', async () => {
			render(<ResetPasswordForm email={testEmail} onBack={mockOnBack} />);

			const submitButton = screen.getByRole('button', {
				name: 'ResetPasswordForm.submitReset',
			});
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockResetPassword).not.toHaveBeenCalled();
			});
		});
	});

	describe('Successful submission', () => {
		it('should call resetPassword with email, code and new password', async () => {
			mockResetPassword.mockResolvedValueOnce(undefined);

			render(<ResetPasswordForm email={testEmail} onBack={mockOnBack} />);

			fillResetFields();
			submitResetForm();

			await waitFor(() => {
				expect(mockResetPassword).toHaveBeenCalledWith({
					email: testEmail,
					code: '123456',
					new_password: validPassword,
				});
			});
		});

		it('should navigate to /login after successful reset', async () => {
			mockResetPassword.mockResolvedValueOnce(undefined);

			render(<ResetPasswordForm email={testEmail} onBack={mockOnBack} />);

			fillResetFields();
			submitResetForm();

			await waitFor(() => {
				expect(mockNavigate).toHaveBeenCalledWith('/login');
			});
		});

		it('should show submitting text while loading', async () => {
			let resolvePromise: () => void;
			const promise = new Promise<void>((resolve) => {
				resolvePromise = resolve;
			});
			mockResetPassword.mockReturnValueOnce(promise);

			render(<ResetPasswordForm email={testEmail} onBack={mockOnBack} />);

			fillResetFields();
			submitResetForm();

			await waitFor(() => {
				expect(
					screen.getByRole('button', {
						name: 'ResetPasswordForm.submittingReset',
					})
				).toBeDisabled();
			});

			await act(async () => {
				resolvePromise!();
			});
		});
	});

	describe('Error handling', () => {
		it('should show error message when resetPassword throws an Error', async () => {
			mockResetPassword.mockRejectedValueOnce(new Error('Invalid code'));

			render(<ResetPasswordForm email={testEmail} onBack={mockOnBack} />);

			fillResetFields({ code: 'wrong-code' });
			submitResetForm();

			await waitFor(() => {
				expect(screen.getByText('Invalid code')).toBeInTheDocument();
			});
		});

		it('should show generic error for non-Error exceptions', async () => {
			mockResetPassword.mockRejectedValueOnce('unknown');

			render(<ResetPasswordForm email={testEmail} onBack={mockOnBack} />);

			fillResetFields();
			submitResetForm();

			await waitFor(() => {
				expect(
					screen.getByText('ResetPasswordForm.errorReset')
				).toBeInTheDocument();
			});
		});

		it('should not navigate when resetPassword fails', async () => {
			mockResetPassword.mockRejectedValueOnce(new Error('Failed'));

			render(<ResetPasswordForm email={testEmail} onBack={mockOnBack} />);

			fillResetFields();
			submitResetForm();

			await waitFor(() => {
				expect(screen.getByText('Failed')).toBeInTheDocument();
			});
			expect(mockNavigate).not.toHaveBeenCalled();
		});
	});
});
