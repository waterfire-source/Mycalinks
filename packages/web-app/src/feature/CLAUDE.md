# packages/web-app/src/feature/CLAUDE.md

## 🎯 目的・役割

ドメイン駆動設計に基づくフィーチャー別コンポーネント群。POSシステムの各業務機能を独立したモジュールとして実装し、再利用性と保守性を確保。各ドメインは専用のコンポーネント、フック、ユーティリティを含む自己完結型構造。

## 🏗️ 技術構成

- **アーキテクチャ**: Feature-Driven Design
- **UIフレームワーク**: React + Material-UI
- **状態管理**: カスタムフック + Context API
- **API統合**: createClientAPI経由の型安全な通信
- **フォーム**: React Hook Form + Zod
- **依存関係**: 各ドメイン独立、共通Contextで連携

## 📁 ディレクトリ構造

```
feature/
├── sale/                 # 販売機能
├── purchase/             # 買取機能
├── purchaseReception/    # 買取受付
├── purchaseTable/        # 買取価格テーブル
├── transaction/          # 取引管理
├── products/             # 商品管理
├── item/                 # 商品マスタ
├── stock/                # 在庫管理
├── inventory/            # 棚卸し
├── customer/             # 顧客管理（個別）
├── customers/            # 顧客管理（一覧）
├── register/             # レジ管理
├── cash/                 # 現金管理
├── ec/                   # EC統合
│   ├── order/           # 注文管理
│   ├── item/            # EC商品
│   └── settings/        # EC設定
├── settings/             # 各種設定
├── store/                # 店舗管理
├── corporation/          # 企業管理
├── dashboard/            # ダッシュボード
├── analytics/            # 分析機能
├── print/                # 印刷機能
├── barcode/              # バーコード
├── originalPack/         # オリパ
├── psa/                  # PSA鑑定
├── reservation/          # 予約管理
├── arrival/              # 入荷管理
├── contract/             # 契約管理
├── advertisement/        # 広告管理
├── auth/                 # 認証関連
├── template/             # テンプレート
├── task/                 # タスク管理
├── memo/                 # メモ機能
├── log/                  # ログ表示
├── setup/                # 初期設定
├── csv/                  # CSV処理
├── upload/               # ファイルアップロード
├── account/              # アカウント
├── authority/            # 権限管理
├── genre/                # ジャンル管理
├── category/             # カテゴリ管理
├── condition/            # コンディション
├── report/               # レポート
├── launch/               # システム起動
└── myca/                 # Myca連携
```

## 🔧 主要機能

### 販売・買取系
- **sale**: カート管理、バーコードスキャン、決済処理
- **purchase**: 査定、価格交渉、買取完了処理
- **purchaseReception**: 受付票作成、ステータス管理
- **purchaseTable**: トレカ価格設定、一括更新

### 在庫・商品系
- **products**: 在庫検索、詳細表示、編集
- **item**: 商品マスタCRUD、カテゴリ管理
- **stock**: 在庫移動、ロス処理、履歴
- **inventory**: 棚卸し計画、実績入力、差異確認

### 顧客・取引系
- **customer/customers**: 顧客情報、ポイント、履歴
- **transaction**: 取引検索、詳細、返品処理
- **register**: レジ開閉、現金管理、売上集計
- **reservation**: 予約受付、ステータス管理

### EC・外部連携
- **ec/order**: 注文処理、発送管理
- **ec/item**: 商品登録、在庫同期
- **myca**: アプリ連携、ポイント交換

### 管理・設定系
- **settings**: 店舗、印刷、決済設定
- **authority**: ロール管理、権限付与
- **corporation/store**: 組織階層管理

## 💡 使用パターン

### 標準的なフィーチャー構造
```
feature/
└── {domain}/
    ├── components/        # UIコンポーネント
    │   ├── cards/        # カード型UI
    │   ├── modals/       # モーダル
    │   └── tables/       # テーブル
    ├── hooks/            # カスタムフック
    │   ├── use{Domain}.ts      # 基本CRUD
    │   └── use{Domain}*.ts     # 特化機能
    ├── types/            # 型定義
    └── utils/            # ユーティリティ
```

### フック使用例
```typescript
// 商品検索と詳細取得
import { useProducts } from '@/feature/products/hooks';

const { 
  products, 
  loading, 
  searchProducts,
  getProductDetail 
} = useProducts();
```

### コンポーネント使用例
```tsx
// 販売カート利用
import { SaleCart } from '@/feature/sale/components';
import { useSaleCart } from '@/feature/sale/hooks';

function SalePage() {
  const cart = useSaleCart();
  return <SaleCart {...cart} />;
}
```

### ドメイン間連携
```typescript
// 商品 → 在庫 → 販売の連携
const { addToCart } = useSaleCart();
const { checkStock } = useStock();

const handleAddProduct = async (productId: number) => {
  const hasStock = await checkStock(productId);
  if (hasStock) {
    await addToCart(productId);
  }
};
```

## 🔗 関連ディレクトリ

- [アプリケーションページ](../app/auth/CLAUDE.md)
- [共通コンポーネント](../components/CLAUDE.md)
- [APIクライアント](../api/backendApi/CLAUDE.md)
- [グローバルフック](../hooks/CLAUDE.md)
- [型定義](../types/CLAUDE.md)

## 📝 開発メモ

### ベストプラクティス
- **独立性**: 各フィーチャーは他に依存しない設計
- **再利用性**: 共通ロジックはhooksに集約
- **型安全性**: 全てのAPIレスポンスに型定義
- **テスタビリティ**: フックとUIを分離

### 命名規則
- **フック**: `use{Domain}{Action}` (例: useProductSearch)
- **コンポーネント**: `{Domain}{Component}` (例: ProductCard)
- **型**: `{Domain}{Type}` (例: ProductSearchParams)

### パフォーマンス考慮
- 大量データは仮想スクロール使用
- 画像は遅延読み込み
- メモ化で不要な再レンダリング防止

### 新規フィーチャー追加時
1. `/feature/{domain}/` ディレクトリ作成
2. 標準構造（components, hooks, types）準備
3. 基本CRUDフック実装
4. UIコンポーネント作成
5. ページから利用

---
*Frontend-Agent作成: 2025-01-24*