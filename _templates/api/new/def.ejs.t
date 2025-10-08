---
inject: true
to: packages/api-generator/src/defs/<%= domain %>/def.ts
append: true
---

export const <%= operationName %>Api = {
  summary: '<%= summary %>',
  description: '<%= summary %>',
  method: ApiMethod.<%= method %>,
  path: '<%= path %>',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    <% if (method === 'GET') { %>
    query: z.object({
      myca_genre_id: z
        .number()
        .optional()
        .describe('Mycaのジャンルから追加する場合、そのIDを指定する'),
      display_name: Item_GenreSchema.shape.display_name.optional(),
    }),
    <% } else if (method === 'POST' || method === 'PUT') { %>
    body: z.object({
      myca_genre_id: z
        .number()
        .optional()
        .describe('Mycaのジャンルから追加する場合、そのIDを指定する'),
      display_name: Item_GenreSchema.shape.display_name.optional(),
    }),
    <% } %>
  },
  process: `

  `,
  response: Item_GenreSchema,
  error: {
  } as const,
} satisfies BackendApiDef;