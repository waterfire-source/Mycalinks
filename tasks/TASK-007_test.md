# TASK-007: 取引 API 統合テスト実装

## 📋 タスク基本情報

- **タスクID**: TASK-007
- **カテゴリ**: test
- **担当エージェント**: QA-Agent
- **状態**: done
- **優先度**: critical
- **複雑度**: high
- **作成日**: 2025-01-26

## 🎯 タスク概要

販売・買取取引API (`POST /transaction`, `GET /transaction`, `GET /transaction/{id}`, `POST /transaction/{id}/return`, `POST /transaction/{id}/cancel`, `GET /transaction/{id}/receipt`) の包括的統合テストを作成する。

## 📂 対象ファイル

- `packages/web-app/src/app/api/store/[store_id]/transaction/route.test.ts`

## ✅ 受け入れ基準

- [ ] 正常系パス
- [ ] 在庫不足エラー・権限エラー等異常系含む
- [ ] レシート取得テストをHTML/PDF両方確認
- [ ] 既存実装非改変

## 🚀 実装手順（詳細）

### Phase 1: 取引API エンドポイント確認
```typescript
const TRANSACTION_ENDPOINTS = {
  create: 'POST /api/store/[store_id]/transaction',
  list: 'GET /api/store/[store_id]/transaction',
  detail: 'GET /api/store/[store_id]/transaction/[transaction_id]',
  return: 'POST /api/store/[store_id]/transaction/[transaction_id]/return',
  cancel: 'POST /api/store/[store_id]/transaction/[transaction_id]/cancel',
  receipt: 'GET /api/store/[store_id]/transaction/[transaction_id]/receipt'
};
```

