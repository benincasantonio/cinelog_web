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

import { followUser, getProfile, unfollowUser } from './user-repository';

describe('user repository profile requests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockJson.mockResolvedValue(undefined);
		mockGet.mockReturnValue({ json: mockJson });
		mockPut.mockResolvedValue(new Response(null, { status: 204 }));
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

	it('unfollows a profile without parsing the empty response', async () => {
		await unfollowUser('movie fan/é');

		expect(mockDelete).toHaveBeenCalledWith(
			'v1/users/movie%20fan%2F%C3%A9/follow'
		);
		expect(mockJson).not.toHaveBeenCalled();
	});
});
