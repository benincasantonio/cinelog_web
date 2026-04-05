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

Each `models/` directory must have an `index.ts` that re-exports everything:

- Use `export type { X }` for type-only exports.
- Use `export *` for files that also export runtime values (const arrays, objects).

```ts
export type { CreateFooRequest } from './create-foo-request';
export * from './foo';
```
