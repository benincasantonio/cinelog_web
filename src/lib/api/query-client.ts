import { MutationCache, QueryClient } from '@tanstack/react-query';

export const createQueryClient = () => {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
		mutationCache: new MutationCache({
			onSuccess: () => {
				void client.invalidateQueries();
			},
		}),
	});
	return client;
};
