import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
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

const mockUpdateProfile = vi.fn();
vi.mock('../stores', () => ({
	useUserStore: (
		selector: (state: { updateProfile: typeof mockUpdateProfile }) => unknown
	) => selector({ updateProfile: mockUpdateProfile }),
}));

const mockUserInfo = {
	id: '1',
	firstName: 'Jane',
	lastName: 'Doe',
	email: 'jane@example.com',
	handle: 'janedoe',
	dateOfBirth: '1990-01-15',
	bio: 'My bio',
};

const mockUpdateUserInfo = vi.fn();
vi.mock('@/features/auth/stores', () => ({
	useAuthStore: (
		selector: (state: {
			userInfo: typeof mockUserInfo;
			updateUserInfo: typeof mockUpdateUserInfo;
		}) => unknown
	) => selector({ userInfo: mockUserInfo, updateUserInfo: mockUpdateUserInfo }),
}));

import { UpdateProfileForm } from './UpdateProfileForm';

describe('UpdateProfileForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('rendering', () => {
		it('should render all form fields', () => {
			render(<UpdateProfileForm />);

			expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
			expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
			expect(screen.getByDisplayValue('1990-01-15')).toBeInTheDocument();
			expect(screen.getByDisplayValue('My bio')).toBeInTheDocument();
		});

		it('should render email and handle as disabled', () => {
			render(<UpdateProfileForm />);

			const emailInput = screen.getByDisplayValue('jane@example.com');
			const handleInput = screen.getByDisplayValue('janedoe');

			expect(emailInput).toBeDisabled();
			expect(handleInput).toBeDisabled();
		});

		it('should render the submit button', () => {
			render(<UpdateProfileForm />);

			expect(
				screen.getByRole('button', { name: 'UpdateProfileForm.submit' })
			).toBeInTheDocument();
		});
	});

	describe('validation', () => {
		it('should show error when firstName is cleared', async () => {
			render(<UpdateProfileForm />);

			fireEvent.change(screen.getByDisplayValue('Jane'), {
				target: { value: '' },
			});
			fireEvent.click(
				screen.getByRole('button', { name: 'UpdateProfileForm.submit' })
			);

			await waitFor(() => {
				expect(
					screen.getByText('UpdateProfileForm.firstNameRequired')
				).toBeInTheDocument();
			});

			expect(mockUpdateProfile).not.toHaveBeenCalled();
		});

		it('should show error when lastName is cleared', async () => {
			render(<UpdateProfileForm />);

			fireEvent.change(screen.getByDisplayValue('Doe'), {
				target: { value: '' },
			});
			fireEvent.click(
				screen.getByRole('button', { name: 'UpdateProfileForm.submit' })
			);

			await waitFor(() => {
				expect(
					screen.getByText('UpdateProfileForm.lastNameRequired')
				).toBeInTheDocument();
			});

			expect(mockUpdateProfile).not.toHaveBeenCalled();
		});

		it('should show error when dateOfBirth is cleared', async () => {
			render(<UpdateProfileForm />);

			fireEvent.change(screen.getByDisplayValue('1990-01-15'), {
				target: { value: '' },
			});
			fireEvent.click(
				screen.getByRole('button', { name: 'UpdateProfileForm.submit' })
			);

			await waitFor(() => {
				expect(
					screen.getByText('UpdateProfileForm.dateOfBirthRequired')
				).toBeInTheDocument();
			});

			expect(mockUpdateProfile).not.toHaveBeenCalled();
		});
	});

	describe('button state', () => {
		it('should disable submit button when form is pristine', () => {
			render(<UpdateProfileForm />);

			expect(
				screen.getByRole('button', { name: 'UpdateProfileForm.submit' })
			).toBeDisabled();
		});

		it('should show submitting label while loading', async () => {
			let resolvePromise: (value: typeof mockUserInfo) => void;
			mockUpdateProfile.mockReturnValueOnce(
				new Promise((resolve) => {
					resolvePromise = resolve;
				})
			);
			render(<UpdateProfileForm />);

			fireEvent.change(screen.getByDisplayValue('Jane'), {
				target: { value: 'Janet' },
			});
			fireEvent.click(
				screen.getByRole('button', { name: 'UpdateProfileForm.submit' })
			);

			await waitFor(() => {
				expect(
					screen.getByRole('button', {
						name: 'UpdateProfileForm.submitting',
					})
				).toBeInTheDocument();
			});

			resolvePromise!({ ...mockUserInfo, firstName: 'Janet' });

			await waitFor(() => {
				expect(
					screen.getByRole('button', { name: 'UpdateProfileForm.submit' })
				).toBeInTheDocument();
			});
		});

		it('should disable submit button while loading', async () => {
			let resolvePromise: (value: typeof mockUserInfo) => void;
			mockUpdateProfile.mockReturnValueOnce(
				new Promise((resolve) => {
					resolvePromise = resolve;
				})
			);
			render(<UpdateProfileForm />);

			fireEvent.change(screen.getByDisplayValue('Jane'), {
				target: { value: 'Janet' },
			});
			fireEvent.click(
				screen.getByRole('button', { name: 'UpdateProfileForm.submit' })
			);

			await waitFor(() => {
				expect(
					screen.getByRole('button', {
						name: 'UpdateProfileForm.submitting',
					})
				).toBeDisabled();
			});

			resolvePromise!({ ...mockUserInfo, firstName: 'Janet' });

			await waitFor(() => {
				expect(
					screen.getByRole('button', { name: 'UpdateProfileForm.submit' })
				).toBeInTheDocument();
			});
		});

		it('should enable submit button when a field is changed', () => {
			render(<UpdateProfileForm />);

			fireEvent.change(screen.getByDisplayValue('Jane'), {
				target: { value: 'Janet' },
			});

			expect(
				screen.getByRole('button', { name: 'UpdateProfileForm.submit' })
			).toBeEnabled();
		});
	});

	describe('successful submission', () => {
		it('should call updateProfile and show success notification', async () => {
			const updatedUser = { ...mockUserInfo, firstName: 'Janet' };
			mockUpdateProfile.mockResolvedValueOnce(updatedUser);
			render(<UpdateProfileForm />);

			fireEvent.change(screen.getByDisplayValue('Jane'), {
				target: { value: 'Janet' },
			});
			fireEvent.click(
				screen.getByRole('button', { name: 'UpdateProfileForm.submit' })
			);

			await waitFor(() => {
				expect(mockUpdateProfile).toHaveBeenCalledWith({ firstName: 'Janet' });
			});

			await waitFor(() => {
				expect(mockUpdateUserInfo).toHaveBeenCalledWith(updatedUser);
				expect(mockNotify).toHaveBeenCalledWith({
					variant: 'success',
					message: 'UpdateProfileForm.success',
				});
			});
		});

		it('should disable submit button after successful save', async () => {
			const updatedUser = { ...mockUserInfo, firstName: 'Janet' };
			mockUpdateProfile.mockResolvedValueOnce(updatedUser);
			render(<UpdateProfileForm />);

			fireEvent.change(screen.getByDisplayValue('Jane'), {
				target: { value: 'Janet' },
			});
			fireEvent.click(
				screen.getByRole('button', { name: 'UpdateProfileForm.submit' })
			);

			await waitFor(() => {
				expect(
					screen.getByRole('button', { name: 'UpdateProfileForm.submit' })
				).toBeDisabled();
			});
		});

		it('should only send changed fields in the payload', async () => {
			const updatedUser = {
				...mockUserInfo,
				firstName: 'Janet',
				bio: 'New bio',
			};
			mockUpdateProfile.mockResolvedValueOnce(updatedUser);
			render(<UpdateProfileForm />);

			fireEvent.change(screen.getByDisplayValue('Jane'), {
				target: { value: 'Janet' },
			});
			fireEvent.change(screen.getByDisplayValue('My bio'), {
				target: { value: 'New bio' },
			});
			fireEvent.click(
				screen.getByRole('button', { name: 'UpdateProfileForm.submit' })
			);

			await waitFor(() => {
				expect(mockUpdateProfile).toHaveBeenCalledWith({
					firstName: 'Janet',
					bio: 'New bio',
				});
			});
		});

		it('should not call updateProfile when no fields changed', async () => {
			render(<UpdateProfileForm />);

			fireEvent.click(
				screen.getByRole('button', { name: 'UpdateProfileForm.submit' })
			);

			await waitFor(() => {
				expect(mockUpdateProfile).not.toHaveBeenCalled();
			});
		});
	});

	describe('error handling', () => {
		it('should show danger notification on API error', async () => {
			mockUpdateProfile.mockRejectedValueOnce(new Error('Server error'));
			render(<UpdateProfileForm />);

			fireEvent.change(screen.getByDisplayValue('Jane'), {
				target: { value: 'Janet' },
			});
			fireEvent.click(
				screen.getByRole('button', { name: 'UpdateProfileForm.submit' })
			);

			await waitFor(() => {
				expect(mockNotify).toHaveBeenCalledWith({
					variant: 'danger',
					message: 'UpdateProfileForm.error',
				});
			});
		});
	});
});
