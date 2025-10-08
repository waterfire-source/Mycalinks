# TASK-013: 棚卸 API 統合テスト実装

## 📋 タスク基本情報

- **タスクID**: TASK-013
- **カテゴリ**: test
- **担当エージェント**: QA-Agent
- **状態**: done
- **優先度**: medium
- **複雑度**: medium
- **作成日**: 2025-01-26
- **期限**: なし

## 🎯 タスク概要

棚卸関連API (`POST /inventory`, `POST /inventory/{id}/apply`) の統合テストを実装し、在庫棚卸作成・実行の正常系・バリデーション・権限制御を網羅する。

## 📂 対象ファイル（競合防止）

- `packages/web-app/src/app/api/store/[store_id]/inventory/route.test.ts`

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
  createInventory: 'POST /api/store/[store_id]/inventory',
  applyInventory: 'POST /api/store/[store_id]/inventory/[inventory_id]/apply'
};

// テストカテゴリ
const TEST_CATEGORIES = {
  正常系: ['棚卸作成', '棚卸実行', '部分棚卸', '全商品棚卸'],
  異常系: ['必須項目不足', '不正な在庫数', '存在しない棚卸ID'],
  権限制御: ['認証なし403', 'POSユーザー200', '他店舗403']
};
```

### Phase 2: テストファイル作成
```bash
# 1. 既存テンプレートをコピー
cp packages/web-app/src/app/api/store/[store_id]/product/route.test.ts \
   packages/web-app/src/app/api/store/[store_id]/inventory/route.test.ts

# 2. APIルートファイルの確認
ls packages/web-app/src/app/api/store/[store_id]/inventory/route.ts
```

### Phase 3: テストコード実装
```typescript
// packages/web-app/src/app/api/store/[store_id]/inventory/route.test.ts
import { describe, it, expect } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { apiTestConstant } from '@/api/backendApi/test/constant';
import { GET, POST } from './route';

