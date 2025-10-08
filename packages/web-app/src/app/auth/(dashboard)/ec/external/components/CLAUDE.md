# 外部EC連携コンポーネント - おちゃのこネット統合

## 🎯 目的・役割

外部ECプラットフォーム「おちゃのこネット」との連携設定を行うための専用モーダルコンポーネント。API認証情報の設定、連携処理、エラーハンドリングを統合的に管理する。

## 🏗️ 技術構成

- **フレームワーク**: React + TypeScript
- **UI**: Material-UI 5.15.15
- **フォーム管理**: useState による状態管理
- **API統合**: createClientAPI経由の型安全な通信
- **エラーハンドリング**: AlertContext による統一的な通知
- **依存関係**: 
  - CustomModalWithIcon（共通モーダル）
  - useStore（店舗コンテキスト）
  - useAlert（アラート管理）

## 📁 ディレクトリ構造

```
packages/web-app/src/app/auth/(dashboard)/ec/external/components/
├── CLAUDE.md                           # 本ドキュメント
└── OchanokoIntegrationModal.tsx        # おちゃのこネット連携モーダル（249行）
```

## 🔧 主要機能

### OchanokoIntegrationModal.tsx（249行）
- **連携設定フォーム**: 4つの必須認証情報入力
  - おちゃのこネットアカウントID
  - 登録済みメールアドレス
  - APIキー
  - ログインパスワード（表示/非表示切り替え）
- **バリデーション**: 全項目必須チェック
- **API連携**: `updateOchanokoEcSetting` APIによる設定保存
- **エラーハンドリング**: CustomError対応、詳細エラーメッセージ
- **UI制御**: 送信中ローディング、成功時モーダル閉じ

## 💡 技術的実装

### フォーム状態管理
```typescript
interface OchanokoFormData {
  ochanokoEmail: string;
  ochanokoAccountId: string;
  ochanokoPassword: string;
  ochanokoApiToken: string;
}
```

### API連携処理
```typescript
const res = await clientAPI.store.updateOchanokoEcSetting({
  storeId: store.id,
  EcSetting: formState,
});
```

### パスワード表示制御
```typescript
const [showPassword, setShowPassword] = useState(false);
// Material-UI InputAdornment + IconButton による表示切り替え
```

## 🎨 UI/UX設計

### モーダル構成
- **サイズ**: 50% × 50%（レスポンシブ）
- **レイアウト**: 縦並び4項目フォーム
- **アクション**: 「連携」「キャンセル」ボタン
- **フィードバック**: ローディング状態、成功/エラーアラート

### 入力フィールド
- **統一スタイル**: 白背景、smallサイズ、fullWidth
- **パスワード**: 表示/非表示アイコン付き
- **バリデーション**: リアルタイム入力チェック

## 🔄 データフロー

```
1. モーダル開く → フォーム状態初期化
2. ユーザー入力 → リアルタイム状態更新
3. 「連携」ボタン → バリデーション実行
4. API送信 → ローディング表示
5. 成功時 → アラート表示 → モーダル閉じ → 親コンポーネント更新
6. エラー時 → エラーアラート表示
```

## 🔗 関連ディレクトリ

- [../](../) - 外部EC連携メインページ（167行）
- [../../](../../) - EC管理ダッシュボード統括
- [../../../api/store/[store_id]/](../../../api/store/[store_id]/) - 店舗別API
- [../../../contexts/](../../../contexts/) - AlertContext、StoreContext
- [../../../components/modals/](../../../components/modals/) - CustomModalWithIcon

## 📝 開発メモ

### 実装の特徴
- **249行の統合モーダル**: 認証情報設定から API連携まで一体化
- **型安全性**: TypeScript + カスタムインターフェース
- **エラーハンドリング**: CustomError判定 + 詳細メッセージ
- **セキュリティ**: パスワード表示制御、入力値トリミング

### 技術的工夫
- **状態管理**: useStateによるシンプルな状態管理
- **API統合**: createClientAPI による型安全な通信
- **UI制御**: Material-UI コンポーネントの効果的活用
- **フォーム制御**: 入力値の即座反映とバリデーション

### 将来の拡張計画
- **他プラットフォーム対応**: 楽天、Amazon等への拡張
- **連携状況表示**: 同期ステータス、最終更新日時
- **高度な設定**: 商品マッピング、価格同期ルール
- **バッチ処理**: 一括設定、設定インポート/エクスポート

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-26* 