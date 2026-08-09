import { describe, expect, it } from 'vitest';
import { createLatestRequestGuard } from './latest-request-guard';

describe('createLatestRequestGuard', () => {
	it('treats the most recently started request as not stale', () => {
		const guard = createLatestRequestGuard();

		const requestId = guard.start();

		expect(guard.isStale(requestId)).toBe(false);
	});

	it('treats an earlier request as stale once a newer one starts', () => {
		const guard = createLatestRequestGuard();

		const firstRequestId = guard.start();
		const secondRequestId = guard.start();

		expect(guard.isStale(firstRequestId)).toBe(true);
		expect(guard.isStale(secondRequestId)).toBe(false);
	});

	it('marks the current request as stale after invalidate', () => {
		const guard = createLatestRequestGuard();

		const requestId = guard.start();
		guard.invalidate();

		expect(guard.isStale(requestId)).toBe(true);
	});
});
