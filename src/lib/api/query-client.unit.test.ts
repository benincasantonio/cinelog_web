import { MutationObserver, QueryObserver } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createQueryClient } from './query-client';

describe('createQueryClient', () => {
	afterEach(() => vi.restoreAllMocks());

	it('leaves retries to the HTTP client', async () => {
		const client = createQueryClient();
		const queryFn = vi.fn().mockRejectedValue(new Error('Unavailable'));
		const observer = new QueryObserver(client, {
			queryKey: ['failure'],
			queryFn,
			retryDelay: 0,
		});
		const unsubscribe = observer.subscribe(() => undefined);
		try {
			await waitFor(() =>
				expect(observer.getCurrentResult().isError).toBe(true)
			);
			expect(queryFn).toHaveBeenCalledOnce();
		} finally {
			unsubscribe();
			client.clear();
		}
	});

	it('keeps cached data fresh when a mutation fails', async () => {
		const client = createQueryClient();
		client.setQueryData(['unchanged'], 'before');
		const mutation = new MutationObserver(client, {
			mutationFn: async () => {
				throw new Error('Save failed');
			},
		});
		try {
			await expect(mutation.mutate()).rejects.toThrow('Save failed');
			expect(client.getQueryState(['unchanged'])).toMatchObject({
				data: 'before',
				isInvalidated: false,
			});
		} finally {
			client.clear();
		}
	});

	it('refreshes active queries and invalidates inactive ones without delaying mutation callbacks', async () => {
		const client = createQueryClient();
		client.setQueryData(['active'], 'before');
		client.setQueryData(['inactive'], 'before');
		let finishRefresh!: (value: string) => void;
		const observer = new QueryObserver(client, {
			queryKey: ['active'],
			staleTime: Infinity,
			queryFn: () =>
				new Promise<string>((resolve) => {
					finishRefresh = resolve;
				}),
		});
		const unsubscribe = observer.subscribe(() => undefined);
		const onSuccess = vi.fn();
		const mutation = new MutationObserver(client, {
			mutationFn: async () => 'saved',
			onSuccess,
		});

		try {
			await expect(mutation.mutate()).resolves.toBe('saved');
			expect(onSuccess).toHaveBeenCalledOnce();
			expect(observer.getCurrentResult().isFetching).toBe(true);
			expect(client.getQueryData(['active'])).toBe('before');
			expect(client.getQueryState(['inactive'])).toMatchObject({
				isInvalidated: true,
				fetchStatus: 'idle',
				data: 'before',
			});
			finishRefresh('after');
			await waitFor(() =>
				expect(observer.getCurrentResult().data).toBe('after')
			);
		} finally {
			unsubscribe();
			client.clear();
		}
	});
});
