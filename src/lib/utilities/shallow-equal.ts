export const shallowEqual = <T extends object>(objA: T, objB: T): boolean => {
	const objectAKeys = Object.keys(objA) as (keyof T)[];
	const objectBKeys = Object.keys(objB) as (keyof T)[];

	if (objectAKeys.length !== objectBKeys.length) {
		return false;
	}

	return objectAKeys.every(
		(key) => Object.hasOwn(objB, key) && objA[key] === objB[key]
	);
};
