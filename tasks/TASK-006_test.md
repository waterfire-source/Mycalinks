# TASK-006: 在庫商品 API 統合テスト実装

## 📋 タスク基本情報

- **タスクID**: TASK-006
- **カテゴリ**: test
- **担当エージェント**: QA-Agent
- **状態**: done
- **優先度**: high
- **複雑度**: medium
- **作成日**: 2025-01-26

## 🎯 タスク概要

在庫商品関連API (`GET /product`, `PUT /product/{id}`, `GET /product/{id}/history`, `POST /product/{id}/transfer` 等) の統合テストを追加し、正常系・エラー系双方を網羅する。

## 📂 対象ファイル

- `packages/web-app/src/app/api/store/[store_id]/product/route.test.ts`

## ✅ 受け入れ基準

- [ ] テストが追加され、全テスト緑
- [ ] 権限エラー・バリデーションエラーも含む
- [ ] 既存コードは変更しない

## 🚀 実装手順（詳細）

### Phase 1: テスト対象API確認
```typescript
// 在庫商品API エンドポイント
const PRODUCT_ENDPOINTS = {
  list: 'GET /api/store/[store_id]/product',
  update: 'PUT /api/store/[store_id]/product/[product_id]',
  history: 'GET /api/store/[store_id]/product/[product_id]/history',
  transfer: 'POST /api/store/[store_id]/product/[product_id]/transfer'
};
```

### Phase 2: テストコード実装
```typescript
// packages/web-app/src/app/api/store/[store_id]/product/route.test.ts
import { describe, it, expect } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { apiTestConstant } from '@/api/backendApi/test/constant';
import { GET, PUT, POST } from './route';

describe('在庫商品API', () => {
  const storeId = apiTestConstant.storeMock.id;     // 3
  const productId = apiTestConstant.productMock.id; // 561417

  describe('GET /api/store/[store_id]/product', () => {
    it('在庫商品一覧を取得できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          expect(data).toHaveProperty('products');
          expect(Array.isArray(data.products)).toBe(true);
        }),
      });
    });

    it('検索条件で在庫商品を絞り込める', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/product?display_name=テスト&stock_min=1&take=20`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          expect(data.products.length).toBeLessThanOrEqual(20);
        }),
      });
    });

    it('集計情報付きで取得できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/product?includesSummary=true`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          expect(data).toHaveProperty('summary');
          expect(data.summary).toHaveProperty('totalCount');
          expect(data.summary).toHaveProperty('totalValue');
        }),
      });
    });
  });

  describe('PUT /api/store/[store_id]/product/[product_id]', () => {
    it('在庫商品情報を更新できる', async () => {
      const updateData = {
        display_name: `更新在庫商品_${Date.now()}`,
        sale_unit_price: 1500,
        stock_count: 10,
        description: '更新テスト'
      };

      await testApiHandler({
        appHandler: { PUT },
        params: { 
          store_id: String(storeId),
          product_id: String(productId)
        },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
          });

          expect(response.status).toBe(200);
          const data = await response.json();
          expect(data.display_name).toBe(updateData.display_name);
          expect(data.sale_unit_price).toBe(updateData.sale_unit_price);
        }),
      });
    });

    it('無限在庫フラグを設定できる', async () => {
      await testApiHandler({
        appHandler: { PUT },
        params: { 
          store_id: String(storeId),
          product_id: String(productId)
        },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_infinite_stock: true }),
          });

          expect(response.status).toBe(200);
          const data = await response.json();
          expect(data.is_infinite_stock).toBe(true);
        }),
      });
    });

    it('存在しないproduct_idで404エラー', async () => {
      await testApiHandler({
        appHandler: { PUT },
        params: { 
          store_id: String(storeId),
          product_id: '999999'
        },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ display_name: 'テスト' }),
          });

          expect(response.status).toBe(404);
        }),
      });
    });

    it('負の在庫数で400エラー', async () => {
      await testApiHandler({
        appHandler: { PUT },
        params: { 
          store_id: String(storeId),
          product_id: String(productId)
        },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock_count: -1 }),
          });

          expect(response.status).toBe(400);
        }),
      });
    });
  });

  describe('GET /api/store/[store_id]/product/[product_id]/history', () => {
    it('在庫変動履歴を取得できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { 
          store_id: String(storeId),
          product_id: String(productId)
        },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          expect(Array.isArray(data)).toBe(true);
          if (data.length > 0) {
            expect(data[0]).toHaveProperty('created_at');
            expect(data[0]).toHaveProperty('change_type');
            expect(data[0]).toHaveProperty('quantity_change');
          }
        }),
      });
    });
  });

  describe('POST /api/store/[store_id]/product/[product_id]/transfer', () => {
    it('商品転送を実行できる', async () => {
      const transferData = {
        to_store_id: 4, // 転送先店舗ID
        quantity: 1,
        reason: 'テスト転送'
      };

      await testApiHandler({
        appHandler: { POST },
        params: { 
          store_id: String(storeId),
          product_id: String(productId)
        },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transferData),
          });

          expect(response.status).toBe(200);
          const data = await response.json();
          expect(data).toHaveProperty('transfer_id');
        }),
      });
    });

    it('在庫不足で転送失敗', async () => {
      await testApiHandler({
        appHandler: { POST },
        params: { 
          store_id: String(storeId),
          product_id: String(productId)
        },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to_store_id: 4,
              quantity: 99999, // 在庫を超える数量
              reason: 'テスト'
            }),
          });

          expect(response.status).toBe(400);
          const error = await response.json();
          expect(error.message).toContain('在庫が不足');
        }),
      });
    });
  });

  // 権限制御テスト
  describe('権限制御', () => {
    it('認証なしで403エラー', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: "" }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(403);
        }),
      });
    });

    it('他店舗の商品にアクセスで403エラー', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: '999' }, // 権限のない店舗ID
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(403);
        }),
      });
    });
  });
});
```

### Phase 3: テスト実行
```bash
# 個別テスト実行
cd packages/web-app
pnpm run test:integ:api:internal -- src/app/api/store/[store_id]/product/route.test.ts

# ウォッチモード
pnpm run test:integ:api:internal -- --watch src/app/api/store/[store_id]/product/route.test.ts
```

## 📊 品質チェックリスト

- [ ] **CRUD操作**: 一覧取得・更新・履歴・転送全てテスト
- [ ] **検索機能**: 商品名・価格帯・在庫数での絞り込み
- [ ] **バリデーション**: 負の値・必須項目・型制約
- [ ] **権限制御**: 認証なし・他店舗アクセス制御
- [ ] **エラーハンドリング**: 404・400・403エラー
- [ ] **レスポンス形式**: 集計情報・ページネーション

---
*QA-Agent 作成・詳細化: 2025-01-26* 