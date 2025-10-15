# packages/web-app/src/app/auth/(dashboard)/ec/CLAUDE.md

## 🎯 目的・役割

店舗側EC管理システム統括ディレクトリ - 店舗スタッフがECサイトの注文処理・在庫管理・商品出品・外部EC連携を行うための包括的な管理画面システム。

## 🏗️ 技術構成

- **フレームワーク**: Next.js 14 (App Router) + TypeScript
- **認証**: ダッシュボード内配置（店舗スタッフ専用）
- **UI**: Material-UI 5.15.15 + MUI-X DataGrid
- **主要技術**: 
  - MUI-X DataGrid（日本語対応）
  - リアルタイム注文管理
  - スキャン機能統合
  - ステータス管理システム
  - モックデータ対応（TODO: API連携）
- **依存関係**: 
  - ShippingStatusToggle（配送状況管理）
  - ScanToggle（スキャン機能）
  - OrderActionButtons（注文操作）
  - ContainerLayout（共通レイアウト）

## 📁 ディレクトリ構造

```
packages/web-app/src/app/auth/(dashboard)/ec/
├── page.tsx                    # メイン管理画面（168行）
├── external/                   # 外部EC連携（おちゃのこネット等）
│   ├── page.tsx               # 連携管理ページ（167行）
│   └── components/            # 連携コンポーネント
├── inquiry/                    # 顧客問い合わせ管理
│   └── page.tsx               # 問い合わせ管理（71行）
├── list/                       # 注文一覧管理
│   ├── page.tsx               # 注文一覧ページ（13行）
│   ├── components/            # 注文管理コンポーネント
│   └── hooks/                 # 注文操作フック
├── picking/                    # ピッキング・梱包管理
│   └── page.tsx               # ピッキングチェックリスト（275行）
├── settings/                   # EC設定・配送設定
│   ├── page.tsx               # EC詳細設定（195行）
│   └── delivery/              # 配送設定詳細
├── stock/                      # 在庫管理・商品出品
│   ├── page.tsx               # 在庫管理ページ（8行）
│   └── components/            # 在庫管理コンポーネント
└── transaction/                # 取引・注文詳細管理
    ├── page.tsx               # 取引管理ページ（7行）
    ├── components/            # 取引管理コンポーネント
    └── product/               # 商品別売上管理
```

## 🔧 主要機能

### 1. 注文管理（メイン画面）
- **DataGrid表示**: MUI-X DataGrid による高性能な注文一覧表示
- **ステータス管理**: 全て・未処理・処理中・発送準備・発送済みの5段階管理
- **注文操作**: OrderActionButtons による注文詳細・発送準備・ピッキング指示
- **スキャン機能**: ScanToggle による バーコード/QRコード スキャン対応
- **リアルタイム更新**: ステータス変更時の自動データ更新

### 2. 外部EC連携
- **おちゃのこネット連携**: 167行の連携管理ページ
- **認証情報管理**: アカウントID・メールアドレス・APIキーの安全な管理
- **連携状況表示**: 現在の連携状況・再連携機能
- **セキュリティ**: APIキーの下4桁のみ表示（********XXXX形式）

### 3. 問い合わせ管理
- **問い合わせ一覧**: InquiryContent による一覧表示
- **詳細モーダル**: InquiryModal による個別対応
- **検索・フィルタ**: useInquirySearch による効率的な検索
- **ステータス管理**: 未読・対応中・完了の3段階管理

### 4. ピッキング管理
- **チェックリスト**: 275行の高度なピッキング支援システム
- **商品情報表示**: 画像・商品名・型番・レアリティ・状態・価格
- **スキャン機能**: 行クリック・数量入力によるピッキング確認
- **進捗管理**: スキャン数/必要数の可視化

### 5. 在庫・商品管理
- **商品出品**: 新規商品の外部EC出品
- **在庫同期**: 店舗在庫とECサイト在庫の同期
- **価格管理**: 動的価格設定・一括更新
- **モーダル管理**: 新規出品・詳細編集・取り消しモーダル

### 6. 設定管理
- **EC詳細設定**: 195行の包括的な設定管理
- **4つの設定カテゴリ**: 出品・配送・支払い・条件紐づけ設定
- **開店機能**: EC開店・閉店の制御
- **配送設定**: 72行の配送方法・料金詳細設定

## 💡 使用パターン

