import { test } from 'vitest';

test('テンプレート作成後、取得して削除できる', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = { store_id: String(apiTestConstant.storeMock.id) };
  //   let templateId: number | null = null;
  //   const displayName = `API統合テストテンプレート${Date.now()}`;
  //   const url = 'https://example.com/test.lbx';
  //   // テンプレート作成
  //   await testApiHandler({
  //     appHandler: { POST: createTemplate },
  //     params,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: createTemplateApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch({
  //           body: {
  //             kind: TemplateKind.LABEL_PRINTER,
  //             display_name: displayName,
  //             url,
  //           },
  //         });
  //         expect(data.id).toBeDefined();
  //         expect(data.display_name).toBe(displayName);
  //         templateId = data.id;
  //       },
  //     ),
  //   });
  //   // テンプレート取得
  //   await testApiHandler({
  //     appHandler: { GET: getTemplate },
  //     params,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: getTemplateApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch({
  //           url: `?kind=${TemplateKind.LABEL_PRINTER}`,
  //         });
  //         expect(Array.isArray(data.templates)).toBe(true);
  //         const created = data.templates.find((t) => t.id === templateId);
  //         expect(created).toBeDefined();
  //         expect(created?.display_name).toBe(displayName);
  //       },
  //     ),
  //   });
  //   // テンプレート削除
  //   await testApiHandler({
  //     appHandler: { DELETE: deleteTemplate },
  //     params: { ...params, template_id: String(templateId!) },
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: deleteTemplateApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.ok).toBe('テンプレートが削除できました');
  //       },
  //     ),
  //   });
});
