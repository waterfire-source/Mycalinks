# TASK-012: 仕入れ API 統合テスト実装

## 📋 タスク基本情報

- **タスクID**: TASK-012
- **カテゴリ**: test
- **担当エージェント**: QA-Agent
- **状態**: done
- **優先度**: medium
- **複雑度**: medium
- **作成日**: 2025-01-26
- **期限**: なし

## 🎯 タスク概要

仕入れ関連API (`POST /stocking`, `GET /stocking/supplier`, `POST /stocking/supplier`) の統合テストを実装し、商品仕入れ・仕入先管理の正常系・バリデーション・権限制御を網羅する。

## 📂 対象ファイル（競合防止）

- `packages/web-app/src/app/api/store/[store_id]/stocking/route.test.ts`

## ✅ 受け入れ基準

- [ ] 上記テストファイルを作成し、既存テスト同様 `testApiHandler` + `BackendApiTest` で実装されている
- [ ] `pnpm run test:integ:api:internal` が全緑で通る
- [ ] 既存ソースコードやAPI実装には一切変更を加えていない

## 🔄 依存関係

- **requires**: なし
- **blocks**: なし

## 🚀 実装手順（詳細）

### Phase 1: テストケース設計
```typescript
// テスト対象APIエンドポイント
const ENDPOINTS = {
  createStocking: 'POST /api/store/[store_id]/stocking',
  listSuppliers: 'GET /api/store/[store_id]/stocking/supplier',
  createSupplier: 'POST /api/store/[store_id]/stocking/supplier'
};

// テストカテゴリ
const TEST_CATEGORIES = {
  正常系: ['仕入れ登録', '仕入先一覧取得', '仕入先作成'],
  異常系: ['必須項目不足', '不正な値', '存在しない仕入先ID'],
  権限制御: ['認証なし403', 'POSユーザー200', '他店舗403']
};
```

### Phase 2: テストファイル作成
```bash
# 1. 既存テンプレートをコピー
cp packages/web-app/src/app/api/store/[store_id]/product/route.test.ts \
   packages/web-app/src/app/api/store/[store_id]/stocking/route.test.ts

# 2. APIルートファイルの確認
ls packages/web-app/src/app/api/store/[store_id]/stocking/route.ts
```

