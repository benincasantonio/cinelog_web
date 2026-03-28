import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockUpdateProfile, mockChangePassword } = vi.hoisted(() => ({
	mockUpdateProfile: vi.fn(),
	mockChangePassword: vi.fn(),
}));

vi.mock('@/features/auth/repositories/user-repository', () => ({
	updateProfile: mockUpdateProfile,
	changePassword: mockChangePassword,
}));

import { useUserStore } from './useUserStore';

const mockUser = {
	id: 'user-123',
	firstName: 'Jane',
	lastName: 'Doe',
	email: 'jane@example.com',
	handle: 'janedoe',
	dateOfBirth: '1990-01-15',
	bio: 'A bio',
};

describe('useUserStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('updateProfile', () => {
		it('should call the updateProfile API with the provided data', async () => {
			mockUpdateProfile.mockResolvedValueOnce(mockUser);

			await useUserStore.getState().updateProfile({ firstName: 'Janet' });

			expect(mockUpdateProfile).toHaveBeenCalledWith({ firstName: 'Janet' });
		});

		it('should return the updated user response', async () => {
			const updatedUser = { ...mockUser, firstName: 'Janet' };
			mockUpdateProfile.mockResolvedValueOnce(updatedUser);

			const result = await useUserStore
				.getState()
				.updateProfile({ firstName: 'Janet' });

			expect(result).toEqual(updatedUser);
		});

		it('should propagate errors from the API', async () => {
			mockUpdateProfile.mockRejectedValueOnce(new Error('Server error'));

			await expect(
				useUserStore.getState().updateProfile({ firstName: 'Janet' })
			).rejects.toThrow('Server error');
		});
	});

	describe('changePassword', () => {
		it('should call the changePassword API with the provided data', async () => {
			mockChangePassword.mockResolvedValueOnce(undefined);
			const data = { currentPassword: 'oldPass1', newPassword: 'newPass1' };

			await useUserStore.getState().changePassword(data);

			expect(mockChangePassword).toHaveBeenCalledWith(data);
		});

		it('should propagate errors from the API', async () => {
			mockChangePassword.mockRejectedValueOnce(
				new Error('Invalid current password')
			);

			await expect(
				useUserStore.getState().changePassword({
					currentPassword: 'wrong',
					newPassword: 'newPass1',
				})
			).rejects.toThrow('Invalid current password');
		});
	});
});