describe('棚卸API', () => {
  const storeId = apiTestConstant.storeMock.id; // 3
  const productId = apiTestConstant.productMock.id; // 561417
  const staffId = apiTestConstant.userMock.posMaster.token.id; // 4

  describe('POST /api/store/[store_id]/inventory - 棚卸作成', () => {
    it('全商品棚卸を作成できる', async () => {
      const inventoryData = {
        name: `全商品棚卸_${Date.now()}`,
        description: 'テスト用全商品棚卸',
        staff_account_id: staffId,
        inventory_type: 'full',
        scheduled_date: '2025-01-27'
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inventoryData),
          });

          expect(response.status).toBe(201);
          const data = await response.json();
          expect(data.id).toBeDefined();
          expect(data.name).toBe(inventoryData.name);
          expect(data.inventory_type).toBe('full');
          expect(data.status).toBe('created');
        }),
      });
    });

    it('部分棚卸を作成できる', async () => {
      const partialInventoryData = {
        name: `部分棚卸_${Date.now()}`,
        description: 'テスト用部分棚卸',
        staff_account_id: staffId,
        inventory_type: 'partial',
        scheduled_date: '2025-01-27',
        target_products: [
          {
            product_id: productId,
            expected_quantity: 10
          }
        ]
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(partialInventoryData),
          });

          expect(response.status).toBe(201);
          const data = await response.json();
          expect(data.inventory_type).toBe('partial');
          expect(data.target_products.length).toBe(1);
        }),
      });
    });

    it('カテゴリ別棚卸を作成できる', async () => {
      const categoryInventoryData = {
        name: `カテゴリ別棚卸_${Date.now()}`,
        description: 'テスト用カテゴリ別棚卸',
        staff_account_id: staffId,
        inventory_type: 'category',
        scheduled_date: '2025-01-27',
        target_categories: [1, 2, 3]
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryInventoryData),
          });

          expect(response.status).toBe(201);
          const data = await response.json();
          expect(data.inventory_type).toBe('category');
          expect(data.target_categories.length).toBe(3);
        }),
      });
    });

    it('必須フィールド不足で400エラー', async () => {
      const incompleteData = {
        description: 'テスト棚卸',
        // name が不足
        staff_account_id: staffId
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
          expect(error.message).toContain('name');
        }),
      });
    });

    it('過去の日付で400エラー', async () => {
      const pastDateData = {
        name: 'テスト棚卸',
        staff_account_id: staffId,
        scheduled_date: '2020-01-01' // 過去の日付
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pastDateData),
          });

          expect(response.status).toBe(400);
        }),
      });
    });

    it('存在しないproduct_idで400エラー', async () => {
      const invalidProductData = {
        name: 'テスト棚卸',
        staff_account_id: staffId,
        inventory_type: 'partial',
        target_products: [
          {
            product_id: 999999, // 存在しないID
            expected_quantity: 10
          }
        ]
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invalidProductData),
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

  describe('POST /api/store/[store_id]/inventory/[inventory_id]/apply - 棚卸実行', () => {
    it('棚卸を正常に実行できる', async () => {
      // まず棚卸を作成
      const createData = {
        name: `実行テスト棚卸_${Date.now()}`,
        staff_account_id: staffId,
        inventory_type: 'partial',
        target_products: [
          {
            product_id: productId,
            expected_quantity: 10
          }
        ]
      };

      const createResponse = await BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
        return await fetch(`/api/store/${storeId}/inventory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createData),
        });
      });

      const inventory = await createResponse.json();

      // 棚卸実行
      const applyData = {
        staff_account_id: staffId,
        actual_counts: [
          {
            product_id: productId,
            actual_quantity: 8, // 実際の在庫数
            memo: '2個不足'
          }
        ],
        completion_memo: '棚卸完了'
      };

      await testApiHandler({
        appHandler: { POST },
        params: { 
          store_id: String(storeId),
          inventory_id: String(inventory.id)
        },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(applyData),
          });

          expect(response.status).toBe(200);
          const data = await response.json();
          expect(data.status).toBe('completed');
          expect(data.discrepancies.length).toBeGreaterThan(0);
          expect(data.discrepancies[0].difference).toBe(-2);
        }),
      });
    });

    it('在庫調整なしで棚卸完了できる', async () => {
      const createData = {
        name: `調整なし棚卸_${Date.now()}`,
        staff_account_id: staffId,
        inventory_type: 'partial',
        target_products: [
          {
            product_id: productId,
            expected_quantity: 10
          }
        ]
      };

      const createResponse = await BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
        return await fetch(`/api/store/${storeId}/inventory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createData),
        });
      });

      const inventory = await createResponse.json();

      const applyData = {
        staff_account_id: staffId,
        actual_counts: [
          {
            product_id: productId,
            actual_quantity: 10, // 期待値と同じ
            memo: '在庫一致'
          }
        ]
      };

      await testApiHandler({
        appHandler: { POST },
        params: { 
          store_id: String(storeId),
          inventory_id: String(inventory.id)
        },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(applyData),
          });

          expect(response.status).toBe(200);
          const data = await response.json();
          expect(data.status).toBe('completed');
          expect(data.discrepancies.length).toBe(0);
        }),
      });
    });

    it('存在しないinventory_idで404エラー', async () => {
      const applyData = {
        staff_account_id: staffId,
        actual_counts: []
      };

      await testApiHandler({
        appHandler: { POST },
        params: { 
          store_id: String(storeId),
          inventory_id: '999999'
        },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(applyData),
          });

          expect(response.status).toBe(404);
        }),
      });
    });

    it('負の実際在庫数で400エラー', async () => {
      const createData = {
        name: `エラーテスト棚卸_${Date.now()}`,
        staff_account_id: staffId,
        inventory_type: 'partial',
        target_products: [
          {
            product_id: productId,
            expected_quantity: 10
          }
        ]
      };

      const createResponse = await BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
        return await fetch(`/api/store/${storeId}/inventory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createData),
        });
      });

      const inventory = await createResponse.json();

      const invalidApplyData = {
        staff_account_id: staffId,
        actual_counts: [
          {
            product_id: productId,
            actual_quantity: -1, // 負の値
            memo: 'エラーテスト'
          }
        ]
      };

      await testApiHandler({
        appHandler: { POST },
        params: { 
          store_id: String(storeId),
          inventory_id: String(inventory.id)
        },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invalidApplyData),
          });

          expect(response.status).toBe(400);
        }),
      });
    });

    it('必須フィールド不足で400エラー', async () => {
      const createData = {
        name: `必須項目テスト棚卸_${Date.now()}`,
        staff_account_id: staffId,
        inventory_type: 'partial',
        target_products: [
          {
            product_id: productId,
            expected_quantity: 10
          }
        ]
      };

      const createResponse = await BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
        return await fetch(`/api/store/${storeId}/inventory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createData),
        });
      });

      const inventory = await createResponse.json();

      const incompleteApplyData = {
        // staff_account_id が不足
        actual_counts: [
          {
            product_id: productId,
            actual_quantity: 10
          }
        ]
      };

      await testApiHandler({
        appHandler: { POST },
        params: { 
          store_id: String(storeId),
          inventory_id: String(inventory.id)
        },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(incompleteApplyData),
          });

          expect(response.status).toBe(400);
        }),
      });
    });
  });

  describe('権限制御テスト', () => {
    it('他店舗の棚卸作成で403エラー', async () => {
      const inventoryData = {
        name: 'テスト棚卸',
        staff_account_id: staffId
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: '999' },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inventoryData),
          });

          expect(response.status).toBe(403);
        }),
      });
    });

    it('管理者は全店舗の棚卸を作成できる', async () => {
      const inventoryData = {
        name: `管理者棚卸_${Date.now()}`,
        staff_account_id: staffId,
        inventory_type: 'full'
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.admin }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inventoryData),
          });

          expect(response.status).toBe(201);
        }),
      });
    });
  });

  describe('統合シナリオテスト', () => {
    it('棚卸作成から実行まで完全フロー', async () => {
      await BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
        // 1. 棚卸作成
        const createData = {
          name: `完全フロー棚卸_${Date.now()}`,
          staff_account_id: staffId,
          inventory_type: 'partial',
          target_products: [
            {
              product_id: productId,
              expected_quantity: 10
            }
          ]
        };

        const createResponse = await fetch(`/api/store/${storeId}/inventory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createData),
        });

        expect(createResponse.status).toBe(201);
        const inventory = await createResponse.json();

        // 2. 棚卸実行
        const applyData = {
          staff_account_id: staffId,
          actual_counts: [
            {
              product_id: productId,
              actual_quantity: 12, // 2個増加
              memo: '発見在庫あり'
            }
          ],
          completion_memo: '完全フロー棚卸完了'
        };

        const applyResponse = await fetch(
          `/api/store/${storeId}/inventory/${inventory.id}/apply`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(applyData),
          }
        );

        expect(applyResponse.status).toBe(200);
        const result = await applyResponse.json();
        expect(result.status).toBe('completed');
        expect(result.discrepancies[0].difference).toBe(2);
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
  productId: apiTestConstant.productMock.id,
  staffId: apiTestConstant.userMock.posMaster.token.id,
  
  // 棚卸用テストデータ
  inventoryData: {
    name: `テスト棚卸_${Date.now()}`,
    inventory_type: 'partial',
    expected_quantity: 10,
    actual_quantity: 8
  }
};
```

### Phase 5: 実行・検証
```bash
# テスト実行
cd packages/web-app
pnpm run test:integ:api:internal -- src/app/api/store/[store_id]/inventory/route.test.ts

# 全テスト実行で緑確認
pnpm run test:integ:api:internal
```

## 🧪 品質チェックリスト

### 実装品質
- [ ] 正常系テストケースが網羅されている
- [ ] 異常系（バリデーションエラー）テストが含まれている
- [ ] 権限制御テストが実装されている
- [ ] 統合シナリオテストが含まれている
- [ ] テストデータが適切に管理されている

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
pnpm run test:integ:api:internal -- src/app/api/store/[store_id]/inventory/route.test.ts

# ウォッチモード
pnpm run test:integ:api:internal -- --watch src/app/api/store/[store_id]/inventory/route.test.ts

# 詳細レポート
pnpm run test:integ:api:internal -- --reporter=verbose src/app/api/store/[store_id]/inventory/route.test.ts
```

## 🚨 トラブルシューティング

### よくある問題
1. **500エラー**: 開発サーバーが起動していない → `pnpm run dev` で起動
2. **404エラー**: APIルートが存在しない → `packages/web-app/src/app/api/store/[store_id]/inventory/route.ts` の確認
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

- [APIエンドポイント仕様書](../docs/APIエンドポイント仕様書.md) - 棚卸API仕様
- [API自動統合テスト開発ガイド](../docs/API自動統合テスト開発ガイド.md) - 実装方法
- [テストケーステンプレート集](../docs/テストケーステンプレート集.md) - 再利用可能パターン

---

**重要**: このタスクは既存のテスト実装パターンに従い、APIエンドポイント仕様書の棚卸API仕様と完全に整合するテストを作成します。既存コードへの変更は一切行いません。 