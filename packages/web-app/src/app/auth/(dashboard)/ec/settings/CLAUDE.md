# EC詳細設定管理

## 目的

ECサイトの詳細設定を管理するページ（出品・配送・支払い・条件紐づけ設定）

## 実装されている機能

### メインページ (page.tsx - 195行)

- **設定管理**: 4つの設定カテゴリの統合管理
- **編集モード**: 設定変更の可否制御
- **開店機能**: EC開店・閉店の制御
- **利用規約**: 初回開店時の利用規約確認

### 設定カテゴリ

1. **出品設定 (SaleSettings)**: 自動出品・価格調整・在庫管理
2. **配送設定 (DeliverySettings)**: 配送方法・送料・配送日設定
3. **支払い設定 (PaymentMethodSettings)**: 支払い方法の設定
4. **条件紐づけ設定 (ConditionBindingSettings)**: 商品状態の紐づけ

## ファイル構成

```
settings/
├── page.tsx              # メイン設定ページ（195行）
└── delivery/             # 配送設定詳細
```

## 技術実装詳細

### 設定データ構造

```typescript
export interface ECSettingProps {
  autoListing?: boolean;                    // 自動出品
  autoStocking?: boolean;                   // 自動補充
  autoSellPriceAdjustment?: number;         // 価格調整率（%）
  priceAdjustmentRoundRank?: number;        // 端数処理単位
  priceAdjustmentRoundRule?: RoundRule;     // 端数処理ルール
  reservedStockNumber?: number;             // 店頭在庫数
  enableSameDayShipping?: boolean;          // 当日発送
  sameDayLimitHour?: number | null;         // 当日発送締切時間
  shippingDays?: number | null;             // 発送日数
  closedDay?: string;                       // 定休日
  freeShippingPrice?: number | null;        // 送料無料金額
  delayedPaymentMethod?: string;            // 後払い方法
}
```

### 出品設定詳細

```typescript
// 価格調整の端数処理計算
const roundResult = (price: number) => {
  if (!ECSettings?.priceAdjustmentRoundRank) return price;
  switch (ECSettings?.priceAdjustmentRoundRule) {
    case RoundRule.UP:      // 切り上げ
      return Math.ceil(price / ECSettings.priceAdjustmentRoundRank) * 
             ECSettings.priceAdjustmentRoundRank;
    case RoundRule.DOWN:    // 切り捨て
      return Math.floor(price / ECSettings.priceAdjustmentRoundRank) * 
             ECSettings.priceAdjustmentRoundRank;
    case RoundRule.ROUND:   // 四捨五入
      return Math.round(price / ECSettings.priceAdjustmentRoundRank) * 
             ECSettings.priceAdjustmentRoundRank;
  }
};

// 端数処理の選択肢
- 1の位（10）
- 10の位（100）
- 100の位（1000）

// 処理ルール
- 切り上げ（UP）
- 切り捨て（DOWN）
- 四捨五入（ROUND）
```

### 開店・閉店機能

```typescript
// 開店ボタンの処理
const handleClickOpenButton = () => {
  if (!store.mycalinks_ec_terms_accepted) {
    setIsTermsOfUseModalOpen(true);      // 利用規約モーダル
  } else {
    setIsOpenCloseAlertModalOpen(true);  // 開店確認モーダル
  }
};

// 状態による表示切り替え
{store.mycalinks_ec_enabled ? (
  <SecondaryButton onClick={() => setIsOpenCloseAlertModalOpen(true)}>
    MycalinksMALLの全出品を取り下げる
  </SecondaryButton>
) : (
  <PrimaryButton onClick={handleClickOpenButton}>
    開店する
  </PrimaryButton>
)}
```

### 設定更新処理

```typescript
// 設定更新API呼び出し
const updateECSettings = async () => {
  const res = await clientAPI.store.updateEcSetting({
    storeId: store.id,
    EcSetting: ECSettings,
  });
  
  if (res instanceof CustomError) {
    setAlertState({
      message: `${res.status}:${res.message}`,
      severity: 'error',
    });
  } else {
    setAlertState({
      message: 'EC設定を更新しました',
      severity: 'success',
    });
    setIsEditable(false);
  }
};
```

## 主要コンポーネント

### SaleSettings (227行)

- **自動出品**: 有効/無効の切り替え
- **自動補充**: 有効/無効の切り替え
- **出品価格**: POS価格に対する調整率（%）
- **端数処理**: 処理単位とルールの設定
- **店頭在庫数**: 店頭確保在庫数の設定

### DeliverySettings (190行)

- **配送方法**: 配送方法の設定
- **送料設定**: 送料無料金額の設定
- **配送日設定**: 発送日数・当日発送設定
- **定休日設定**: 定休日の設定

### PaymentMethodSettings (134行)

- **支払い方法**: 利用可能な支払い方法の設定
- **後払い設定**: 後払い方法の設定

### ConditionBindingSettings (180行)

- **商品状態紐づけ**: 商品状態の紐づけ設定

## モーダル機能

- **TermsOfUseModal**: 利用規約確認モーダル
- **OpenCloseAlertModal**: 開店・閉店確認モーダル

## 使用パターン

1. **初回設定**: 開店前の各種設定
2. **設定変更**: 「設定を変更」→各項目編集→「変更を保存」
3. **開店処理**: 利用規約確認→開店確認→EC開始
4. **閉店処理**: 「MycalinksMALLの全出品を取り下げる」→確認→EC停止

## 関連ディレクトリ

- `/feature/ec/setting/components/`: 設定関連コンポーネント
- `delivery/`: 配送設定詳細
- `../external/`: 外部EC連携設定
- `../stock/`: 在庫管理設定

## 開発ノート

- **Prisma連携**: RoundRule enumによる型安全な端数処理
- **状態管理**: 編集モードの制御
- **バリデーション**: 設定値の妥当性チェック
- **利用規約**: 初回開店時の規約確認必須
- **リアルタイム計算**: 端数処理結果のプレビュー表示
