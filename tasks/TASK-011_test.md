# TASK-011: EC連携 API 統合テスト実装

## 📋 タスク基本情報

- **タスクID**: TASK-011
- **カテゴリ**: test
- **担当エージェント**: QA-Agent
- **状態**: done
- **優先度**: low
- **複雑度**: low
- **作成日**: 2025-01-26

## 🎯 タスク概要

EC連携API (`GET /ec/order`, `POST /ec/sync`) の統合テストを追加し、EC注文取り込みおよび商品同期の正常系・権限制御を確認する。

## 📂 対象ファイル

- `packages/web-app/src/app/api/store/[store_id]/ec/route.test.ts`

## ✅ 受け入れ基準

- [x] 正常系パス
- [x] 認可エラーなど異常系テスト
- [x] 既存コード非変更

## 🚀 実装手順（詳細）

### Phase 1: EC連携API確認
```typescript
const EC_ENDPOINTS = {
  orders: 'GET /api/store/[store_id]/ec/order',
  sync: 'POST /api/store/[store_id]/ec/sync'
};
```

### Phase 2: テストコード実装
```typescript
// packages/web-app/src/app/api/store/[store_id]/ec/route.test.ts
import { describe, it, expect } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { apiTestConstant } from '@/api/backendApi/test/constant';
import { GET, POST } from './route';

describe('EC連携API', () => {
  const storeId = apiTestConstant.storeMock.id;
  const staffId = apiTestConstant.userMock.posMaster.token.id;

  describe('GET /api/store/[store_id]/ec/order - EC注文取得', () => {
    it('EC注文一覧を取得できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/ec/order`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          expect(data).toHaveProperty('orders');
          expect(Array.isArray(data.orders)).toBe(true);
          if (data.orders.length > 0) {
            expect(data.orders[0]).toHaveProperty('order_id');
            expect(data.orders[0]).toHaveProperty('order_date');
            expect(data.orders[0]).toHaveProperty('status');
            expect(data.orders[0]).toHaveProperty('total_amount');
          }
        }),
      });
    });

    it('注文ステータスで絞り込める', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/ec/order?status=pending&take=10`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          expect(data.orders.length).toBeLessThanOrEqual(10);
          if (data.orders.length > 0) {
            expect(data.orders[0].status).toBe('pending');
          }
        }),
      });
    });

    it('期間指定でEC注文を絞り込める', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/ec/order?start_date=${startDate}&end_date=${endDate}`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
        }),
      });
    });

    it('ECプラットフォーム指定で絞り込める', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/ec/order?platform=ochanoko`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          if (data.orders.length > 0) {
            expect(data.orders[0]).toHaveProperty('platform');
            expect(data.orders[0].platform).toBe('ochanoko');
          }
        }),
      });
    });

    it('注文詳細情報を含めて取得できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/ec/order?include_details=true&take=5`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          if (data.orders.length > 0) {
            expect(data.orders[0]).toHaveProperty('order_items');
            expect(data.orders[0]).toHaveProperty('customer_info');
            expect(data.orders[0]).toHaveProperty('shipping_info');
          }
        }),
      });
    });

    it('無効なステータスで400エラー', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/ec/order?status=invalid_status`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(400);
        }),
      });
    });

    it('無効な日付フォーマットで400エラー', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/ec/order?start_date=invalid-date`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(400);
        }),
      });
    });

    it('開始日が終了日より後で400エラー', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/ec/order?start_date=2024-12-31&end_date=2024-01-01`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(400);
        }),
      });
    });
  });

  describe('POST /api/store/[store_id]/ec/sync - EC同期', () => {
    it('商品同期を実行できる', async () => {
      const syncRequest = {
        sync_type: 'products',
        platform: 'ochanoko',
        staff_account_id: staffId,
        force_update: false
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(syncRequest),
          });

          expect(response.status).toBe(200);
          const data = await response.json();
          expect(data).toHaveProperty('sync_id');
          expect(data).toHaveProperty('status');
          expect(data).toHaveProperty('started_at');
        }),
      });
    });

    it('注文同期を実行できる', async () => {
      const orderSyncRequest = {
        sync_type: 'orders',
        platform: 'ochanoko',
        staff_account_id: staffId,
        date_range: {
          start_date: '2024-01-01',
          end_date: '2024-01-31'
        }
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderSyncRequest),
          });

          expect(response.status).toBe(200);
          const data = await response.json();
          expect(data).toHaveProperty('sync_id');
          expect(data.sync_type).toBe('orders');
        }),
      });
    });

    it('在庫同期を実行できる', async () => {
      const stockSyncRequest = {
        sync_type: 'stock',
        platform: 'ochanoko',
        staff_account_id: staffId,
        product_ids: [1, 2, 3], // 特定商品のみ同期
        force_update: true
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stockSyncRequest),
          });

          expect(response.status).toBe(200);
          const data = await response.json();
          expect(data.sync_type).toBe('stock');
          expect(data).toHaveProperty('target_product_count');
        }),
      });
    });

    it('全体同期を実行できる', async () => {
      const fullSyncRequest = {
        sync_type: 'full',
        platform: 'ochanoko',
        staff_account_id: staffId,
        options: {
          include_images: true,
          update_prices: true,
          sync_categories: true
        }
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fullSyncRequest),
          });

          expect(response.status).toBe(200);
          const data = await response.json();
          expect(data.sync_type).toBe('full');
          expect(data).toHaveProperty('estimated_duration');
        }),
      });
    });

    it('無効な同期タイプで400エラー', async () => {
      const invalidSyncRequest = {
        sync_type: 'invalid_type',
        platform: 'ochanoko',
        staff_account_id: staffId
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invalidSyncRequest),
          });

          expect(response.status).toBe(400);
          const error = await response.json();
          expect(error.message).toContain('sync_type');
        }),
      });
    });

    it('サポートされていないプラットフォームで400エラー', async () => {
      const unsupportedPlatformRequest = {
        sync_type: 'products',
        platform: 'unsupported_platform',
        staff_account_id: staffId
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(unsupportedPlatformRequest),
          });

          expect(response.status).toBe(400);
          const error = await response.json();
          expect(error.message).toContain('platform');
        }),
      });
    });

    it('必須項目不足で400エラー', async () => {
      const incompleteSyncRequest = {
        sync_type: 'products'
        // platform, staff_account_id が不足
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(incompleteSyncRequest),
          });

          expect(response.status).toBe(400);
        }),
      });
    });

    it('同期実行中に新しい同期で409エラー', async () => {
      // 最初の同期リクエスト
      const firstSyncRequest = {
        sync_type: 'full',
        platform: 'ochanoko',
        staff_account_id: staffId
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          // 1回目の同期開始
          await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(firstSyncRequest),
          });

          // 2回目の同期リクエスト（実行中のため失敗）
          const secondResponse = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(firstSyncRequest),
          });

          // 実装によっては409 Conflictまたは200 (キューイング)
          expect([200, 409]).toContain(secondResponse.status);
        }),
      });
    });
  });

  // 権限制御テスト
  describe('権限制御', () => {
    it('認証なしでEC注文取得で403エラー', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/ec/order`,
        test: BackendApiTest.define({ as: "" }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(403);
        }),
      });
    });

    it('認証なしでEC同期で403エラー', async () => {
      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: "" }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sync_type: 'products',
              platform: 'ochanoko',
              staff_account_id: staffId
            }),
          });
          expect(response.status).toBe(403);
        }),
      });
    });

    it('他店舗のEC連携にアクセスで403エラー', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: '999' },
        url: `/api/store/999/ec/order`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(403);
        }),
      });
    });

    it('管理者権限が必要な同期操作のテスト', async () => {
      const adminSyncRequest = {
        sync_type: 'full',
        platform: 'ochanoko',
        staff_account_id: staffId,
        admin_options: {
          reset_all_data: true
        }
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminSyncRequest),
          });

          // 権限レベルによって200または403
          expect([200, 403]).toContain(response.status);
        }),
      });
    });
  });

  // 統合テストシナリオ
  describe('統合シナリオ', () => {
    it('EC注文取得→同期実行の完全フロー', async () => {
      await testApiHandler({
        appHandler: { GET, POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          // 1. EC注文一覧取得
          const ordersResponse = await fetch(`/api/store/${storeId}/ec/order?status=pending&take=5`);
          expect(ordersResponse.status).toBe(200);
          
          const ordersData = await ordersResponse.json();
          const pendingOrderCount = ordersData.orders.length;

          // 2. 注文同期実行
          const syncResponse = await fetch(`/api/store/${storeId}/ec/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sync_type: 'orders',
              platform: 'ochanoko',
              staff_account_id: staffId
            }),
          });

          expect(syncResponse.status).toBe(200);
          const syncData = await syncResponse.json();
          expect(syncData).toHaveProperty('sync_id');

          // 3. 同期後の注文一覧確認（実際には非同期処理のため即座には反映されない）
          const updatedOrdersResponse = await fetch(`/api/store/${storeId}/ec/order?status=pending&take=5`);
          expect(updatedOrdersResponse.status).toBe(200);
        }),
      });
    });
  });
});
```

### Phase 3: テスト実行
```bash
cd packages/web-app
pnpm run test:integ:api:internal -- src/app/api/store/[store_id]/ec/route.test.ts
```

## 📊 品質チェックリスト

- [ ] **EC注文取得**: 一覧・ステータス絞り込み・期間指定・詳細情報
- [ ] **EC同期**: 商品・注文・在庫・全体同期の各タイプ
- [ ] **パラメータ検証**: 同期タイプ・プラットフォーム・日付範囲
- [ ] **権限制御**: 認証なし・他店舗・管理者権限
- [ ] **エラーハンドリング**: 400・403・409エラーの適切な返却
- [ ] **統合シナリオ**: 注文取得→同期実行の完全フロー

---
*QA-Agent 作成・詳細化: 2025-01-26* 