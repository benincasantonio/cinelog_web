import { describe, expect, expectTypeOf, it } from 'vitest';
import {
	PROFILE_VISIBILITY_VALUES,
	type ProfileVisibility,
} from './profile-visibility';

describe('profile visibility', () => {
	it('exposes the supported wire values in display order', () => {
		expect(PROFILE_VISIBILITY_VALUES).toEqual([
			'public',
			'followers_only',
			'private',
		]);
	});

	it('derives the profile visibility type from the supported values', () => {
		expectTypeOf<ProfileVisibility>().toEqualTypeOf<
			'public' | 'followers_only' | 'private'
		>();
	});
});
