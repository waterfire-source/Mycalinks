# packages/web-app/src/app/auth/CLAUDE.md

## 🎯 目的・役割

認証後のPOSシステム全機能を提供するNext.js App Routerのメインエリア。販売・買取・在庫管理・EC統合・顧客管理など、小売店舗運営に必要な全ての業務機能へのアクセスポイントを集約。

## 🏗️ 技術構成

- **フレームワーク**: Next.js 14 App Router
- **認証**: NextAuth.js (セッション管理)
- **UI**: Material-UI + レスポンシブデザイン
- **状態管理**: React Context API
- **アクセス制御**: モード別機能制限 (sales/admin)
- **依存関係**: 認証ミドルウェア、各種Contextプロバイダー

## 📁 ディレクトリ構造

```
auth/
├── (dashboard)/               # メインアプリケーション機能
│   ├── layout.tsx            # グローバルレイアウト (ヘッダー・サイドバー)
│   ├── page.tsx              # ダッシュボード
│   ├── sale/                 # 販売機能
│   ├── purchase/             # 買取機能
│   ├── purchaseReception/    # 買取受付
│   ├── purchaseTable/        # 買取テーブル
│   ├── transaction/          # 取引履歴
│   ├── item/                 # 商品マスタ
│   ├── stock/                # 在庫管理
│   ├── inventory-count/      # 棚卸し
│   ├── customers/            # 顧客管理
│   ├── register/             # レジ管理
│   ├── ec/                   # EC機能
│   │   ├── order/           # 注文管理
│   │   ├── item/            # EC商品
│   │   └── stock/           # EC在庫
│   ├── sales-analytics/      # 売上分析
│   ├── original-pack/        # オリパ管理
│   ├── settings/             # 設定
│   └── components/           # 共通コンポーネント
├── setup/                     # 初期設定ウィザード
│   ├── mode/                 # モード選択
│   ├── corporation/          # 企業設定
│   └── store/                # 店舗設定
└── test/                      # テストページ
```

## 🔧 主要機能

### 販売・取引管理
- **sale**: 商品販売、バーコードスキャン、決済処理
- **purchase**: 買取査定、価格交渉、買取処理
- **purchaseReception**: 買取受付管理
- **purchaseTable**: トレカ買取価格テーブル
- **transaction**: 取引履歴検索・詳細表示

### 在庫・商品管理
- **item**: 商品マスタ登録・編集・検索
- **stock**: 在庫照会、移動、ロス処理
- **inventory-count**: 棚卸し作業、差異確認
- **original-pack**: オリジナルパック作成・管理

### EC統合
- **ec/order**: 注文一覧、処理状況管理
- **ec/item**: EC商品登録、価格設定
- **ec/stock**: EC在庫管理、同期設定
- **ec/picking**: ピッキングリスト

### 顧客・レジ管理
- **customers**: 顧客情報、ポイント、購入履歴
- **register**: レジ開局/閉局、現金管理

### 分析・設定
- **sales-analytics**: 売上推移、商品別分析
- **settings**: 店舗、アカウント、権限、印刷設定

## 💡 使用パターン

### 認証チェック
```typescript
// middleware.tsで自動的に認証チェック
// 未認証の場合は/loginへリダイレクト
```

### モード別アクセス制御
```typescript
// salesモード: 販売関連機能のみ
// adminモード: 全機能アクセス可能
const { data: session } = useSession();
if (session?.user.mode === 'admin') {
  // 管理者限定機能を表示
}
```

### Context利用
```typescript
// レイアウトで提供される各種Context
const { currentStore } = useStore();
const { currentRegister } = useRegister();
const { showAlert } = useAlert();
```

### レスポンシブ対応
```typescript
// デスクトップ/モバイルで異なるコンポーネント
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
return isMobile ? <MobileHeader /> : <DesktopHeader />;
```

## 🔗 関連ディレクトリ

- [フロントエンドルート](../CLAUDE.md)
- [Feature実装詳細](../../feature/CLAUDE.md)
- [API統合](../../api/backendApi/CLAUDE.md)
- [共通コンポーネント](../../components/CLAUDE.md)
- [認証設定](../api/auth/CLAUDE.md)

## 📝 開発メモ

### アクセス制御
- **salesモード**: 売上、在庫照会、顧客管理のみ
- **adminモード**: 設定変更、マスタ編集含む全機能
- **店舗/レジ選択**: salesモードでは必須

### パフォーマンス最適化
- 大量データはページネーション実装
- 画像は遅延読み込み
- 不要な再レンダリング防止

### エラーハンドリング
- APIエラーはAlertContextで統一表示
- フォームバリデーションはZod使用
- ネットワークエラーは再試行機能付き

### 開発時の注意
- 新機能追加時はサイドバーメニューも更新
- モバイル対応を考慮したレイアウト設計
- Context追加時はlayout.tsxでラップ
- 権限チェックを適切に実装

---
*Frontend-Agent作成: 2025-01-24*