# TASK-009: レジ API 統合テスト実装

## 📋 タスク基本情報

- **タスクID**: TASK-009
- **カテゴリ**: test
- **担当エージェント**: QA-Agent
- **状態**: done
- **優先度**: medium
- **複雑度**: medium
- **作成日**: 2025-01-26

## 🎯 タスク概要

レジAPI (`GET /register`, `PUT /register/cash`, `POST /register`[精算]) の統合テストを作成する。

## 📂 対象ファイル

- `packages/web-app/src/app/api/store/[store_id]/register/route.test.ts`

## ✅ 受け入れ基準

- [x] 残高取得・現金調整・精算それぞれの正常系テスト
- [x] 不正な金額・権限不足等の異常系テスト
- [x] 既存コードは変更しない

## 🚀 実装手順（詳細）

### Phase 1: レジAPI確認
```typescript
const REGISTER_ENDPOINTS = {
  balance: 'GET /api/store/[store_id]/register',
  adjustCash: 'PUT /api/store/[store_id]/register/cash',
  settlement: 'POST /api/store/[store_id]/register'
};
```

### Phase 2: テストコード実装
```typescript
// packages/web-app/src/app/api/store/[store_id]/register/route.test.ts
import { describe, it, expect } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { apiTestConstant } from '@/api/backendApi/test/constant';
import { GET, PUT, POST } from './route';

describe('レジAPI', () => {
  const storeId = apiTestConstant.storeMock.id;
  const staffId = apiTestConstant.userMock.posMaster.token.id;

  describe('GET /api/store/[store_id]/register - レジ残高取得', () => {
    it('レジ残高を正常に取得できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          expect(data).toHaveProperty('cash_balance');
          expect(data).toHaveProperty('theoretical_balance');
          expect(data).toHaveProperty('last_settlement_at');
          expect(typeof data.cash_balance).toBe('number');
          expect(typeof data.theoretical_balance).toBe('number');
        }),
      });
    });

    it('レジ残高の詳細情報を取得できる', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        url: `/api/store/${storeId}/register?includeDetails=true`,
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(200);
          
          const data = await response.json();
          expect(data).toHaveProperty('denomination_breakdown');
          expect(data).toHaveProperty('transaction_summary');
          expect(data).toHaveProperty('adjustment_history');
        }),
      });
    });

    it('権限なしで403エラー', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: "" }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(403);
        }),
      });
    });

    it('他店舗のレジ残高にアクセスで403エラー', async () => {
      await testApiHandler({
        appHandler: { GET },
        params: { store_id: '999' },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch();
          expect(response.status).toBe(403);
        }),
      });
    });
  });

  describe('PUT /api/store/[store_id]/register/cash - 現金調整', () => {
    it('現金残高を正常に調整できる', async () => {
      const adjustment = {
        staff_account_id: staffId,
        adjustment_amount: 1000,
        adjustment_reason: 'テスト調整',
        denomination: {
          '10000': 0,
          '5000': 0,
          '1000': 1,
          '500': 0,
          '100': 0,
          '50': 0,
          '10': 0,
          '5': 0,
          '1': 0
        }
      };

      await testApiHandler({
        appHandler: { PUT },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adjustment),
          });

          expect(response.status).toBe(200);
          const data = await response.json();
          expect(data).toHaveProperty('new_balance');
          expect(data).toHaveProperty('adjustment_id');
        }),
      });
    });

    it('負の調整額で現金を減らせる', async () => {
      const negativeAdjustment = {
        staff_account_id: staffId,
        adjustment_amount: -500,
        adjustment_reason: '現金過多修正',
        denomination: {
          '500': -1
        }
      };

      await testApiHandler({
        appHandler: { PUT },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(negativeAdjustment),
          });

          expect(response.status).toBe(200);
        }),
      });
    });

    it('金種合計と調整額が一致しない場合400エラー', async () => {
      const invalidAdjustment = {
        staff_account_id: staffId,
        adjustment_amount: 1000,
        adjustment_reason: 'テスト',
        denomination: {
          '500': 1 // 500円だが調整額は1000円
        }
      };

      await testApiHandler({
        appHandler: { PUT },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invalidAdjustment),
          });

          expect(response.status).toBe(400);
          const error = await response.json();
          expect(error.message).toContain('金種');
        }),
      });
    });

    it('必須項目不足で400エラー', async () => {
      const incompleteAdjustment = {
        adjustment_amount: 1000
        // staff_account_id, adjustment_reason が不足
      };

      await testApiHandler({
        appHandler: { PUT },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(incompleteAdjustment),
          });

          expect(response.status).toBe(400);
        }),
      });
    });

    it('調整理由が長すぎる場合400エラー', async () => {
      const longReasonAdjustment = {
        staff_account_id: staffId,
        adjustment_amount: 1000,
        adjustment_reason: 'あ'.repeat(1000), // 非常に長い理由
        denomination: { '1000': 1 }
      };

      await testApiHandler({
        appHandler: { PUT },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(longReasonAdjustment),
          });

          expect(response.status).toBe(400);
        }),
      });
    });
  });

  describe('POST /api/store/[store_id]/register - レジ精算', () => {
    it('レジ精算を正常に実行できる', async () => {
      const settlement = {
        staff_account_id: staffId,
        settlement_type: 'daily',
        actual_cash_amount: 50000,
        denomination: {
          '10000': 3,
          '5000': 2,
          '1000': 5,
          '500': 6,
          '100': 10,
          '50': 0,
          '10': 0,
          '5': 0,
          '1': 0
        },
        notes: '日次精算テスト'
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settlement),
          });

          expect(response.status).toBe(201);
          const data = await response.json();
          expect(data).toHaveProperty('settlement_id');
          expect(data).toHaveProperty('difference_amount');
          expect(data).toHaveProperty('settlement_time');
        }),
      });
    });

    it('中間精算を実行できる', async () => {
      const midSettlement = {
        staff_account_id: staffId,
        settlement_type: 'intermediate',
        actual_cash_amount: 25000,
        denomination: {
          '10000': 1,
          '5000': 1,
          '1000': 10
        },
        notes: '中間精算テスト'
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(midSettlement),
          });

          expect(response.status).toBe(201);
        }),
      });
    });

    it('金種合計と実際現金額が一致しない場合400エラー', async () => {
      const mismatchSettlement = {
        staff_account_id: staffId,
        settlement_type: 'daily',
        actual_cash_amount: 50000,
        denomination: {
          '10000': 1 // 10000円だが actual_cash_amount は 50000円
        }
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mismatchSettlement),
          });

          expect(response.status).toBe(400);
          const error = await response.json();
          expect(error.message).toContain('金種合計');
        }),
      });
    });

    it('無効な精算タイプで400エラー', async () => {
      const invalidTypeSettlement = {
        staff_account_id: staffId,
        settlement_type: 'invalid_type',
        actual_cash_amount: 10000,
        denomination: { '10000': 1 }
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invalidTypeSettlement),
          });

          expect(response.status).toBe(400);
        }),
      });
    });

    it('負の現金額で400エラー', async () => {
      const negativeAmountSettlement = {
        staff_account_id: staffId,
        settlement_type: 'daily',
        actual_cash_amount: -1000,
        denomination: {}
      };

      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: apiRole.pos }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(negativeAmountSettlement),
          });

          expect(response.status).toBe(400);
        }),
      });
    });
  });

  // 権限制御統合テスト
  describe('権限制御統合', () => {
    it('現金調整も権限制御される', async () => {
      await testApiHandler({
        appHandler: { PUT },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: "" }, async (fetch) => {
          const response = await fetch({
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              staff_account_id: staffId,
              adjustment_amount: 1000,
              adjustment_reason: 'テスト'
            }),
          });
          expect(response.status).toBe(403);
        }),
      });
    });

    it('精算も権限制御される', async () => {
      await testApiHandler({
        appHandler: { POST },
        params: { store_id: String(storeId) },
        test: BackendApiTest.define({ as: "" }, async (fetch) => {
          const response = await fetch({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              staff_account_id: staffId,
              settlement_type: 'daily',
              actual_cash_amount: 10000
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
pnpm run test:integ:api:internal -- src/app/api/store/[store_id]/register/route.test.ts
```

## 📊 品質チェックリスト

- [ ] **残高取得**: 基本情報・詳細情報・権限制御
- [ ] **現金調整**: 正常調整・負の調整・金種整合性チェック
- [ ] **精算処理**: 日次精算・中間精算・金額整合性チェック
- [ ] **バリデーション**: 必須項目・金種合計・精算タイプ
- [ ] **権限制御**: 認証なし・他店舗アクセス制御
- [ ] **エラーハンドリング**: 400・403エラーの適切な返却

---
*QA-Agent 作成・詳細化: 2025-01-26* 