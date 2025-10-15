# originalPack/CLAUDE.md

## 🎯 目的・役割

オリジナルパック（独自パック商品）の作成・管理・分解機能を提供するコンポーネント群。複数の商品をまとめてパック商品として販売し、必要に応じて分解（開封）する機能を担当。

## 🏗️ 技術構成
- **主要技術**: React, TypeScript, Material-UI
- **依存関係**: ../item/, ../products/, ../../api/
- **関連システム**: 在庫管理システム、商品マスタ管理

## 📁 ディレクトリ構造
```
originalPack/
├── CLAUDE.md
├── components/           # 基本パック操作コンポーネント
│   ├── OriginalPackDetailModal.tsx       # パック詳細モーダル
│   ├── OriginalPackPackProductList.tsx   # パック商品一覧
│   ├── OriginalPackSelectedPack.tsx      # 選択済みパック表示
│   └── OriginalPackTabTable.tsx          # パック管理テーブル
├── disassembly/          # パック分解（開封）機能
│   └── components/
│       ├── DetailCardBottomContent.tsx   # 詳細カード下部
│       ├── DetailCardContent.tsx         # 詳細カード内容
│       ├── OriginalPackDisassembly.tsx   # 分解メインコンポーネント
│       ├── OriginalPackDisassemblyConfirmation.tsx  # 分解確認
│       ├── OriginalPackDisassemblyProductList.tsx   # 分解商品一覧
│       ├── OriginalPackProductCardList.tsx          # 商品カード一覧
│       ├── OriginalPackProductCardListContent.tsx   # カード内容
│       ├── OriginalPackProductCardListFooter.tsx    # カードフッター
│       └── OriginalPackProductCardListHeader.tsx    # カードヘッダー
└── hooks/                # カスタムフック
    ├── useAddOriginalPack.tsx      # パック追加ロジック
    ├── useCreateOriginalPack.ts    # パック作成ロジック
    └── useOriginalPackProducts.ts  # パック商品管理ロジック
```

## 🔧 主要機能

### パック作成・管理
- 複数商品をまとめたオリジナルパック商品の作成
- パック商品の詳細情報表示・編集
- パック商品一覧の表示・管理

### パック分解（開封）
- パック商品の分解（個別商品への復元）
- 分解確認プロセスの管理
- 分解後の在庫状況の更新

### 商品管理連携
- 商品マスタとの連携
- 在庫数の自動調整
- 価格設定の管理

## 💡 使用パターン

### 基本的なパック作成フロー
```typescript
// パック作成フック
const { createOriginalPack, isLoading } = useCreateOriginalPack();

// パック商品追加
const { addOriginalPack } = useAddOriginalPack();

// パック分解
// DisassemblyコンポーネントでUI提供
```

### パック分解フロー
```typescript
// 分解確認 → 実行 → 在庫更新の流れ
<OriginalPackDisassemblyConfirmation />
<OriginalPackDisassembly />
```

## 🗺️ プロジェクト内での位置づけ

### データフロー
```
商品選択 → パック作成 → 在庫登録
       ↓
パック販売 → 顧客へ提供
       ↓
必要時分解 → 個別商品として在庫復元
```

### 他システムとの関係
- **商品管理** (`../products/`): パック構成商品の管理
- **在庫管理** (`../stock/`): 在庫数の調整
- **販売管理** (`../sale/`): パック商品の販売
- **API層** (`../../api/`): バックエンドとの通信

### 責務の境界
- **責務内**: パック商品のライフサイクル管理、分解処理
- **責務外**: 個別商品の詳細管理、価格計算ロジック

## 🔗 関連ディレクトリ
- [商品管理](../products/) - パック構成商品の詳細
- [在庫管理](../stock/) - 在庫数の同期
- [販売管理](../sale/) - パック商品の販売処理
- [商品検索](../item/) - パック構成商品の検索

## 📚 ドキュメント・リソース
- パック商品仕様書
- 在庫管理システム連携仕様
- 分解処理のビジネスルール

## 📝 開発メモ

### 設計思想
- パック商品と個別商品の明確な区別
- 分解時の整合性保証（在庫数、価格など）
- UIの直感性重視（複雑な操作の簡素化）

### 注意点
- 分解処理は不可逆操作のため、十分な確認が必要
- 在庫数の整合性チェックが重要
- パック商品の販売履歴との整合性維持

### ベストプラクティス
- 分解前の詳細確認画面は必須
- エラー処理の充実（在庫不足、データ不整合等）
- 操作ログの記録

### 将来の拡張計画
- 階層的パック商品（パックの中にパック）
- 分解履歴の追跡
- 自動分解ルールの設定

---
*Documentation-Agent作成: 2025-01-24*