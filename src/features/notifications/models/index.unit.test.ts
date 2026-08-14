import { describe, expect, it } from 'vitest';
import { NOTIFICATION_ACTION_VALUES, NOTIFICATION_TYPE_VALUES } from './index';

describe('notification model barrel', () => {
	it('re-exports the runtime enum arrays', () => {
		expect(NOTIFICATION_TYPE_VALUES).toBeDefined();
		expect(NOTIFICATION_ACTION_VALUES).toBeDefined();
	});
});
