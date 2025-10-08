# Register Management - レジ管理

## 概要
レジの開け締め、点検、精算処理を行う機能群。店舗の現金管理とレジ操作の中核機能。

## 主な機能
- **レジ開け** - 営業開始時の釣銭準備金設定
- **レジ締め** - 営業終了時の現金精算
- **レジ点検** - 現金の実査と差異確認
- **点検履歴** - 過去の点検記録確認
- **レシート印刷** - 開け/締め精算レシート

## ディレクトリ構成
```
register/
├── open/         # レジ開け処理
│   └── page.tsx
├── close/        # レジ締め処理
│   ├── page.tsx
│   └── components/
├── check/        # レジ点検
│   └── page.tsx
├── checkHistory/ # 点検履歴
│   └── page.tsx
└── components/   # 共通コンポーネント
```

## 技術仕様

### レジ管理モード
1. **一括管理** - 全レジを統一管理
2. **個別管理** - レジごとに独立管理

### 点検タイミング設定
- `BEFORE_OPEN` - 開店前のみ
- `BEFORE_CLOSE` - 閉店前のみ
- `BOTH` - 開店前・閉店前両方
- `MANUAL` - 手動実施

### データ構造
```typescript
interface Register {
  id: number;
  display_name: string;
  status: RegisterStatus; // OPEN | CLOSED
  total_cash_price: number;
  cash_reset_price: number;
}

interface RegisterSettlement {
  id: number;
  register_id: number;
  settlement_kind: RegisterSettlementKind; // OPEN | CLOSE
  drawer_contents: DrawerContent[];
  input_cash_total: number;
}
```

## レジ開け処理（open/page.tsx）

### 処理フロー
1. レジ状態確認
2. 点検実施判定
3. 現金カウント（点検ありの場合）
4. 釣銭準備金設定
5. レジ開け実行
6. レシート印刷

### 主要機能
- 金種別現金入力
- 過不足自動計算
- リセット処理
- 開店連動

## レジ締め処理（close/page.tsx）

### 処理フロー
1. 営業集計取得
2. 現金実査（点検ありの場合）
3. 過不足確認
4. 翌日準備金設定
5. レジ締め実行
6. 精算レシート印刷

### 特殊処理
- 最後のレジ判定 → 自動閉店
- 一括締め処理
- 現金リセット機能

## 共通コンポーネント

### CenteredCard
メッセージ表示用の中央配置カード

### RegisterSummaryCard
レジ会計内訳の表示カード
- 現金売上/買取
- クレジット売上
- 電子マネー売上
- その他決済

## フック・ユーティリティ

### useRegisterCash
現金変更処理
```typescript
changeRegisterCash(
  storeId: number,
  registerId: number,
  kind: ChangeRegisterKind,
  amount?: number,
  resetAmount?: number
)
```

### useRegisterSettlement
レジ精算登録
```typescript
createRegisterSettlement(
  storeId: number,
  registerId: number,
  inputCashTotal: number,
  kind: RegisterSettlementKind,
  drawerContents: DrawerContent[]
)
```

## EPOSプリンター連携
```typescript
ePosDev.printWithCommand(receiptCommand);
```

## エラーハンドリング
- レジ未設定時の警告表示
- 二重操作防止（isProcessing）
- API失敗時のアラート表示

## 注意事項
- レジアカウントでのログインが必須
- 開け/締めの二重実行は不可
- 現金差異は自動記録される
- 一括管理時は全レジに影響

## 関連リンク
- [販売処理](/auth/(dashboard)/sale/)
- [現金管理](/auth/(dashboard)/cash/)
- [設定 - レジ設定](/auth/(dashboard)/settings/cash-register/)
- [取引管理](/auth/(dashboard)/transaction/)