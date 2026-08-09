import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockDelete, mockGet, mockJson, mockPut } = vi.hoisted(() => ({
	mockDelete: vi.fn(),
	mockGet: vi.fn(),
	mockJson: vi.fn(),
	mockPut: vi.fn(),
}));

vi.mock('@/lib/api/client', () => ({
	apiClient: {
		delete: mockDelete,
		get: mockGet,
		put: mockPut,
	},
}));

import {
	followUser,
	getProfile,
	unfollowUser,
	updateLocale,
} from './user-repository';

describe('user repository profile requests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockJson.mockResolvedValue(undefined);
		mockGet.mockReturnValue({ json: mockJson });
		mockPut.mockReturnValue({ json: mockJson });
		mockDelete.mockResolvedValue(new Response(null, { status: 204 }));
	});

	it('fetches a profile with an encoded handle', async () => {
		await getProfile('movie fan/é');

		expect(mockGet).toHaveBeenCalledWith(
			'v1/users/movie%20fan%2F%C3%A9/profile'
		);
		expect(mockJson).toHaveBeenCalledOnce();
	});

	it('follows a profile without parsing the empty response', async () => {
		await followUser('movie fan/é');

		expect(mockPut).toHaveBeenCalledWith(
			'v1/users/movie%20fan%2F%C3%A9/follow'
		);
		expect(mockJson).not.toHaveBeenCalled();
	});

	it('updates and returns the saved account locale', async () => {
		mockJson.mockResolvedValueOnce({ locale: 'fr-FR' });

		await expect(updateLocale('fr-FR')).resolves.toEqual({
			locale: 'fr-FR',
		});

		expect(mockPut).toHaveBeenCalledWith('v1/users/settings/locale', {
			json: { locale: 'fr-FR' },
		});
		expect(mockJson).toHaveBeenCalledOnce();
	});

	it('falls back to the requested locale when the success body is not valid JSON', async () => {
		mockJson.mockRejectedValueOnce(
			new SyntaxError('Unexpected end of JSON input')
		);

		await expect(updateLocale('it-IT')).resolves.toEqual({ locale: 'it-IT' });
	});

	it('falls back to the requested locale when the success body is null', async () => {
		mockJson.mockResolvedValueOnce(null);

		await expect(updateLocale('fr-FR')).resolves.toEqual({ locale: 'fr-FR' });
	});

	it('does not treat a failed locale request as a successful update', async () => {
		mockPut.mockRejectedValueOnce(new Error('HTTP 500'));

		await expect(updateLocale('fr-FR')).rejects.toThrow('HTTP 500');
		expect(mockJson).not.toHaveBeenCalled();
	});

	it('unfollows a profile without parsing the empty response', async () => {
		await unfollowUser('movie fan/é');

		expect(mockDelete).toHaveBeenCalledWith(
			'v1/users/movie%20fan%2F%C3%A9/follow'
		);
		expect(mockJson).not.toHaveBeenCalled();
	});
});
