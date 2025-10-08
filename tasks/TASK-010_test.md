# TASK-010: 統計 API 統合テスト実装

## 📋 タスク基本情報

- **タスクID**: TASK-010
- **カテゴリ**: test
- **担当エージェント**: QA-Agent
- **状態**: done
- **優先度**: low
- **複雑度**: low
- **作成日**: 2025-01-26

## 🎯 タスク概要

統計API (`GET /stats/transaction/by-genre`, `GET /stats/product`) の正常応答およびパラメータバリデーションを確認する統合テストを作成する。

## 📂 対象ファイル

- `packages/web-app/src/app/api/store/[store_id]/stats/route.test.ts`

## ✅ 受け入れ基準

- [x] 正常系パス
- [x] 期間外などでデータ0件レスポンス確認
- [x] 既存コード無変更

## 🚀 実装手順（詳細）

### Phase 1: 統計API確認
```typescript
const STATS_ENDPOINTS = {
  transactionByGenre: 'GET /api/store/[store_id]/stats/transaction/by-genre',
  productStats: 'GET /api/store/[store_id]/stats/product'
};
```

### Phase 2: テストコード実装
```typescript
// packages/web-app/src/app/api/store/[store_id]/stats/route.test.ts
import { describe, it, expect } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { apiTestConstant } from '@/api/backendApi/test/constant';
import { GET } from './route';

describe('統計API', () => {
  const storeId = apiTestConstant.storeMock.id;

  describe('GET /api/store/[store_id]/stats/transaction/by-genre', () => {
    it('ジャンル別取引統計を取得できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/stats/transaction/by-genre`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          expect(Array.isArray(data)).toBe(true);
          if (data.length > 0) {
            expect(data[0]).toHaveProperty('genre_name');
            expect(data[0]).toHaveProperty('transaction_count');
            expect(data[0]).toHaveProperty('total_amount');
            expect(typeof data[0].transaction_count).toBe('number');
            expect(typeof data[0].total_amount).toBe('number');
          }
        }),
      });
    });

    it('期間指定でジャンル別統計を取得できる', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/stats/transaction/by-genre?start_date=${startDate}&end_date=${endDate}`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          expect(Array.isArray(data)).toBe(true);
        }),
      });
    });

    it('取引種別指定でジャンル別統計を取得できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/stats/transaction/by-genre?transaction_kind=sell`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
        }),
      });
    });

    it('データが存在しない期間で空配列を返す', async () => {
      const futureStartDate = '2030-01-01';
      const futureEndDate = '2030-12-31';
      
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/stats/transaction/by-genre?start_date=${futureStartDate}&end_date=${futureEndDate}`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          expect(Array.isArray(data)).toBe(true);
          expect(data.length).toBe(0);
        }),
      });
    });

    it('無効な日付フォーマットで400エラー', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/stats/transaction/by-genre?start_date=invalid-date`,
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
        url: `/api/store/${storeId}/stats/transaction/by-genre?start_date=2024-12-31&end_date=2024-01-01`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(400);
        }),
      });
    });
  });

  describe('GET /api/store/[store_id]/stats/product', () => {
    it('商品統計を取得できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/stats/product`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          expect(data).toHaveProperty('total_products');
          expect(data).toHaveProperty('total_stock_value');
          expect(data).toHaveProperty('low_stock_count');
          expect(data).toHaveProperty('out_of_stock_count');
          expect(typeof data.total_products).toBe('number');
          expect(typeof data.total_stock_value).toBe('number');
        }),
      });
    });

    it('カテゴリ別商品統計を取得できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/stats/product?group_by=category`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          if (data.categories && data.categories.length > 0) {
            expect(data.categories[0]).toHaveProperty('category_name');
            expect(data.categories[0]).toHaveProperty('product_count');
            expect(data.categories[0]).toHaveProperty('stock_value');
          }
        }),
      });
    });

    it('ジャンル別商品統計を取得できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/stats/product?group_by=genre`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          if (data.genres && data.genres.length > 0) {
            expect(data.genres[0]).toHaveProperty('genre_name');
            expect(data.genres[0]).toHaveProperty('product_count');
          }
        }),
      });
    });

    it('在庫警告レベル指定で統計を取得できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/stats/product?low_stock_threshold=5`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          expect(data).toHaveProperty('low_stock_count');
          expect(typeof data.low_stock_count).toBe('number');
        }),
      });
    });

    it('詳細統計情報を取得できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/stats/product?include_details=true`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          expect(data).toHaveProperty('price_distribution');
          expect(data).toHaveProperty('stock_distribution');
          expect(data).toHaveProperty('top_selling_products');
        }),
      });
    });

    it('無効なgroup_byパラメータで400エラー', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/stats/product?group_by=invalid`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(400);
        }),
      });
    });

    it('負の在庫警告レベルで400エラー', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/stats/product?low_stock_threshold=-1`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(400);
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
        url: `/api/store/${storeId}/stats/transaction/by-genre`,
        test: BackendApiTest.define({ as: "" }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(403);
        }),
      });
    });

    it('他店舗の統計にアクセスで403エラー', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: '999' },
        url: `/api/store/999/stats/product`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(403);
        }),
      });
    });

    it('商品統計も権限制御される', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/stats/product`,
        test: BackendApiTest.define({ as: "" }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(403);
        }),
      });
    });
  });

  // パフォーマンステスト
  describe('パフォーマンス', () => {
    it('大量データでもレスポンス時間が適切', async () => {
      const startTime = Date.now();
      
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/stats/transaction/by-genre?start_date=2020-01-01&end_date=2024-12-31`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          expect(response.status).toBe(200);
          expect(responseTime).toBeLessThan(5000); // 5秒以内
        }),
      });
    });
  });
});
```

### Phase 3: テスト実行
```bash
cd packages/web-app
pnpm run test:integ:api:internal -- src/app/api/store/[store_id]/stats/route.test.ts
```

## 📊 品質チェックリスト

- [ ] **取引統計**: ジャンル別・期間指定・取引種別指定
- [ ] **商品統計**: 基本統計・カテゴリ別・ジャンル別・詳細情報
- [ ] **パラメータ検証**: 日付フォーマット・範囲チェック・無効値
- [ ] **空データ対応**: データなし期間での適切なレスポンス
- [ ] **権限制御**: 認証なし・他店舗アクセス制御
- [ ] **パフォーマンス**: 大量データでのレスポンス時間確認

---
*QA-Agent 作成・詳細化: 2025-01-26* 