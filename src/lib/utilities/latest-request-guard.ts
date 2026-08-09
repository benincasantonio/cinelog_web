export type LatestRequestGuard = {
	start: () => number;
	isStale: (requestId: number) => boolean;
	invalidate: () => void;
};

export const createLatestRequestGuard = (): LatestRequestGuard => {
	let latestRequestId = 0;

	return {
		start: () => ++latestRequestId,
		isStale: (requestId: number) => requestId !== latestRequestId,
		invalidate: () => {
			latestRequestId++;
		},
	};
};