### Phase 3: テストコード実装
```typescript
// packages/web-app/src/app/api/store/[store_id]/stocking/route.test.ts
import { describe, it, expect } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { apiTestConstant } from '@/api/backendApi/test/constant';
import { GET, POST } from './route';

describe('仕入れAPI', () => {
  const storeId = apiTestConstant.storeMock.id; // 3
  const staffId = apiTestConstant.userMock.posMaster.token.id; // 4

  describe('POST /api/store/[store_id]/stocking - 仕入れ登録', () => {
    it('商品仕入れを正常に登録できる', async () => {
      const stockingData = {
        supplier_id: 1,
        staff_account_id: staffId,
        stocking_date: '2025-01-26',
        items: [{
          item_id: apiTestConstant.itemMock.id,
          quantity: 10,
          unit_cost: 800,
          total_cost: 8000
        }],
        total_amount: 8000,
        memo: 'テスト仕入れ'
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stockingData),
          });

          expect(response.status).toBe(201);
          const data = await response.json();
          expect(data.id).toBeDefined();
          expect(data.total_amount).toBe(stockingData.total_amount);
          expect(data.items.length).toBe(1);
        }),
      });
    });

    it('複数商品の仕入れを登録できる', async () => {
      const multiStockingData = {
        supplier_id: 1,
        staff_account_id: staffId,
        stocking_date: '2025-01-26',
        items: [
          {
            item_id: apiTestConstant.itemMock.id,
            quantity: 5,
            unit_cost: 800,
            total_cost: 4000
          },
          {
            item_id: apiTestConstant.itemMock.id + 1,
            quantity: 3,
            unit_cost: 1200,
            total_cost: 3600
          }
        ],
        total_amount: 7600,
        memo: '複数商品テスト仕入れ'
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(multiStockingData),
          });

          expect(response.status).toBe(201);
          const data = await response.json();
          expect(data.items.length).toBe(2);
          expect(data.total_amount).toBe(7600);
        }),
      });
    });

    it('必須フィールド不足で400エラー', async () => {
      const incompleteData = {
        staff_account_id: staffId,
        // supplier_id が不足
        items: [{
          item_id: apiTestConstant.itemMock.id,
          quantity: 1,
          unit_cost: 800
        }]
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(incompleteData),
          });

          expect(response.status).toBe(400);
          const error = await response.json();
          expect(error.message).toContain('supplier_id');
        }),
      });
    });

    it('負の数量で400エラー', async () => {
      const invalidData = {
        supplier_id: 1,
        staff_account_id: staffId,
        items: [{
          item_id: apiTestConstant.itemMock.id,
          quantity: -1, // 負の値
          unit_cost: 800
        }]
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invalidData),
          });

          expect(response.status).toBe(400);
        }),
      });
    });

    it('存在しないsupplier_idで400エラー', async () => {
      const invalidSupplierData = {
        supplier_id: 999999, // 存在しないID
        staff_account_id: staffId,
        items: [{
          item_id: apiTestConstant.itemMock.id,
          quantity: 1,
          unit_cost: 800
        }]
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invalidSupplierData),
          });

          expect(response.status).toBe(400);
        }),
      });
    });

    it('認証なしで403エラー', async () => {
      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: "" }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          });

          expect(response.status).toBe(403);
        }),
      });
    });
  });

  describe('GET /api/store/[store_id]/stocking/supplier - 仕入先一覧', () => {
    it('仕入先一覧を取得できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/stocking/supplier`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          expect(data).toHaveProperty('suppliers');
          expect(Array.isArray(data.suppliers)).toBe(true);
          if (data.suppliers.length > 0) {
            expect(data.suppliers[0]).toHaveProperty('id');
            expect(data.suppliers[0]).toHaveProperty('name');
            expect(data.suppliers[0]).toHaveProperty('contact_info');
          }
        }),
      });
    });

    it('検索条件で仕入先を絞り込める', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/stocking/supplier?name=テスト&take=10`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          expect(data.suppliers.length).toBeLessThanOrEqual(10);
        }),
      });
    });

    it('アクティブな仕入先のみ取得できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/stocking/supplier?active_only=true`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          if (data.suppliers.length > 0) {
            expect(data.suppliers[0].is_active).toBe(true);
          }
        }),
      });
    });
  });

  describe('POST /api/store/[store_id]/stocking/supplier - 仕入先作成', () => {
    it('新規仕入先を作成できる', async () => {
      const newSupplier = {
        name: `テスト仕入先_${Date.now()}`,
        contact_person: '担当者名',
        email: `supplier${Date.now()}@example.com`,
        phone: '03-1234-5678',
        address: '東京都渋谷区テスト1-2-3',
        payment_terms: '月末締め翌月末払い',
        memo: 'テスト用仕入先'
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/stocking/supplier`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSupplier),
          });

          expect(response.status).toBe(201);
          const data = await response.json();
          expect(data.name).toBe(newSupplier.name);
          expect(data.email).toBe(newSupplier.email);
          expect(data.id).toBeDefined();
        }),
      });
    });

    it('必須項目のみで仕入先を作成できる', async () => {
      const minimalSupplier = {
        name: `最小仕入先_${Date.now()}`
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/stocking/supplier`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(minimalSupplier),
          });

          expect(response.status).toBe(201);
        }),
      });
    });

    it('重複する仕入先名で400エラー', async () => {
      const duplicateSupplier = {
        name: '既存仕入先' // 既に存在する名前
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/stocking/supplier`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(duplicateSupplier),
          });

          expect(response.status).toBe(400);
        }),
      });
    });

    it('無効なメールフォーマットで400エラー', async () => {
      const invalidEmailSupplier = {
        name: 'テスト仕入先',
        email: 'invalid-email-format'
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/stocking/supplier`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invalidEmailSupplier),
          });

          expect(response.status).toBe(400);
        }),
      });
    });
  });

  describe('権限制御テスト', () => {
    it('他店舗の仕入先にアクセスで403エラー', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: '999' },
        url: `/api/store/999/stocking/supplier`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(403);
        }),
      });
    });

    it('管理者は全店舗の仕入先にアクセスできる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/stocking/supplier`,
        test: BackendApiTest.define({ as: apiRole.admin }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
        }),
      });
    });
  });
});
```

### Phase 4: テストデータ管理
```typescript
// テスト用固定データの活用
const testData = {
  storeId: apiTestConstant.storeMock.id,
  itemId: apiTestConstant.itemMock.id,
  staffId: apiTestConstant.userMock.posMaster.token.id,
  
  // 仕入れ用テストデータ
  stockingData: {
    supplier_id: 1,
    quantity: 10,
    unit_cost: 800,
    total_cost: 8000
  }
};
```

### Phase 5: 実行・検証
```bash
# テスト実行
cd packages/web-app
pnpm run test:integ:api:internal -- src/app/api/store/[store_id]/stocking/route.test.ts

