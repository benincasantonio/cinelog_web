export default function (plop) {
  const projectRoot = process.cwd();

  plop.setGenerator("feature", {
    description: "Create a new feature",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the name of the feature?",
      },
      {
        type: "confirm",
        name: "hasStore",
        message: "Do you need a Store for this feature?",
        default: true,
      },
      {
        type: "confirm",
        name: "hasHooks",
        message: "Do you need any Hooks for this feature?",
        default: false,
      },
    ],
    actions: function (data) {
      const actions = [
        {
          type: "add",
          path: `${projectRoot}/src/features/{{kebabCase name}}/index.ts`,
          templateFile: `${projectRoot}/scripts/plop/templates/features/index.ts.hbs`,
          data: {
            hasStore: data.hasStore,
            hasHooks: data.hasHooks,
          },
        },
        {
          type: "add",
          path: `${projectRoot}/src/features/{{kebabCase name}}/components/index.ts`,
        },
        {
          type: "add",
          path: `${projectRoot}/src/features/{{kebabCase name}}/pages/index.ts`,
          templateFile: `${projectRoot}/scripts/plop/templates/features/pages/index.ts.hbs`,
        },
        {
          type: "add",
          path: `${projectRoot}/src/features/{{kebabCase name}}/pages/{{pascalCase name}}Page.tsx`,
          templateFile: `${projectRoot}/scripts/plop/templates/features/pages/page.hbs`,
        },
      ];

      if (data.hasStore) {
        actions.push(
          {
            type: "add",
            path: `${projectRoot}/src/features/{{kebabCase name}}/store/index.ts`,
            templateFile: `${projectRoot}/scripts/plop/templates/features/store/index.ts.hbs`,
          },
          {
            type: "add",
            path: `${projectRoot}/src/features/{{kebabCase name}}/store/use{{pascalCase name}}Store.ts`,
            templateFile: `${projectRoot}/scripts/plop/templates/features/store/useStore.ts.hbs`,
          }
        );
      }

      if (data.hasHooks) {
        actions.push({
          type: "add",
          path: `${projectRoot}/src/features/{{kebabCase name}}/hooks/index.ts`,
          templateFile: `${projectRoot}/scripts/plop/templates/features/hooks/index.ts.hbs`,
        });
      }

      return actions;
    },
  });
}
