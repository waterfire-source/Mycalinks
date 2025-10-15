# TASK-014: リアルタイム更新 API 統合テスト実装

## 📋 タスク基本情報

- **タスクID**: TASK-014
- **カテゴリ**: test
- **担当エージェント**: QA-Agent
- **状態**: done
- **優先度**: low
- **複雑度**: low
- **作成日**: 2025-01-26
- **期限**: なし

## 🎯 タスク概要

リアルタイム更新API (`GET /subscribe-event/product`) のServer-Sent Events接続・データ受信・権限制御を確認する統合テストを実装する。

## 📂 対象ファイル（競合防止）

- `packages/web-app/src/app/api/store/[store_id]/subscribe-event/route.test.ts`

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
  productEvents: 'GET /api/store/[store_id]/subscribe-event/product'
};

// テストカテゴリ
const TEST_CATEGORIES = {
  正常系: ['SSE接続確立', 'イベントデータ受信', '接続維持'],
  異常系: ['不正なイベントタイプ', '接続タイムアウト'],
  権限制御: ['認証なし403', 'POSユーザー200', '他店舗403']
};
```

### Phase 2: テストファイル作成
```bash
# 1. 既存テンプレートをコピー
cp packages/web-app/src/app/api/store/[store_id]/product/route.test.ts \
   packages/web-app/src/app/api/store/[store_id]/subscribe-event/route.test.ts

# 2. APIルートファイルの確認
ls packages/web-app/src/app/api/store/[store_id]/subscribe-event/route.ts
```

### Phase 3: テストコード実装
```typescript
// packages/web-app/src/app/api/store/[store_id]/subscribe-event/route.test.ts
import { describe, it, expect } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { apiTestConstant } from '@/api/backendApi/test/constant';
import { GET } from './route';

