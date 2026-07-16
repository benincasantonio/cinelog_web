import en from '../src/lib/locales/en.json';
import fr from '../src/lib/locales/fr.json';
import it from '../src/lib/locales/it.json';

type LocaleObject = Record<string, unknown>;

const isLocaleObject = (value: unknown): value is LocaleObject =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const hasOwn = (object: LocaleObject, key: string) =>
	Object.hasOwn(object, key);

const joinPath = (parent: string, key: string) =>
	parent.length > 0 ? `${parent}.${key}` : key;

export const validateLocaleAlignment = (
	reference: LocaleObject,
	candidate: LocaleObject
): string[] => {
	const issues: string[] = [];

	const compareObjects = (
		referenceObject: LocaleObject,
		candidateObject: LocaleObject,
		path = ''
	) => {
		const referenceKeys = Object.keys(referenceObject);
		const candidateKeys = Object.keys(candidateObject);

		for (const key of referenceKeys) {
			if (!hasOwn(candidateObject, key)) {
				issues.push(`Missing key: ${joinPath(path, key)}`);
			}
		}

		for (const key of candidateKeys) {
			if (!hasOwn(referenceObject, key)) {
				issues.push(`Unexpected key: ${joinPath(path, key)}`);
			}
		}

		const sharedReferenceKeys = referenceKeys.filter((key) =>
			hasOwn(candidateObject, key)
		);
		const sharedCandidateKeys = candidateKeys.filter((key) =>
			hasOwn(referenceObject, key)
		);

		if (
			sharedReferenceKeys.some(
				(key, index) => key !== sharedCandidateKeys[index]
			)
		) {
			issues.push(
				`Key order mismatch at ${path || '<root>'}: expected [${sharedReferenceKeys.join(', ')}], received [${sharedCandidateKeys.join(', ')}]`
			);
		}

		for (const key of sharedReferenceKeys) {
			const keyPath = joinPath(path, key);
			const referenceValue = referenceObject[key];
			const candidateValue = candidateObject[key];

			if (isLocaleObject(referenceValue)) {
				if (!isLocaleObject(candidateValue)) {
					issues.push(`Type mismatch: ${keyPath} must be an object`);
					continue;
				}

				compareObjects(referenceValue, candidateValue, keyPath);
				continue;
			}

			if (typeof candidateValue !== typeof referenceValue) {
				issues.push(
					`Type mismatch: ${keyPath} must be a ${typeof referenceValue}`
				);
				continue;
			}

			if (typeof candidateValue === 'string' && candidateValue.trim() === '') {
				issues.push(`Empty value: ${keyPath}`);
			}
		}
	};

	compareObjects(reference, candidate);
	return issues;
};

const locales = { en, fr, it } as const;

export const checkLocales = () => {
	let hasIssues = false;

	for (const [language, locale] of Object.entries(locales)) {
		const issues = validateLocaleAlignment(en, locale);

		if (issues.length === 0) {
			continue;
		}

		hasIssues = true;
		process.stderr.write(
			`Locale ${language}:\n${issues.map((issue) => `- ${issue}`).join('\n')}\n`
		);
	}

	if (hasIssues) {
		process.exitCode = 1;
		return;
	}

	process.stdout.write('Locale keys and values are aligned.\n');
};

if (process.argv[1]?.endsWith('/scripts/check-locales.ts')) {
	checkLocales();
}
