import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockJson, mockPost } = vi.hoisted(() => ({
	mockJson: vi.fn(),
	mockPost: vi.fn(),
}));

vi.mock('@/lib/api/client', () => ({
	apiClient: {
		post: mockPost,
	},
}));

vi.mock('@/lib/locales/i18n', () => ({
	getActiveLocale: () => 'it-IT',
}));

import {
	fetchCsrfToken,
	refreshToken,
	register,
	sendRegistrationCode,
} from './auth-repository';

describe('auth repository registration requests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockJson.mockResolvedValue(undefined);
		mockPost.mockReturnValue({ json: mockJson });
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(
				new Response(JSON.stringify({ csrfToken: 'csrf-token' }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				})
			)
		);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('does not retry registration because errors are structured and the request creates state', async () => {
		const request = {
			firstName: 'John',
			lastName: 'Doe',
			email: 'john@example.com',
			password: 'password123',
			handle: 'johndoe',
			dateOfBirth: '2000-01-01',
			locale: 'it-IT' as const,
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

	it('sends the active locale when fetching a CSRF token', async () => {
		await fetchCsrfToken();

		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining('v1/auth/csrf'),
			{
				credentials: 'include',
				headers: { 'Accept-Language': 'it-IT' },
			}
		);
	});

	it('sends the active locale when refreshing authentication', async () => {
		await refreshToken();

		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining('v1/auth/refresh'),
			{
				method: 'POST',
				credentials: 'include',
				headers: { 'Accept-Language': 'it-IT' },
			}
		);
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
