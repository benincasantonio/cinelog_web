import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockJson, mockPost } = vi.hoisted(() => ({
	mockJson: vi.fn(),
	mockPost: vi.fn(),
}));

vi.mock('@/lib/api/client', () => ({
	apiClient: {
		post: mockPost,
	},
}));

import { register, sendRegistrationCode } from './auth-repository';

describe('auth repository registration requests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockJson.mockResolvedValue(undefined);
		mockPost.mockReturnValue({ json: mockJson });
	});

	it('does not retry registration because errors are structured and the request creates state', async () => {
		const request = {
			firstName: 'John',
			lastName: 'Doe',
			email: 'john@example.com',
			password: 'password123',
			handle: 'johndoe',
			dateOfBirth: '2000-01-01',
			profileVisibility: 'private' as const,
			verificationCode: 'ABC123',
		};

		await register(request);

		expect(mockPost).toHaveBeenCalledWith('v1/auth/register', {
			json: request,
			skipAuth: true,
			retry: 0,
		});
	});

	it('does not retry sending a registration code', async () => {
		const request = { email: 'john@example.com' };

		await sendRegistrationCode(request);

		expect(mockPost).toHaveBeenCalledWith('v1/auth/register/send-code', {
			json: request,
			skipAuth: true,
			retry: 0,
		});
	});
});
