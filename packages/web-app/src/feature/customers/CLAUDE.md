# customers/CLAUDE.md

## 🎯 目的・役割

顧客（Customer）ドメインに関する機能を提供するフィーチャーモジュール。顧客情報の表示、取引履歴の確認、来店情報の管理など、店舗スタッフが顧客対応時に必要とする情報を統合的に表示・管理するUIコンポーネント群を提供する。

## 🏗️ 技術構成

- **UIフレームワーク**: React 18 + TypeScript  
- **コンポーネントライブラリ**: Material-UI (MUI)
- **状態管理**: React Context / Props
- **スタイリング**: Emotion (MUI統合)
- **データ表示**: カード・テーブル形式

## 📁 ディレクトリ構造

```
customers/
└── components/              # 顧客関連UIコンポーネント
    ├── CustomerBasicInformation.tsx      # 基本情報表示
    ├── CustomerDetail.tsx                # 詳細情報統合表示
    ├── CustomerDetailPaper.tsx           # 詳細情報カード
    ├── CustomerMemoInformation.tsx       # メモ情報管理
    ├── CustomerTransactionInformation.tsx # 取引履歴表示
    └── CustomerVisitInformation.tsx      # 来店履歴表示
```

## 🔧 主要機能

### 顧客情報表示
- **CustomerBasicInformation**: 顧客基本情報（氏名、連絡先、会員情報）の表示
- **CustomerDetail**: 顧客情報の統合ビュー（全情報の集約表示）
- **CustomerDetailPaper**: Material-UI Paper を使用した顧客情報カード

### 取引・来店履歴
- **CustomerTransactionInformation**: 購入・買取履歴の時系列表示
- **CustomerVisitInformation**: 来店履歴・頻度分析の表示

### 顧客メモ機能
- **CustomerMemoInformation**: スタッフ間共有メモの表示・編集
- 接客時の注意事項・申し送り事項の管理

## 💡 使用パターン

### 顧客詳細画面の構成例
```typescript
// 顧客詳細ページでの統合表示
<CustomerDetail customerId={customerId}>
  <CustomerBasicInformation />
  <CustomerTransactionInformation />
  <CustomerVisitInformation />
  <CustomerMemoInformation />
</CustomerDetail>
```

### 顧客検索からの遷移
```typescript
// 顧客検索結果からの詳細表示
<CustomerDetailPaper 
  customer={selectedCustomer}
  onEdit={handleEdit}
  onViewTransactions={handleViewTransactions}
/>
```

## 🗺️ プロジェクト内での位置づけ

### 関連機能との連携
- **Transaction（取引）**: 販売・買取時の顧客紐付け
- **Sale（販売）**: 顧客別売上分析
- **Purchase（買取）**: 顧客別買取履歴
- **Point System**: ポイント残高・履歴管理

### 情報フロー
```
[顧客検索] → [顧客選択] → [詳細表示]
                ↓
        [取引履歴] [来店履歴]
                ↓
          [ポイント管理]
```

## 🔗 関連ディレクトリ

- [../customer/](../customer/) - 顧客データ管理ロジック
- [../sale/](../sale/) - 販売時の顧客連携
- [../purchase/](../purchase/) - 買取時の顧客連携
- [../transaction/](../transaction/) - 取引履歴管理
- [../../components/](../../components/) - 共通UIコンポーネント

## 📚 ドキュメント・リソース

### データ仕様
- 顧客ID形式: `CST-{storeId}-{sequence}`
- 会員ランク: 一般/シルバー/ゴールド/プラチナ
- ポイント有効期限: 最終利用日から1年間

### プライバシー考慮事項
- 個人情報の表示制限（権限による）
- 顧客情報の暗号化保存
- アクセスログの記録

## 📝 開発メモ

### UI/UX設計方針
- 接客中の素早い情報確認を重視
- タブ切り替えによる情報の整理
- 重要情報（アレルギー、注意事項）の強調表示

### パフォーマンス最適化
- 取引履歴の遅延読み込み
- 無限スクロールによる履歴表示
- 顧客情報のキャッシュ活用

### ビジネスルール
- 顧客情報の編集は管理者権限必須
- ポイント付与は取引完了時に自動実行
- 顧客統合・分離機能（重複管理）

### 将来の拡張計画
- 顧客セグメント分析機能
- AIによる購買予測
- LINE/メール連携機能
- 顧客満足度管理

---
*Documentation-Agent作成: 2025-01-24*