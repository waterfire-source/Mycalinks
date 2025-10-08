# 外部EC連携管理 - おちゃのこネット連携

## 目的
「おちゃのこネット」ECプラットフォームとの連携を管理するページ

## 実装されている機能

### メインページ (page.tsx - 167行)
- **連携状況表示**: おちゃのこネット連携の現在の状況を表示
- **連携情報管理**: アカウントID、メールアドレス、APIキーの表示・管理
- **連携設定**: 新規連携・再連携機能
- **セキュリティ**: APIキーの下4桁のみ表示（********XXXX形式）

### 連携モーダル (OchanokoIntegrationModal.tsx - 249行)
- **4項目入力フォーム**:
  - おちゃのこネットアカウントID
  - おちゃのこネット登録済みメールアドレス
  - APIキー
  - おちゃのこネットログインパスワード（表示/非表示切替対応）
- **バリデーション**: 全項目必須入力チェック
- **API連携**: `clientAPI.store.updateOchanokoEcSetting`でデータ更新
- **エラーハンドリング**: 詳細なエラーメッセージ表示

## ファイル構成
```
external/
├── page.tsx                          # メイン連携管理ページ（167行）
└── components/
    └── OchanokoIntegrationModal.tsx  # 連携設定モーダル（249行）
```

## 技術実装詳細

### 状態管理
```typescript
// 連携データ型定義
interface OchanokoIntegrationData {
  ochanokoEmail: string | null;
  ochanokoAccountId: string | null;
  ochanokoApiToken: string | null;
}

// フォームデータ型定義
interface OchanokoFormData {
  ochanokoEmail: string;
  ochanokoAccountId: string;
  ochanokoPassword: string;
  ochanokoApiToken: string;
}
```

### データ取得・更新
```typescript
// 連携情報取得
const fetchECSettings = useCallback(async () => {
  const res = await fetchStoreInfoNormal(store.id, false, true);
  if (res?.[0]?.ec_setting) {
    setInitialOchanokoData({
      ochanokoEmail: res[0].ec_setting.ochanoko_email ?? null,
      ochanokoAccountId: res[0].ec_setting.ochanoko_account_id ?? null,
      ochanokoApiToken: res[0].ec_setting.ochanoko_api_token ?? null,
    });
  }
}, [store.id, fetchStoreInfoNormal]);

// 連携設定更新
const res = await clientAPI.store.updateOchanokoEcSetting({
  storeId: store.id,
  EcSetting: formState,
});
```

### UI/UX設計
- **連携状況の視覚的表示**: 連携済み/未連携の状態を明確に表示
- **セキュリティ配慮**: APIキーのマスク表示
- **ユーザビリティ**: パスワード表示/非表示切替
- **レスポンシブデザイン**: Material-UIによる統一されたデザイン

## 使用パターン
1. **初回連携**: 「連携する」ボタン → モーダル表示 → 4項目入力 → 連携完了
2. **再連携**: 「再連携」ボタン → モーダル表示 → 情報更新 → 連携更新
3. **状況確認**: 連携済み情報の表示（アカウントID、メールアドレス、APIキー下4桁）

## エラーハンドリング
- **入力バリデーション**: 全項目必須チェック
- **API エラー**: CustomErrorによる詳細エラー表示
- **ネットワークエラー**: 汎用エラーメッセージ表示
- **アラート機能**: useAlertContextによる統一的な通知

## 関連ディレクトリ
- `components/`: OchanokoIntegrationModal
- `../settings/`: EC設定管理
- `../stock/`: 在庫管理との連携
- `/contexts/`: AlertContext、StoreContext

## 開発ノート
- **おちゃのこネット専用**: 現在はおちゃのこネットのみ対応
- **セキュリティ重視**: APIキーの安全な管理
- **拡張性**: 他の外部ECプラットフォーム追加に対応可能な設計
- **ユーザビリティ**: 直感的な連携設定フロー 