# 全テスト実行で緑確認
pnpm run test:integ:api:internal
```

## 🧪 品質チェックリスト

### 実装品質
- [ ] 正常系テストケースが網羅されている
- [ ] 異常系（バリデーションエラー）テストが含まれている
- [ ] 権限制御テストが実装されている
- [ ] テストデータが適切に管理されている
- [ ] エラーメッセージの検証が含まれている

### テスト実行
- [ ] 個別テストファイルが正常に実行される
- [ ] 全API統合テストが緑で通る
- [ ] テスト実行時間が適切（30秒以内）
- [ ] メモリ使用量が適切

### コード品質
- [ ] 既存のテストパターンに準拠している
- [ ] `testApiHandler` + `BackendApiTest` パターンを使用
- [ ] `apiTestConstant` の固定データを活用
- [ ] 適切なアサーションを使用

## 🔧 実行コマンド

```bash
# 個別テスト実行
cd packages/web-app
pnpm run test:integ:api:internal -- src/app/api/store/[store_id]/stocking/route.test.ts

# ウォッチモード
pnpm run test:integ:api:internal -- --watch src/app/api/store/[store_id]/stocking/route.test.ts

# 詳細レポート
pnpm run test:integ:api:internal -- --reporter=verbose src/app/api/store/[store_id]/stocking/route.test.ts
```

## 🚨 トラブルシューティング

### よくある問題
1. **500エラー**: 開発サーバーが起動していない → `pnpm run dev` で起動
2. **404エラー**: APIルートが存在しない → `packages/web-app/src/app/api/store/[store_id]/stocking/route.ts` の確認
3. **403エラー**: 権限設定の問題 → `apiRole.pos` の使用確認
4. **テストデータエラー**: 固定データの問題 → `apiTestConstant` の値確認

### デバッグ方法
```typescript
// レスポンス内容の確認
console.log('Response status:', response.status);
console.log('Response data:', await response.json());

// リクエスト内容の確認
console.log('Request body:', JSON.stringify(requestData, null, 2));
```

## 📚 参考資料

- [APIエンドポイント仕様書](../docs/APIエンドポイント仕様書.md) - 仕入れAPI仕様
- [API自動統合テスト開発ガイド](../docs/API自動統合テスト開発ガイド.md) - 実装方法
- [テストケーステンプレート集](../docs/テストケーステンプレート集.md) - 再利用可能パターン

---

**重要**: このタスクは既存のテスト実装パターンに従い、APIエンドポイント仕様書の仕入れAPI仕様と完全に整合するテストを作成します。既存コードへの変更は一切行いません。 