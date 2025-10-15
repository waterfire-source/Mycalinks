// codegen.ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: [
    {
      'https://mycaPosTestStore.myshopify.com/admin/api/2025-07/graphql.json': {
        headers: {
          'X-Shopify-Access-Token': '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',
        },
      },
    },
  ],
  documents: ['./src/services/internal/shopify/gql/defs/*.gql'], // .graphqlファイルを置く
  generates: {
    'src/services/internal/shopify/gql/sdk.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-graphql-request',
      ],
      config: {
        rawRequest: false,
        skipTypename: true,
        skipDocumentsValidation: true,
      },
    },
  },
  ignoreNoDocuments: true,
};
export default config;