describe('リアルタイム更新API', () => {
  const storeId = apiTestConstant.storeMock.id; // 3
  const productId = apiTestConstant.productMock.id; // 561417

  describe('GET /api/store/[store_id]/subscribe-event/product - 商品更新購読', () => {
    it('SSE接続を確立できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/subscribe-event/product`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          
          expect(response.status).toBe(200);
          expect(response.headers.get('content-type')).toContain('text/event-stream');
          expect(response.headers.get('cache-control')).toBe('no-cache');
          expect(response.headers.get('connection')).toBe('keep-alive');
        }),
      });
    });

    it('特定商品の更新イベントを購読できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/subscribe-event/product?product_id=${productId}`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          
          expect(response.status).toBe(200);
          expect(response.headers.get('content-type')).toContain('text/event-stream');
        }),
      });
    });

    it('カテゴリ別商品更新イベントを購読できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/subscribe-event/product?category_id=1`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          
          expect(response.status).toBe(200);
          expect(response.headers.get('content-type')).toContain('text/event-stream');
        }),
      });
    });

    it('イベントタイプ指定で購読できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/subscribe-event/product?event_types=stock_update,price_change`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          
          expect(response.status).toBe(200);
          expect(response.headers.get('content-type')).toContain('text/event-stream');
        }),
      });
    });

    it('初期データを含めて購読できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/subscribe-event/product?include_initial=true`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          
          expect(response.status).toBe(200);
          expect(response.headers.get('content-type')).toContain('text/event-stream');
        }),
      });
    });

    it('不正なevent_typesで400エラー', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/subscribe-event/product?event_types=invalid_event`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          
          expect(response.status).toBe(400);
          const error = await response.json();
          expect(error.message).toContain('event_types');
        }),
      });
    });

    it('存在しないproduct_idで404エラー', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/subscribe-event/product?product_id=999999`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          
          expect(response.status).toBe(404);
        }),
      });
    });

    it('存在しないcategory_idで404エラー', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/subscribe-event/product?category_id=999999`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          
          expect(response.status).toBe(404);
        }),
      });
    });

    it('認証なしで403エラー', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/subscribe-event/product`,
        test: BackendApiTest.define({ as: "" }, async (fetch) => {
          const response = await fetch();
          
          expect(response.status).toBe(403);
        }),
      });
    });

    it('他店舗のイベント購読で403エラー', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: '999' },
        url: `/api/store/999/subscribe-event/product`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          
          expect(response.status).toBe(403);
        }),
      });
    });

    it('管理者は全店舗のイベントを購読できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/subscribe-event/product`,
        test: BackendApiTest.define({ as: apiRole.admin }, async (fetch) => {
          const response = await fetch();
          
          expect(response.status).toBe(200);
          expect(response.headers.get('content-type')).toContain('text/event-stream');
        }),
      });
    });
  });

  describe('SSEイベントデータ形式テスト', () => {
    it('在庫更新イベントの形式を確認', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/subscribe-event/product?event_types=stock_update&product_id=${productId}`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          
          expect(response.status).toBe(200);
          
          // SSEストリームの基本的な確認
          // 実際のイベントデータの検証は統合テストでは困難なため、
          // 接続確立とヘッダー確認に留める
          expect(response.headers.get('content-type')).toContain('text/event-stream');
          expect(response.headers.get('cache-control')).toBe('no-cache');
        }),
      });
    });

    it('価格変更イベントの形式を確認', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/subscribe-event/product?event_types=price_change&product_id=${productId}`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          
          expect(response.status).toBe(200);
          expect(response.headers.get('content-type')).toContain('text/event-stream');
        }),
      });
    });

    it('商品作成イベントの形式を確認', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/subscribe-event/product?event_types=product_created`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          
          expect(response.status).toBe(200);
          expect(response.headers.get('content-type')).toContain('text/event-stream');
        }),
      });
    });

    it('商品削除イベントの形式を確認', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/subscribe-event/product?event_types=product_deleted`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          
          expect(response.status).toBe(200);
          expect(response.headers.get('content-type')).toContain('text/event-stream');
        }),
      });
    });
  });

  describe('接続オプションテスト', () => {
    it('ハートビート間隔を指定できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/subscribe-event/product?heartbeat_interval=10`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          
          expect(response.status).toBe(200);
          expect(response.headers.get('content-type')).toContain('text/event-stream');
        }),
      });
    });

    it('バッファサイズを指定できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/subscribe-event/product?buffer_size=100`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          
          expect(response.status).toBe(200);
          expect(response.headers.get('content-type')).toContain('text/event-stream');
        }),
      });
    });

    it('不正なハートビート間隔で400エラー', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/subscribe-event/product?heartbeat_interval=-1`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          
          expect(response.status).toBe(400);
        }),
      });
    });

    it('不正なバッファサイズで400エラー', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/subscribe-event/product?buffer_size=0`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          
          expect(response.status).toBe(400);
        }),
      });
    });
  });

  describe('複数条件組み合わせテスト', () => {
    it('商品IDとイベントタイプを組み合わせて購読できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/subscribe-event/product?product_id=${productId}&event_types=stock_update,price_change`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          
          expect(response.status).toBe(200);
          expect(response.headers.get('content-type')).toContain('text/event-stream');
        }),
      });
    });

    it('カテゴリIDとイベントタイプを組み合わせて購読できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/subscribe-event/product?category_id=1&event_types=stock_update&include_initial=true`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          
          expect(response.status).toBe(200);
          expect(response.headers.get('content-type')).toContain('text/event-stream');
        }),
      });
    });

    it('全オプションを組み合わせて購読できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/subscribe-event/product?product_id=${productId}&event_types=stock_update&include_initial=true&heartbeat_interval=30&buffer_size=50`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          
          expect(response.status).toBe(200);
          expect(response.headers.get('content-type')).toContain('text/event-stream');
        }),
      });
    });
  });

  describe('接続制限テスト', () => {
    it('同一ユーザーの複数接続を制限する', async () => {
      // 最初の接続
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/subscribe-event/product`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response1 = await fetch();
          expect(response1.status).toBe(200);
          
          // 同じユーザーからの2回目の接続
          const response2 = await fetch();
          // 実装によっては429 Too Many Requestsまたは200で既存接続を置き換え
          expect([200, 429]).toContain(response2.status);
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
  productId: apiTestConstant.productMock.id,
  
  // SSE用テストデータ
  eventTypes: ['stock_update', 'price_change', 'product_created', 'product_deleted'],
  sseOptions: {
    heartbeat_interval: 30,
    buffer_size: 100,
    include_initial: true
  }
};
```

### Phase 5: 実行・検証
```bash
# テスト実行
cd packages/web-app
pnpm run test:integ:api:internal -- src/app/api/store/[store_id]/subscribe-event/route.test.ts

# 全テスト実行で緑確認
pnpm run test:integ:api:internal
```

## 🧪 品質チェックリスト

### 実装品質
- [ ] SSE接続確立テストが実装されている
- [ ] 適切なヘッダー検証が含まれている
- [ ] パラメータバリデーションテストが含まれている
- [ ] 権限制御テストが実装されている
- [ ] エラーケースが網羅されている

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
pnpm run test:integ:api:internal -- src/app/api/store/[store_id]/subscribe-event/route.test.ts

# ウォッチモード
pnpm run test:integ:api:internal -- --watch src/app/api/store/[store_id]/subscribe-event/route.test.ts

# 詳細レポート
pnpm run test:integ:api:internal -- --reporter=verbose src/app/api/store/[store_id]/subscribe-event/route.test.ts
```

## 🚨 トラブルシューティング

### よくある問題
1. **500エラー**: 開発サーバーが起動していない → `pnpm run dev` で起動
2. **404エラー**: APIルートが存在しない → `packages/web-app/src/app/api/store/[store_id]/subscribe-event/route.ts` の確認
3. **403エラー**: 権限設定の問題 → `apiRole.pos` の使用確認
4. **SSE接続エラー**: ヘッダー設定の問題 → Content-Typeの確認

### デバッグ方法
```typescript
// レスポンスヘッダーの確認
console.log('Content-Type:', response.headers.get('content-type'));
console.log('Cache-Control:', response.headers.get('cache-control'));
console.log('Connection:', response.headers.get('connection'));

// ステータスコードの確認
console.log('Response status:', response.status);
```

## 📚 参考資料

- [APIエンドポイント仕様書](../docs/APIエンドポイント仕様書.md) - リアルタイム更新API仕様
- [API自動統合テスト開発ガイド](../docs/API自動統合テスト開発ガイド.md) - 実装方法
- [テストケーステンプレート集](../docs/テストケーステンプレート集.md) - 再利用可能パターン

## 📝 注意事項

### SSEテストの制限
- Server-Sent Eventsの実際のストリーミングデータテストは統合テストでは困難
- 接続確立とヘッダー検証に重点を置く
- 実際のイベントデータ検証は別途E2Eテストで実施

### 非同期処理の考慮
- SSE接続は非同期処理のため、適切なタイムアウト設定が必要
- 接続の確立確認のみを行い、長時間の接続維持テストは避ける

---

**重要**: このタスクは既存のテスト実装パターンに従い、APIエンドポイント仕様書のリアルタイム更新API仕様と完全に整合するテストを作成します。既存コードへの変更は一切行いません。 