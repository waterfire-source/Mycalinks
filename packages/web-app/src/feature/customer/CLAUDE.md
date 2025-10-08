# customer/CLAUDE.md

## 🎯 目的・役割

顧客管理とCRM機能の中核ドメイン。会員登録、顧客情報管理、購入履歴、ポイント管理、顧客検索を統合的に提供し、店舗の顧客関係管理を支援する。リピーター獲得と顧客満足度向上を目的とする。

## 🏗️ 技術構成

- **フレームワーク**: React 18 with TypeScript
- **状態管理**: React hooks、顧客データキャッシュ
- **フォーム**: React Hook Form + Zod validation
- **検索機能**: 顧客名、電話番号、メールでの高速検索
- **ポイント管理**: ポイント付与・利用・履歴管理
- **依存関係**: `/api/store/[store_id]/customer/`, ポイントシステムAPI

## 📁 ディレクトリ構造

```
customer/
├── components/                   # UI コンポーネント群
│   ├── CustomerCard.tsx         # 顧客情報カード
│   ├── CustomerSmallCard.tsx    # 顧客情報小カード
│   ├── CustomerSearchField.tsx  # 顧客検索フィールド
│   ├── CustomerMemoModal.tsx    # 顧客メモモーダル
│   ├── OpenMemoModalButton.tsx  # メモモーダル開閉ボタン
│   ├── EditPointButton.tsx      # ポイント編集ボタン
│   └── EditPointModal.tsx       # ポイント編集モーダル
├── hooks/
│   └── useCustomer.ts           # 顧客管理カスタムフック
└── utils.ts                    # ユーティリティ関数
```

## 🔧 主要機能

### 顧客情報管理
- **顧客CRUD**: 新規登録、情報更新、削除、詳細表示
- **基本情報**: 氏名、電話番号、メールアドレス、住所
- **属性情報**: 生年月日、性別、職業、趣味・嗜好
- **連絡先管理**: 複数連絡先、連絡可能時間帯

### 顧客検索・絞り込み
- **高速検索**: 氏名、電話番号、メールでの部分一致検索
- **属性絞り込み**: 年齢層、性別、地域での絞り込み
- **購入履歴検索**: 購入商品、購入時期での顧客抽出
- **ランク別表示**: 購入金額・頻度によるランク分け

### ポイント管理
- **ポイント付与**: 購入金額に応じた自動ポイント付与
- **ポイント利用**: 決済時のポイント利用
- **ポイント調整**: 手動でのポイント追加・減算
- **ポイント履歴**: ポイント獲得・利用履歴の詳細表示

### 顧客メモ・コミュニケーション
- **顧客メモ**: スタッフによる顧客情報メモ
- **接客履歴**: 来店履歴、対応スタッフ記録
- **アラート機能**: 重要顧客、要注意事項の表示
- **コミュニケーション履歴**: 電話・メール等の履歴管理

## 💡 使用パターン

### 顧客検索・選択
```typescript
// 顧客検索フィールド
<CustomerSearchField
  onCustomerSelect={handleCustomerSelect}
  placeholder="顧客名・電話番号で検索"
  showRecent={true}
/>

// 顧客管理フック
const {
  customers,
  searchCustomers,
  createCustomer,
  updateCustomer,
  loading,
  error,
} = useCustomer()
```

### 顧客情報表示
```typescript
// 顧客情報カード
<CustomerCard
  customer={selectedCustomer}
  onEdit={handleCustomerEdit}
  onMemoOpen={handleMemoOpen}
  showPurchaseHistory={true}
/>

// 顧客小カード（レジ等で使用）
<CustomerSmallCard
  customer={customer}
  showPoints={true}
  onClick={handleCustomerSelect}
/>
```

### ポイント管理
```typescript
// ポイント編集
<EditPointModal
  customer={customer}
  open={pointModalOpen}
  onClose={() => setPointModalOpen(false)}
  onPointUpdate={handlePointUpdate}
/>

// ポイント編集ボタン
<EditPointButton
  customer={customer}
  onEdit={() => setPointModalOpen(true)}
  disabled={!hasEditPermission}
/>
```

### 顧客メモ管理
```typescript
// 顧客メモモーダル
<CustomerMemoModal
  customer={customer}
  open={memoModalOpen}
  onClose={() => setMemoModalOpen(false)}
  onMemoSave={handleMemoSave}
/>
```

## 🔗 関連ディレクトリ

- [../transaction/](../transaction/) - 顧客取引履歴
- [../sale/](../sale/) - 売上時の顧客選択
- [../purchase/](../purchase/) - 買取時の顧客登録
- [../../app/auth/(dashboard)/customers/](../../app/auth/(dashboard)/customers/) - 顧客管理画面
- [../../components/modals/](../../components/modals/) - 顧客関連モーダル
- [../../api/backendApi/services/customer/](../../api/backendApi/services/customer/) - 顧客API

## 📝 開発メモ

### データモデル
- **Customer**: 顧客基本情報テーブル
- **CustomerMemo**: 顧客メモテーブル
- **CustomerPoint**: ポイント履歴テーブル
- **CustomerVisit**: 来店履歴テーブル

### 顧客ランク管理
```typescript
// 顧客ランク定義
enum CustomerRank {
  BRONZE = 'bronze',    // 新規・一般顧客
  SILVER = 'silver',    // 月1回以上来店
  GOLD = 'gold',        // 月3回以上来店
  PLATINUM = 'platinum' // VIP顧客
}
```

### ポイントシステム
- **付与率**: 購入金額の1-5%（ランクにより変動）
- **有効期限**: ポイント取得から1年間
- **最小利用単位**: 1ポイント = 1円
- **上限制限**: 1回の利用でポイント利用上限あり

### プライバシー・セキュリティ
- **個人情報保護**: 顧客データの暗号化保存
- **アクセス制御**: スタッフ権限による顧客情報アクセス制限
- **削除ポリシー**: 長期未来店顧客の自動削除
- **監査ログ**: 顧客情報アクセス・変更ログの記録

### 顧客体験向上
- **来店履歴**: 最終来店日、来店頻度の表示
- **購入傾向**: よく購入するジャンル・価格帯の分析
- **おすすめ機能**: 購入履歴に基づく商品推奨
- **誕生日特典**: 誕生月の特別割引・ポイント付与

### パフォーマンス最適化
- **検索インデックス**: 氏名、電話番号での高速検索
- **キャッシュ戦略**: 頻繁にアクセスされる顧客データのキャッシュ
- **ページング**: 大量顧客データの効率的表示
- **非同期処理**: 顧客データ更新の非同期処理

---
*Frontend-Agent作成: 2025-01-13*