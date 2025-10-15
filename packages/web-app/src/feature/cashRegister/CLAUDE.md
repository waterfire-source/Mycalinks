# cashRegister/CLAUDE.md

## 🎯 目的・役割

キャッシュレジスター機能 - POSレジシステムの中核機能として、商品登録・決済処理・レシート発行・現金管理を統合したReactコンポーネント群。店舗での販売業務を効率化する。

## 🏗️ 技術構成

- **フレームワーク**: React 18 with TypeScript
- **UIライブラリ**: Material-UI (MUI) v5
- **状態管理**: Zustand (レジ状態管理)
- **決済連携**: Square API, GMO決済
- **プリンター**: ESC/POS プリンター制御
- **依存関係**: cash/, register/, transaction/

## 📁 ディレクトリ構造

```
cashRegister/
├── components/
│   ├── RegisterScreen.tsx         # メインレジ画面
│   ├── ProductScanner.tsx         # 商品スキャン・登録
│   ├── CartDisplay.tsx            # カート表示
│   ├── PaymentPanel.tsx           # 決済パネル
│   ├── ReceiptPreview.tsx         # レシートプレビュー
│   ├── CashDrawerControl.tsx      # ドロワー制御
│   └── RegisterKeypad.tsx         # 数値入力パッド
├── hooks/
│   ├── useRegisterState.ts        # レジ状態管理
│   ├── usePaymentProcess.ts       # 決済処理
│   ├── useReceiptPrint.ts         # レシート印刷
│   └── useBarcodeScanner.ts       # バーコードスキャン
├── stores/
│   └── registerStore.ts           # Zustand ストア
└── types/
    └── register.ts                # 型定義
```

## 🔧 主要機能

### 商品登録・カート管理
- **バーコードスキャン**: 商品の自動読み取り
- **手動登録**: 商品コード・価格の手動入力
- **数量変更**: カート内商品の数量調整
- **割引適用**: 商品別・全体割引の適用

### 決済処理
- **現金決済**: 釣り銭計算・ドロワー制御
- **カード決済**: Square・GMO連携
- **複合決済**: 現金+カードの組み合わせ
- **ポイント利用**: 顧客ポイントの利用・付与

### レシート・印刷
- **レシート生成**: 取引内容の自動生成
- **印刷制御**: ESC/POSプリンター制御
- **再印刷**: 過去取引のレシート再発行
- **電子レシート**: メール・SMS送信

## 💡 使用パターン

### レジ画面
```typescript
<RegisterScreen
  storeId={storeId}
  operatorId={operatorId}
  onTransactionComplete={handleComplete}
  enableScanner={true}
/>
```

### 決済パネル
```typescript
<PaymentPanel
  totalAmount={cartTotal}
  availablePayments={['cash', 'card', 'point']}
  onPaymentComplete={handlePayment}
  showChange={true}
/>
```

### カート表示
```typescript
<CartDisplay
  items={cartItems}
  onQuantityChange={handleQuantityChange}
  onItemRemove={handleItemRemove}
  showDiscounts={true}
/>
```

## 🗺️ プロジェクト内での位置づけ

- **上位層**: Feature統括
- **統合層**: 現金・レジスター・取引管理
- **下位層**: 決済処理、印刷制御
- **連携先**: 在庫管理、顧客管理、売上管理

## 🔗 関連ディレクトリ

- [../](../) - Feature統括
- [../cash/](../cash/) - 現金管理
- [../register/](../register/) - レジスター管理
- [../transaction/](../transaction/) - 取引管理
- [../customer/](../customer/) - 顧客管理
- [../item/](../item/) - 商品管理

## 📝 開発メモ

### レジ状態管理
```typescript
interface RegisterState {
  cart: CartItem[];
  customer?: Customer;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
}
```

### 決済フロー
1. **商品登録**: スキャン・手動入力
2. **顧客選択**: 会員・非会員の選択
3. **割引適用**: クーポン・ポイント利用
4. **決済処理**: 現金・カード決済
5. **レシート発行**: 印刷・電子送信
6. **取引完了**: 在庫更新・売上記録

### ハードウェア連携
- **バーコードスキャナー**: USB/Bluetooth接続
- **レシートプリンター**: ESC/POS対応
- **キャッシュドロワー**: プリンター連動
- **カードリーダー**: Square Terminal連携

### エラーハンドリング
- 通信エラー時の取引保留
- プリンターエラー時の代替手段
- 決済エラー時のロールバック
- 在庫不足時の警告表示

---
*Frontend-Agent作成: 2025-01-24* 