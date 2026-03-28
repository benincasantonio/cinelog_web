import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string, _opts?: { defaultValue?: string }) => key,
	}),
}));

const mockNotify = vi.fn();
vi.mock('@antoniobenincasa/ui', async () => {
	const actual = await vi.importActual('@antoniobenincasa/ui');
	return {
		...actual,
		useNotification: () => ({
			notify: mockNotify,
			dismiss: vi.fn(),
			dismissAll: vi.fn(),
		}),
	};
});

const mockChangePassword = vi.fn();
vi.mock('../stores', () => ({
	useUserStore: (
		selector: (state: { changePassword: typeof mockChangePassword }) => unknown
	) => selector({ changePassword: mockChangePassword }),
}));

vi.mock('@/lib/api/api-error', async () => {
	const actual = await vi.importActual('@/lib/api/api-error');
	return {
		...actual,
		extractApiError: vi.fn().mockResolvedValue(null),
	};
});

import { extractApiError } from '@/lib/api/api-error';
import { ChangePasswordForm } from './ChangePasswordForm';

const validCurrentPassword = 'oldPassword1';
const validNewPassword = 'newPassword1';

function fillAndSubmit() {
	fireEvent.change(
		screen.getByPlaceholderText('ChangePasswordForm.currentPassword'),
		{ target: { value: validCurrentPassword } }
	);
	fireEvent.change(
		screen.getByPlaceholderText('ChangePasswordForm.newPassword'),
		{ target: { value: validNewPassword } }
	);
	fireEvent.change(
		screen.getByPlaceholderText('ChangePasswordForm.confirmPassword'),
		{ target: { value: validNewPassword } }
	);
	fireEvent.click(
		screen.getByRole('button', { name: 'ChangePasswordForm.submit' })
	);
}

describe('ChangePasswordForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('rendering', () => {
		it('should render all password fields', () => {
			render(<ChangePasswordForm />);

			expect(
				screen.getByPlaceholderText('ChangePasswordForm.currentPassword')
			).toBeInTheDocument();
			expect(
				screen.getByPlaceholderText('ChangePasswordForm.newPassword')
			).toBeInTheDocument();
			expect(
				screen.getByPlaceholderText('ChangePasswordForm.confirmPassword')
			).toBeInTheDocument();
		});

		it('should render the submit button', () => {
			render(<ChangePasswordForm />);

			expect(
				screen.getByRole('button', { name: 'ChangePasswordForm.submit' })
			).toBeInTheDocument();
		});
	});

	describe('button state', () => {
		it('should disable submit button when form is pristine', () => {
			render(<ChangePasswordForm />);

			expect(
				screen.getByRole('button', { name: 'ChangePasswordForm.submit' })
			).toBeDisabled();
		});

		it('should enable submit button when a field is changed', () => {
			render(<ChangePasswordForm />);

			fireEvent.change(
				screen.getByPlaceholderText('ChangePasswordForm.currentPassword'),
				{ target: { value: 'something' } }
			);

			expect(
				screen.getByRole('button', { name: 'ChangePasswordForm.submit' })
			).toBeEnabled();
		});
	});

	describe('validation', () => {
		it('should not call changePassword with empty fields', async () => {
			render(<ChangePasswordForm />);

			fireEvent.click(
				screen.getByRole('button', { name: 'ChangePasswordForm.submit' })
			);

			await waitFor(() => {
				expect(mockChangePassword).not.toHaveBeenCalled();
			});
		});
	});

	describe('successful submission', () => {
		it('should call changePassword and show success notification', async () => {
			mockChangePassword.mockResolvedValueOnce(undefined);
			render(<ChangePasswordForm />);

			fillAndSubmit();

			await waitFor(() => {
				expect(mockChangePassword).toHaveBeenCalledWith({
					currentPassword: validCurrentPassword,
					newPassword: validNewPassword,
				});
			});

			await waitFor(() => {
				expect(mockNotify).toHaveBeenCalledWith({
					variant: 'success',
					message: 'ChangePasswordForm.success',
				});
			});
		});
	});

	describe('error handling', () => {
		it('should show danger notification on generic API error', async () => {
			mockChangePassword.mockRejectedValueOnce(new Error('Server error'));
			render(<ChangePasswordForm />);

			fillAndSubmit();

			await waitFor(() => {
				expect(mockNotify).toHaveBeenCalledWith({
					variant: 'danger',
					message: 'ChangePasswordForm.error',
				});
			});
		});

		it('should show field error for INVALID_CURRENT_PASSWORD', async () => {
			mockChangePassword.mockRejectedValueOnce(new Error('bad'));
			vi.mocked(extractApiError).mockResolvedValueOnce({
				error_code_name: 'INVALID_CURRENT_PASSWORD',
				error_code: 4001,
				error_message: 'Invalid password',
				error_description: 'The current password is incorrect',
			});
			render(<ChangePasswordForm />);

			fillAndSubmit();

			await waitFor(() => {
				expect(
					screen.getByText('ChangePasswordForm.ApiError.invalidCurrentPassword')
				).toBeInTheDocument();
			});
		});

		it('should show field error for SAME_PASSWORD', async () => {
			mockChangePassword.mockRejectedValueOnce(new Error('bad'));
			vi.mocked(extractApiError).mockResolvedValueOnce({
				error_code_name: 'SAME_PASSWORD',
				error_code: 4002,
				error_message: 'Same password',
				error_description: 'Passwords must differ',
			});
			render(<ChangePasswordForm />);

			fillAndSubmit();

			await waitFor(() => {
				expect(
					screen.getByText('ChangePasswordForm.ApiError.samePassword')
				).toBeInTheDocument();
			});
		});
	});
});
