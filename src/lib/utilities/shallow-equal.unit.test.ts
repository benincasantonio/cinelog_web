import { describe, expect, it } from 'vitest';
import { shallowEqual } from './shallow-equal';

describe('shallowEqual', () => {
	describe('returns true', () => {
		it('for two empty objects', () => {
			expect(shallowEqual({}, {})).toBe(true);
		});

		it('for objects with same primitive values', () => {
			const objA = { a: 1, b: 'hello', c: true };
			const objB = { a: 1, b: 'hello', c: true };
			expect(shallowEqual(objA, objB)).toBe(true);
		});

		it('for objects with same reference values', () => {
			const sharedArray = [1, 2, 3];
			const sharedObject = { nested: true };
			const objA = { arr: sharedArray, obj: sharedObject };
			const objB = { arr: sharedArray, obj: sharedObject };
			expect(shallowEqual(objA, objB)).toBe(true);
		});

		it('for objects with null and undefined values', () => {
			const objA = { a: null, b: undefined };
			const objB = { a: null, b: undefined };
			expect(shallowEqual(objA, objB)).toBe(true);
		});
	});

	describe('returns false', () => {
		it('for objects with different number of keys', () => {
			const objA = { a: 1, b: 2 };
			const objB = { a: 1 };
			expect(shallowEqual(objA, objB)).toBe(false);
		});

		it('for objects with same keys but different primitive values', () => {
			const objA = { a: 1, b: 2 };
			const objB = { a: 1, b: 3 };
			expect(shallowEqual(objA, objB)).toBe(false);
		});

		it('for objects with different nested array references', () => {
			const objA = { arr: [1, 2, 3] };
			const objB = { arr: [1, 2, 3] };
			expect(shallowEqual(objA, objB)).toBe(false);
		});

		it('for objects with different nested object references', () => {
			const objA = { nested: { value: 1 } };
			const objB = { nested: { value: 1 } };
			expect(shallowEqual(objA, objB)).toBe(false);
		});

		it('for objects with additional key in second object', () => {
			const objA = { a: 1 };
			const objB = { a: 1, b: 2 };
			expect(shallowEqual(objA, objB)).toBe(false);
		});

		it('for objects with same length but different keys', () => {
			const objA = { a: 1 } as Record<string, number>;
			const objB = { b: 1 } as Record<string, number>;
			expect(shallowEqual(objA, objB)).toBe(false);
		});
	});

	describe('edge cases', () => {
		it('handles objects with numeric keys', () => {
			const objA = { 1: 'a', 2: 'b' };
			const objB = { 1: 'a', 2: 'b' };
			expect(shallowEqual(objA, objB)).toBe(true);
		});

		it('handles objects with symbol-like string keys', () => {
			const objA = { 'Symbol(test)': 1 };
			const objB = { 'Symbol(test)': 1 };
			expect(shallowEqual(objA, objB)).toBe(true);
		});

		it('handles objects with function references', () => {
			const fn = () => undefined;
			const objA = { callback: fn };
			const objB = { callback: fn };
			expect(shallowEqual(objA, objB)).toBe(true);
		});

		it('returns false for objects with different function references', () => {
			const objA = { callback: () => undefined };
			const objB = { callback: () => undefined };
			expect(shallowEqual(objA, objB)).toBe(false);
		});
	});
});
