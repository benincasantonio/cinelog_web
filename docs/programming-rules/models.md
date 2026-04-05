# Model Conventions

## Value Types (String Enums)

Always define a `const` array as the single source of truth and derive the type from it.

```ts
export const FOO_VALUES = ['a', 'b', 'c'] as const;

export type Foo = (typeof FOO_VALUES)[number];
```

Do **not** write a separate union type — it duplicates the array and can drift out of sync.

## Request / Response Types

Use `export type` for data shapes. Reference domain value types where applicable.

```ts
export type CreateFooRequest = {
  name: string;
  kind: Foo;
};
```

## Barrel Exports

Each `models/` directory must have an `index.ts` that re-exports all models explicitly:

- Use `export type { X }` for type-only exports.
- Use named exports `export { X }` for runtime values (const arrays, objects).
- Do **not** use `export *` — keep exports explicit so unused values are not accidentally exposed.

```ts
export type { CreateFooRequest } from './create-foo-request';
export type { Foo } from './foo';
export { FOO_VALUES } from './foo';
```