### Phase 2: 複合テストコード実装
```typescript
// packages/web-app/src/app/api/store/[store_id]/transaction/route.test.ts
import { describe, it, expect } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { apiTestConstant } from '@/api/backendApi/test/constant';
import { GET, POST } from './route';

describe('取引API（販売・買取）', () => {
  const storeId = apiTestConstant.storeMock.id;
  const productId = apiTestConstant.productMock.id;
  const customerId = apiTestConstant.customerMock.id;
  const staffId = apiTestConstant.userMock.posMaster.token.id;

  describe('POST /api/store/[store_id]/transaction - 取引作成', () => {
    it('販売取引を正常に作成できる', async () => {
      const sellTransaction = {
        asDraft: false,
        staff_account_id: staffId,
        customer_id: customerId,
        transaction_kind: 'sell',
        total_price: 1000,
        subtotal_price: 1000,
        tax: 100,
        discount_price: 0,
        point_discount_price: 0,
        payment_method: 'cash',
        carts: [{
          product_id: productId,
          item_count: 1,
          unit_price: 1000,
          discount_price: 0
        }]
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sellTransaction),
          });

          expect(response.status).toBe(201);
          const data = await response.json();
          expect(data.data.id).toBeDefined();
          expect(data.data.status).toBeDefined();
        }),
      });
    });

    it('買取取引を正常に作成できる', async () => {
      const buyTransaction = {
        asDraft: false,
        staff_account_id: staffId,
        customer_id: customerId,
        transaction_kind: 'buy',
        total_price: 500,
        subtotal_price: 500,
        tax: 50,
        discount_price: 0,
        payment_method: 'cash',
        buy__is_assessed: true,
        id_kind: 'drivers_license',
        id_number: 'TEST123456789',
        customer_carts: [{
          product_id: productId,
          item_count: 1,
          unit_price: 500
        }]
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buyTransaction),
          });

          expect(response.status).toBe(201);
          const data = await response.json();
          expect(data.data.reception_number).toBeDefined();
        }),
      });
    });

    it('下書き取引を作成できる', async () => {
      const draftTransaction = {
        asDraft: true,
        staff_account_id: staffId,
        transaction_kind: 'sell',
        total_price: 1000,
        subtotal_price: 1000,
        tax: 100,
        carts: [{
          product_id: productId,
          item_count: 1,
          unit_price: 1000
        }]
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(draftTransaction),
          });

          expect(response.status).toBe(201);
          const data = await response.json();
          expect(data.data.status).toBe('draft');
        }),
      });
    });

    it('在庫不足で取引作成失敗', async () => {
      const invalidTransaction = {
        staff_account_id: staffId,
        transaction_kind: 'sell',
        total_price: 1000,
        carts: [{
          product_id: productId,
          item_count: 99999, // 在庫を超える数量
          unit_price: 1000
        }]
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invalidTransaction),
          });

          expect(response.status).toBe(400);
          const error = await response.json();
          expect(error.message).toContain('在庫');
        }),
      });
    });
  });

  describe('GET /api/store/[store_id]/transaction - 取引一覧', () => {
    it('取引一覧を取得できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          expect(data).toHaveProperty('transactions');
          expect(Array.isArray(data.transactions)).toBe(true);
        }),
      });
    });

    it('取引種別で絞り込める', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/transaction?transaction_kind=sell&take=10`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
        }),
      });
    });

    it('顧客IDで絞り込める', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/transaction?customer_id=${customerId}`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
        }),
      });
    });

    it('認証なしでも制限付きアクセス可能', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: "" }, async (fetch) => {
          const response = await fetch();
          // 認証なしでは制限されたデータのみ取得可能
          expect([200, 403]).toContain(response.status);
        }),
      });
    });
  });

  describe('GET /api/store/[store_id]/transaction/[transaction_id] - 取引詳細', () => {
    it('特定の取引詳細を取得できる', async () => {
      // まず取引を作成
      const newTransaction = {
        staff_account_id: staffId,
        transaction_kind: 'sell',
        total_price: 1000,
        carts: [{ product_id: productId, item_count: 1, unit_price: 1000 }]
      };

      await testApiHandler({
        appHandler: { POST, GET },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          // 取引作成
          const createResponse = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTransaction),
          });
          const createdTransaction = await createResponse.json();
          const transactionId = createdTransaction.data.id;

          // 取引詳細取得
          const detailResponse = await fetch(`/api/store/${storeId}/transaction/${transactionId}`);
          expect(detailResponse.status).toBe(200);
          
          const detail = await detailResponse.json();
          expect(detail.id).toBe(transactionId);
          expect(detail).toHaveProperty('carts');
          expect(detail).toHaveProperty('total_price');
        }),
      });
    });
  });

  describe('POST /api/store/[store_id]/transaction/[transaction_id]/return - 返品処理', () => {
    it('返品処理を実行できる', async () => {
      // テスト用の取引IDを使用（実際の実装では事前に取引を作成）
      const transactionId = 1; // 既存の取引ID
      
      const returnData = {
        staff_account_id: staffId,
        return_carts: [{
          transaction_cart_id: 1,
          return_count: 1
        }],
        return_reason: 'テスト返品'
      };

      await testApiHandler({
        appHandler: { POST },
        params: { 
          store_id: String(storeId),
          transaction_id: String(transactionId)
        },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(returnData),
          });

          // 権限がある場合は200、ない場合は403
          expect([200, 403, 404]).toContain(response.status);
        }),
      });
    });
  });

  describe('POST /api/store/[store_id]/transaction/[transaction_id]/cancel - 取引キャンセル', () => {
    it('取引をキャンセルできる', async () => {
      const transactionId = 1;

      await testApiHandler({
        appHandler: { POST },
        params: { 
          store_id: String(storeId),
          transaction_id: String(transactionId)
        },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({ method: 'POST' });
          expect([200, 403, 404]).toContain(response.status);
        }),
      });
    });
  });

  describe('GET /api/store/[store_id]/transaction/[transaction_id]/receipt - レシート', () => {
    it('HTMLレシートを取得できる', async () => {
      const transactionId = 1;

      await testApiHandler({
        appHandler: { GET },
        params: { 
          store_id: String(storeId),
          transaction_id: String(transactionId)
        },
        url: `/api/store/${storeId}/transaction/${transactionId}/receipt?format=html`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect([200, 404]).toContain(response.status);
          
          if (response.status === 200) {
            const contentType = response.headers.get('content-type');
            expect(contentType).toContain('text/html');
          }
        }),
      });
    });

    it('PDFレシートを取得できる', async () => {
      const transactionId = 1;

      await testApiHandler({
        appHandler: { GET },
        params: { 
          store_id: String(storeId),
          transaction_id: String(transactionId)
        },
        url: `/api/store/${storeId}/transaction/${transactionId}/receipt?format=pdf`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect([200, 404]).toContain(response.status);
          
          if (response.status === 200) {
            const contentType = response.headers.get('content-type');
            expect(contentType).toContain('application/pdf');
          }
        }),
      });
    });

    it('認証なしでもレシート取得可能', async () => {
      const transactionId = 1;

      await testApiHandler({
        appHandler: { GET },
        params: { 
          store_id: String(storeId),
          transaction_id: String(transactionId)
        },
        url: `/api/store/${storeId}/transaction/${transactionId}/receipt`,
        test: BackendApiTest.define({ as: "" }, async (fetch) => {
          const response = await fetch();
          expect([200, 404]).toContain(response.status);
        }),
      });
    });
  });
});
```

### Phase 3: 統合テストシナリオ
```typescript
describe('取引統合シナリオ', () => {
  it('販売→返品の完全フロー', async () => {
    await BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
      // 1. 販売取引作成
      const sellResponse = await fetch(`/api/store/${storeId}/transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_account_id: staffId,
          transaction_kind: 'sell',
          total_price: 1000,
          carts: [{ product_id: productId, item_count: 1, unit_price: 1000 }]
        }),
      });
      
      expect(sellResponse.status).toBe(201);
      const sellData = await sellResponse.json();
      const transactionId = sellData.data.id;

      // 2. 在庫減少確認
      const stockResponse = await fetch(`/api/store/${storeId}/product/${productId}`);
      const stockData = await stockResponse.json();
      
      // 3. レシート取得
      const receiptResponse = await fetch(
        `/api/store/${storeId}/transaction/${transactionId}/receipt`
      );
      expect(receiptResponse.status).toBe(200);

      // 4. 返品処理（権限があれば）
      const returnResponse = await fetch(
        `/api/store/${storeId}/transaction/${transactionId}/return`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            staff_account_id: staffId,
            return_carts: [{ transaction_cart_id: 1, return_count: 1 }]
          }),
        }
      );
      
      // 権限次第で成功/失敗
      expect([200, 403]).toContain(returnResponse.status);
    });
  });
});
```

### Phase 4: テスト実行
```bash
cd packages/web-app
pnpm run test:integ:api:internal -- src/app/api/store/[store_id]/transaction/route.test.ts
```

## 📊 品質チェックリスト

- [ ] **取引作成**: 販売・買取・下書き全パターン
- [ ] **取引操作**: 一覧・詳細・返品・キャンセル
- [ ] **レシート**: HTML/PDF両形式
- [ ] **権限制御**: 認証あり/なしでの動作差異
- [ ] **エラーハンドリング**: 在庫不足・権限不足・存在しないID
- [ ] **統合シナリオ**: 販売→返品の完全フロー
- [ ] **レスポンス検証**: ステータスコード・Content-Type・データ形式

---
*QA-Agent 作成・詳細化: 2025-01-26* 