### 基本的な注文処理フロー
```typescript
// 1. 注文一覧確認
ステータス別フィルタ → 注文選択 → 詳細確認

// 2. ピッキング処理
ピッキングページ → 商品スキャン → 数量確認 → 完了

// 3. 発送処理
発送準備 → 配送方法選択 → 発送完了

// 4. 顧客対応
問い合わせ確認 → 詳細モーダル → 回答・ステータス更新
```

### 商品出品フロー
```typescript
// 1. 商品登録
在庫管理 → 新規出品モーダル → 商品選択 → 価格設定

// 2. 外部EC連携
外部EC設定 → プラットフォーム選択 → 認証情報設定

// 3. 自動同期
在庫同期 → 価格更新 → 出品状況確認
```

## 🎨 UI/UX設計

### メイン画面の特徴
- **ContainerLayout**: 統一されたレイアウト「EC・フリマ」
- **2段階レイアウト**: 上部フィルタ・下部DataGrid
- **日本語対応**: jaJP.components.MuiDataGrid.defaultProps.localeText
- **カスタムスタイル**: グレーヘッダー・白背景の統一デザイン

### 状態管理システム
```typescript
// 主要な状態
const [status, setStatus] = useState<StatusKey>('all');
const [orders, setOrders] = useState<OrderData[]>([]);
const [loading, setLoading] = useState(true);
const [scanEnabled, setScanEnabled] = useState(false);

// ステータス管理
type StatusKey = 'all' | 'unprocessed' | 'processing' | 'ready' | 'shipped';
```

### DataGrid設定
```typescript
// DataGrid設定
<DataGrid
  rows={orders}
  columns={columns}
  initialState={{
    pagination: {
      paginationModel: { page: 0, pageSize: 50 },
    },
  }}
  pageSizeOptions={[50]}
  disableRowSelectionOnClick
  loading={loading}
  localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
/>
```

## 🔗 API統合

### 現在の実装状況
```typescript
// モックデータ使用中
const filteredOrders = status === 'all'
  ? mockOrders
  : mockOrders.filter((order) => {
      return order.status === STATUS_MAP[status];
    });

// TODO: 実際のAPI連携実装
// - fetchOrders(): 注文データ取得
// - updateOrderStatus(): 注文ステータス更新
// - fetchInventory(): 在庫データ取得
```

### 外部EC連携API
```typescript
// おちゃのこネット連携
const updateOchanokoEcSetting = async (data: OchanokoFormData) => {
  const res = await clientAPI.store.updateOchanokoEcSetting({
    storeId: store.id,
    ...data,
  });
  return res;
};
```

## 🚀 パフォーマンス最適化

### DataGrid最適化
- **ページネーション**: 50件ずつ表示
- **仮想化**: MUI-X DataGrid による効率的なレンダリング
- **条件付きレンダリング**: ステータス変更時のみデータ更新
- **ローディング状態**: 適切なローディング表示

### 状態管理効率化
- **useEffect依存関係**: ステータス変更時のみ実行
- **モックデータ**: 開発段階での効率的なテスト
- **コンポーネント分離**: 機能別の明確な責務分離

## 🔗 関連ディレクトリ

- [../../ec/](../../ec/) - お客さん向けECサイト
- [../../../api/store/[store_id]/ec/](../../../api/store/[store_id]/ec/) - EC関連API
- [../../../feature/ec/](../../../feature/ec/) - EC機能コンポーネント
- [../../../contexts/](../../../contexts/) - React Context（認証・状態管理）
- [../../../components/layouts/](../../../components/layouts/) - 共通レイアウト

## 📝 開発メモ

### 実装の特徴
- **168行のメイン画面**: 注文管理・状態管理・UI制御の統合
- **8つのサブディレクトリ**: 機能別の明確な分離
- **モックデータ対応**: 開発段階での効率的なテスト環境
- **日本語対応**: 完全な日本語UI・エラーメッセージ

### 技術的工夫
- **ShippingStatusToggle**: 配送状況の視覚的な管理
- **ScanToggle**: スキャン機能の統合制御
- **OrderActionButtons**: 注文操作の統一的な管理
- **ContainerLayout**: 一貫したレイアウト設計

### 現在の課題・TODO
- **API連携**: モックデータから実際のAPI連携への移行
- **スキャン機能**: ハードウェア連携の検討
- **リアルタイム更新**: WebSocket・SSE による即時更新
- **パフォーマンス**: 大量注文データの効率的な処理

### 将来の拡張計画
- **多言語対応**: 英語・中国語等の国際化
- **モバイル対応**: レスポンシブデザインの強化
- **分析機能**: 売上・在庫分析ダッシュボード
- **自動化**: AI による注文処理自動化

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 