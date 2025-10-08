# EC決済方法管理機能

## 目的
認証済みユーザーの決済方法を管理する機能（現在未実装）

## 機能概要
- **決済方法一覧**: 登録済み決済方法の表示
- **決済方法追加**: 新しい決済方法の登録
- **決済方法編集**: 既存決済方法の変更
- **決済方法削除**: 不要な決済方法の削除

## 実装状況

### 現在の状況
- **ディレクトリ**: 存在しない
- **実装**: 未実装
- **計画**: 将来実装予定

### 想定される実装構造
```
packages/web-app/src/app/ec/(auth)/payment-method/
├── page.tsx                    # 決済方法一覧画面
├── add/                        # 決済方法追加
│   ├── page.tsx               # 追加フォーム
│   └── confirm/               # 追加確認
│       └── page.tsx
├── edit/                       # 決済方法編集
│   └── [id]/
│       ├── page.tsx           # 編集フォーム
│       └── confirm/           # 編集確認
│           └── page.tsx
└── delete/                     # 決済方法削除
    └── [id]/
        └── page.tsx           # 削除確認
```

## 想定される技術実装

### 決済方法管理
```typescript
// 決済方法データ構造
interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'bank_transfer' | 'convenience_store';
  name: string;
  isDefault: boolean;
  details: CreditCardDetails | BankDetails | ConvenienceStoreDetails;
  createdAt: Date;
  updatedAt: Date;
}

// クレジットカード詳細
interface CreditCardDetails {
  cardNumber: string;        // マスク表示
  expiryMonth: string;
  expiryYear: string;
  cardholderName: string;
  brand: 'visa' | 'mastercard' | 'jcb' | 'amex';
}
```

### セキュリティ考慮事項
```typescript
// セキュリティ実装
- カード情報の暗号化保存
- PCI DSS準拠
- トークン化による機密情報保護
- SSL/TLS通信の必須化
- 二段階認証による変更確認
```

### UI/UX設計
```typescript
// 決済方法一覧画面
<PaymentMethodList>
  {paymentMethods.map((method) => (
    <PaymentMethodCard
      key={method.id}
      method={method}
      isDefault={method.isDefault}
      onEdit={() => router.push(`/payment-method/edit/${method.id}`)}
      onDelete={() => handleDelete(method.id)}
      onSetDefault={() => handleSetDefault(method.id)}
    />
  ))}
  <AddPaymentMethodButton />
</PaymentMethodList>
```

## 関連システムとの連携

### 現在の決済システム
- **注文確認画面**: `packages/web-app/src/app/ec/(auth)/order/page.tsx`
- **決済処理**: `@/app/ec/(core)/feature/order/` 内の決済コンポーネント
- **決済方法定数**: `@/app/ec/(core)/constants/payment.ts`

### 実装時の統合ポイント
```typescript
// 注文確認画面との連携
const { savedPaymentMethods } = usePaymentMethods();
const selectedMethod = savedPaymentMethods.find(m => m.isDefault);

// 決済処理との統合
const processPayment = async (orderId: string, paymentMethodId: string) => {
  const method = await getPaymentMethod(paymentMethodId);
  return await executePayment(orderId, method);
};
```

## 実装優先度・理由

### 現在未実装の理由
1. **MVP機能優先**: 基本的な注文・決済フローの完成を優先
2. **セキュリティ要件**: 決済情報管理には高度なセキュリティ対策が必要
3. **法的要件**: PCI DSS等の規制対応が必要
4. **開発リソース**: 他の重要機能の実装を優先

### 将来実装時の考慮事項
- **セキュリティ監査**: 第三者機関による安全性確認
- **法的コンプライアンス**: 決済業法等の規制対応
- **ユーザビリティテスト**: 決済方法管理の使いやすさ検証
- **パフォーマンス**: 決済情報の高速取得・表示

## 代替実装・回避策

### 現在の決済フロー
```typescript
// 注文ごとの決済方法選択
1. カート確認
2. 配送先選択
3. 決済方法選択（その場で入力）
4. 注文確定
5. 決済処理
```

### 一時的な解決策
- 注文確認画面での都度入力
- ブラウザの自動入力機能活用
- 決済代行サービスの保存機能利用

## 実装計画案

### フェーズ1: 基本機能
- 決済方法一覧表示
- クレジットカード追加・削除
- デフォルト決済方法設定

### フェーズ2: 拡張機能
- 複数決済方法対応
- 銀行振込・コンビニ決済対応
- 決済履歴との連携

### フェーズ3: 高度な機能
- 定期決済設定
- 決済方法の有効期限管理
- セキュリティ強化機能

## 関連ファイル
- `../order/page.tsx`: 注文確認・決済画面（現在の決済方法選択）
- `@/app/ec/(core)/constants/payment.ts`: 決済方法定数
- `@/app/ec/(core)/feature/order/`: 決済関連コンポーネント
- `@/providers/useAppAuth.tsx`: 認証プロバイダー

---
*生成: 2025-01-24 / 項目48 - EC決済方法管理機能（未実装）* 