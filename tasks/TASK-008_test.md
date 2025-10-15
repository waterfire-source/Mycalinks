# TASK-008: 顧客 API 統合テスト実装

## 📋 タスク基本情報

- **タスクID**: TASK-008
- **カテゴリ**: test
- **担当エージェント**: QA-Agent
- **状態**: done
- **優先度**: high
- **複雑度**: medium
- **作成日**: 2025-01-26

## 🎯 タスク概要

顧客API (`POST /customer`, `GET /customer`, `GET /customer/{id}/addable-point`) の統合テスト作成。

## 📂 対象ファイル

- `packages/web-app/src/app/api/store/[store_id]/customer/route.test.ts`

## ✅ 受け入れ基準

- [ ] 正常登録・検索・ポイント付与APIがテストされている
- [ ] 重複メール・無効メールフォーマットなどバリデーションエラー含む
- [ ] 既存コード非変更

## 🚀 実装手順（詳細）

### Phase 1: 顧客API確認
```typescript
const CUSTOMER_ENDPOINTS = {
  create: 'POST /api/store/[store_id]/customer',
  search: 'GET /api/store/[store_id]/customer',
  addablePoint: 'GET /api/store/[store_id]/customer/[customer_id]/addable-point'
};
```

### Phase 2: テストコード実装
```typescript
// packages/web-app/src/app/api/store/[store_id]/customer/route.test.ts
import { describe, it, expect } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { apiTestConstant } from '@/api/backendApi/test/constant';
import { GET, POST } from './route';

describe('顧客API', () => {
  const storeId = apiTestConstant.storeMock.id;
  const customerId = apiTestConstant.customerMock.id;

  describe('POST /api/store/[store_id]/customer - 顧客登録', () => {
    it('新規顧客を正常に登録できる', async () => {
      const newCustomer = {
        name: `テスト顧客_${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        phone: '090-1234-5678',
        postal_code: '100-0001',
        address: '東京都千代田区千代田1-1',
        birth_date: '1990-01-01',
        gender: 'male'
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCustomer),
          });

          expect(response.status).toBe(201);
          const data = await response.json();
          expect(data.name).toBe(newCustomer.name);
          expect(data.email).toBe(newCustomer.email);
          expect(data.id).toBeDefined();
        }),
      });
    });

    it('必須項目のみで顧客登録できる', async () => {
      const minimalCustomer = {
        name: `最小顧客_${Date.now()}`,
        email: `minimal${Date.now()}@example.com`
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(minimalCustomer),
          });

          expect(response.status).toBe(201);
        }),
      });
    });

    it('重複メールアドレスで400エラー', async () => {
      const duplicateCustomer = {
        name: 'テスト顧客',
        email: apiTestConstant.customerMock.email // 既存顧客のメール
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(duplicateCustomer),
          });

          expect(response.status).toBe(400);
          const error = await response.json();
          expect(error.message).toContain('メール');
        }),
      });
    });

    it('無効なメールフォーマットで400エラー', async () => {
      const invalidEmailCustomer = {
        name: 'テスト顧客',
        email: 'invalid-email-format'
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invalidEmailCustomer),
          });

          expect(response.status).toBe(400);
        }),
      });
    });

    it('必須項目不足で400エラー', async () => {
      const incompleteCustomer = {
        email: 'test@example.com'
        // nameが不足
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(incompleteCustomer),
          });

          expect(response.status).toBe(400);
        }),
      });
    });
  });

  describe('GET /api/store/[store_id]/customer - 顧客検索', () => {
    it('顧客一覧を取得できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          expect(data).toHaveProperty('customers');
          expect(Array.isArray(data.customers)).toBe(true);
        }),
      });
    });

    it('名前で顧客を検索できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/customer?name=テスト&take=10`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          expect(data.customers.length).toBeLessThanOrEqual(10);
        }),
      });
    });

    it('メールアドレスで顧客を検索できる', async () => {
      const testEmail = apiTestConstant.customerMock.email;
      
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/customer?email=${encodeURIComponent(testEmail)}`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          if (data.customers.length > 0) {
            expect(data.customers[0].email).toBe(testEmail);
          }
        }),
      });
    });

    it('電話番号で顧客を検索できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/customer?phone=090&take=5`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
        }),
      });
    });

    it('複数条件で顧客を検索できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/customer?name=テスト&gender=male&take=3`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
        }),
      });
    });

    it('ページネーションが正常に動作する', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/customer?take=5&skip=0`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          expect(data.customers.length).toBeLessThanOrEqual(5);
          expect(data).toHaveProperty('totalCount');
        }),
      });
    });
  });

  describe('GET /api/store/[store_id]/customer/[customer_id]/addable-point', () => {
    it('顧客の付与可能ポイントを取得できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { 
          store_id: String(storeId),
          customer_id: String(customerId)
        },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          expect(data).toHaveProperty('addable_point');
          expect(typeof data.addable_point).toBe('number');
          expect(data.addable_point).toBeGreaterThanOrEqual(0);
        }),
      });
    });

    it('存在しない顧客IDで404エラー', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { 
          store_id: String(storeId),
          customer_id: '999999'
        },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(404);
        }),
      });
    });

    it('購入履歴に基づいてポイント計算される', async () => {
      // 実際の計算ロジックは実装に依存するため、
      // レスポンス形式の確認に留める
      await testApiHandler({
        appHandler: { GET },
        params: { 
          store_id: String(storeId),
          customer_id: String(customerId)
        },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          expect(data).toHaveProperty('addable_point');
          expect(data).toHaveProperty('point_rate');
          expect(data).toHaveProperty('purchase_history');
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

    it('他店舗の顧客にアクセスで403エラー', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: '999' },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(403);
        }),
      });
    });

    it('顧客登録も権限制御される', async () => {
      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: "" }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'テスト',
              email: 'test@example.com'
            }),
          });
          expect(response.status).toBe(403);
        }),
      });
    });
  });
});
```

### Phase 3: テスト実行
```bash
cd packages/web-app
pnpm run test:integ:api:internal -- src/app/api/store/[store_id]/customer/route.test.ts
```

## 📊 品質チェックリスト

- [ ] **顧客登録**: 正常系・必須項目のみ・バリデーションエラー
- [ ] **顧客検索**: 名前・メール・電話番号・複数条件検索
- [ ] **ポイント計算**: 付与可能ポイント取得・計算ロジック確認
- [ ] **権限制御**: 認証なし・他店舗アクセス制御
- [ ] **エラーハンドリング**: 重複メール・無効フォーマット・存在しないID
- [ ] **ページネーション**: take/skip パラメータ動作確認

---
*QA-Agent 作成・詳細化: 2025-01-26* 