# TASK-005: 商品マスタ API 統合テスト実装

## 📋 タスク基本情報

- **タスクID**: TASK-005
- **カテゴリ**: test
- **担当エージェント**: QA-Agent
- **状態**: done
- **優先度**: high
- **複雑度**: medium
- **作成日**: 2025-01-26
- **期限**: なし

## 🎯 タスク概要

`GET /item`, `POST /item`, `PUT /item/{item_id}`, `GET /item/transaction` など商品マスタ関連APIの正常系・バリデーション・権限制御を網羅する統合テストを実装する。

## 📂 対象ファイル（競合防止）

- `packages/web-app/src/app/api/store/[store_id]/item/route.test.ts`

## ✅ 受け入れ基準

- [ ] 上記テストファイルを作成し、既存テスト同様 `testApiHandler` + `BackendApiTest` で実装されている
- [ ] `pnpm run test:integ:api:internal` が全緑で通る
- [ ] 既存ソースコードやAPI実装には一切変更を加えていない

## 🔄 依存関係

- **requires**: なし
- **blocks**: TASK-007, TASK-009 など後続テスト

## 🚀 実装手順（詳細）

### Phase 1: テストケース設計
```typescript
// テスト対象APIエンドポイント
const ENDPOINTS = {
  list: 'GET /api/store/[store_id]/item',
  create: 'POST /api/store/[store_id]/item',
  update: 'PUT /api/store/[store_id]/item/[item_id]',
  history: 'GET /api/store/[store_id]/item/transaction'
};

// テストカテゴリ
const TEST_CATEGORIES = {
  正常系: ['一覧取得', '新規作成', '更新', '取引履歴取得'],
  異常系: ['存在しないID', '必須項目不足', '不正な値'],
  権限制御: ['認証なし403', 'POSユーザー200', '他店舗403']
};
```

### Phase 2: テストファイル作成
```bash
# 1. 既存テンプレートをコピー
cp packages/web-app/src/app/api/store/[store_id]/product/route.test.ts \
   packages/web-app/src/app/api/store/[store_id]/item/route.test.ts

# 2. APIルートファイルの確認
ls packages/web-app/src/app/api/store/[store_id]/item/route.ts
```

### Phase 3: テストコード実装
```typescript
// packages/web-app/src/app/api/store/[store_id]/item/route.test.ts
import { describe, it, expect } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { apiTestConstant } from '@/api/backendApi/test/constant';
import { GET, POST, PUT } from './route';

describe('商品マスタAPI', () => {
  const storeId = apiTestConstant.storeMock.id; // 3
  const itemId = apiTestConstant.itemMock.id;   // 97360

  describe('GET /api/store/[store_id]/item', () => {
    it('商品マスタ一覧を取得できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          expect(data).toHaveProperty('items');
          expect(Array.isArray(data.items)).toBe(true);
        }),
      });
    });

    it('検索パラメータで絞り込める', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/item?display_name=テスト&take=10`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
        }),
      });
    });

    it('認証なしで403エラーを返す', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: "" }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(403);
        }),
      });
    });
  });

  describe('POST /api/store/[store_id]/item', () => {
    it('新規商品マスタを作成できる', async () => {
      const newItem = {
        display_name: `テスト商品_${Date.now()}`,
        category_id: 1,
        genre_id: 1,
        market_price: 1000,
        description: 'テスト用商品マスタ'
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newItem),
          });

          expect(response.status).toBe(201);
          const data = await response.json();
          expect(data.display_name).toBe(newItem.display_name);
          expect(data.id).toBeDefined();
        }),
      });
    });

    it('必須フィールド不足で400エラー', async () => {
      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ market_price: 1000 }), // display_name不足
          });

          expect(response.status).toBe(400);
        }),
      });
    });
  });

  describe('PUT /api/store/[store_id]/item/[item_id]', () => {
    it('商品マスタを更新できる', async () => {
      const updateData = {
        display_name: `更新商品_${Date.now()}`,
        market_price: 1500
      };

      await testApiHandler({
        appHandler: { PUT },
        params: { 
          store_id: String(storeId),
          item_id: String(itemId)
        },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
          });

          expect(response.status).toBe(200);
        }),
      });
    });

    it('存在しないitem_idで404エラー', async () => {
      await testApiHandler({
        appHandler: { PUT },
        params: { 
          store_id: String(storeId),
          item_id: '999999'
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
  });

  describe('GET /api/store/[store_id]/item/transaction', () => {
    it('商品取引履歴を取得できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/item/transaction?item_id=${itemId}`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          expect(Array.isArray(data)).toBe(true);
        }),
      });
    });
  });
});
```

### Phase 4: テストデータ管理
```typescript
// 固定テストデータの活用
const TEST_DATA = {
  storeId: apiTestConstant.storeMock.id,           // 3
  itemId: apiTestConstant.itemMock.id,             // 97360
  corporationId: apiTestConstant.corporationMock.id, // 2
  
  // 動的データ（作成系テスト用）
  createItem: () => ({
    display_name: `テスト商品_${Date.now()}`,
    category_id: 1,
    genre_id: 1,
    market_price: Math.floor(Math.random() * 10000) + 100
  })
};
```

### Phase 5: テスト実行・検証
```bash
# 1. 開発サーバー起動（別ターミナル）
cd packages/web-app
pnpm run dev

# 2. 個別テスト実行
pnpm run test:integ:api:internal -- src/app/api/store/[store_id]/item/route.test.ts

# 3. ウォッチモードで開発
pnpm run test:integ:api:internal -- --watch src/app/api/store/[store_id]/item/route.test.ts

# 4. 全API統合テスト実行
pnpm run test:integ:api:internal
```

## 📊 品質チェックリスト

- [ ] **テストカバレッジ**: 主要エンドポイント全てカバー
- [ ] **エラーハンドリング**: 400, 403, 404エラーをテスト
- [ ] **権限制御**: 各ロール（pos, "", admin）での動作確認
- [ ] **データバリデーション**: 必須項目・型制約をテスト
- [ ] **レスポンス検証**: ステータスコード・レスポンス形式確認
- [ ] **既存コード非改変**: API実装には一切変更なし

## 🔍 トラブルシューティング

### よくある問題
1. **500エラー**: 開発サーバー未起動 → `pnpm run dev`
2. **Import エラー**: route.tsパス確認 → `./route` が正しいか
3. **テスト失敗**: apiTestConstant値確認 → 実際のDBデータと一致するか

---
*QA-Agent 作成・詳細化: 2025-01-26* 