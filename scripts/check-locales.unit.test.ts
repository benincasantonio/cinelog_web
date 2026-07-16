import { describe, expect, it } from 'vitest';
import { validateLocaleAlignment } from './check-locales';

describe('validateLocaleAlignment', () => {
	const reference = {
		Section: {
			first: 'First',
			second: 'Second',
		},
	};

	it('returns no issues for aligned locale data', () => {
		expect(validateLocaleAlignment(reference, reference)).toEqual([]);
	});

	it('reports missing, unexpected, and empty locale values', () => {
		const candidate = {
			Section: {
				first: '   ',
				extra: 'Extra',
			},
		};

		expect(validateLocaleAlignment(reference, candidate)).toEqual([
			'Missing key: Section.second',
			'Unexpected key: Section.extra',
			'Empty value: Section.first',
		]);
	});

	it('reports keys that are out of canonical order', () => {
		const candidate = {
			Section: {
				second: 'Second',
				first: 'First',
			},
		};

		expect(validateLocaleAlignment(reference, candidate)).toEqual([
			'Key order mismatch at Section: expected [first, second], received [second, first]',
		]);
	});

	it('reports values whose structure does not match the reference', () => {
		const candidate = {
			Section: 'Not an object',
		};

		expect(validateLocaleAlignment(reference, candidate)).toEqual([
			'Type mismatch: Section must be an object',
		]);
	});
});
