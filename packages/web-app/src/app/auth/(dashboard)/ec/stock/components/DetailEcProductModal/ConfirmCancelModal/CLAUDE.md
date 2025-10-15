# packages/web-app/src/app/auth/(dashboard)/ec/stock/components/DetailEcProductModal/ConfirmCancelModal/CLAUDE.md

## 🎯 目的・役割

EC商品出品取り消し確認モーダル - 商品の出品取り消し操作において、ユーザーの意図確認を行うシンプルで安全な確認ダイアログ。

## 🏗️ 技術構成

- **フレームワーク**: React + TypeScript
- **UI**: Material-UI 5.15.15
- **主要技術**: 
  - Modal・Dialog による確認画面
  - Button による操作制御
  - Typography による説明文表示
  - 45行のコンパクト実装
- **依存関係**: 
  - Material-UI コンポーネント
  - React状態管理

## 📁 ディレクトリ構造

```
packages/web-app/src/app/auth/(dashboard)/ec/stock/components/DetailEcProductModal/ConfirmCancelModal/
├── ConfirmCancelModal.tsx      # 取り消し確認モーダル（45行）
└── CLAUDE.md                   # 本ドキュメント
```

## 🔧 主要機能

### 1. 確認ダイアログ
- **シンプルな確認**: 取り消し操作の意図確認
- **安全な操作**: 誤操作防止のための確認ステップ
- **明確な選択**: 「はい」「いいえ」の明確な選択肢
- **モーダル表示**: 他の操作をブロックする確認画面

### 2. 操作制御
- **onConfirm**: 確認時のコールバック処理
- **onCancel**: キャンセル時のコールバック処理
- **open**: モーダル表示状態の制御
- **非破壊的操作**: 確認なしでは実行されない安全設計

## 💡 使用パターン

### 基本的な使用方法
```typescript
// 取り消し確認モーダル
<ConfirmCancelModal
  open={isConfirmModalOpen}
  onConfirm={handleConfirmCancel}
  onCancel={handleCancelCancel}
/>
```

### 状態管理パターン
```typescript
// モーダル状態管理
const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

// 取り消し開始
const handleStartCancel = () => {
  setIsConfirmModalOpen(true);
};

// 取り消し確認
const handleConfirmCancel = () => {
  // 実際の取り消し処理
  performCancelOperation();
  setIsConfirmModalOpen(false);
};

// 取り消しキャンセル
const handleCancelCancel = () => {
  setIsConfirmModalOpen(false);
};
```

## 🎨 UI/UX設計

### モーダル構成
- **中央配置**: 画面中央への配置
- **明確なメッセージ**: 操作内容の明確な説明
- **2択ボタン**: 「はい」「いいえ」の明確な選択
- **フォーカス管理**: 適切なフォーカス制御

### 安全性設計
- **確認ステップ**: 即座の実行を防ぐ確認画面
- **明確な説明**: 操作結果の明確な説明
- **キャンセル可能**: いつでもキャンセル可能な設計
- **非破壊的**: 確認なしでは実行されない安全性

## 🔗 API統合

### Props インターフェース
```typescript
interface Props {
  open: boolean;                    // モーダル表示状態
  onConfirm: () => void;           // 確認時のコールバック
  onCancel: () => void;            // キャンセル時のコールバック
}
```

### 使用例
```typescript
// 親コンポーネントでの使用
const DetailEcProductModal = () => {
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  
  const handleCancelClick = () => {
    setShowConfirmCancel(true);
  };
  
  const handleConfirmCancel = async () => {
    try {
      await cancelProductListing(productId);
      setShowConfirmCancel(false);
      onClose();
    } catch (error) {
      // エラーハンドリング
    }
  };
  
  return (
    <>
      <Button onClick={handleCancelClick}>
        出品を取り消す
      </Button>
      
      <ConfirmCancelModal
        open={showConfirmCancel}
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowConfirmCancel(false)}
      />
    </>
  );
};
```

## 🚀 パフォーマンス最適化

### 軽量設計
- **45行のコンパクト実装**: 最小限のコードによる効率性
- **条件付きレンダリング**: open状態による適切な表示制御
- **シンプルな状態**: 必要最小限の状態管理

### UX最適化
- **即座の表示**: 軽量なモーダルによる快適な操作感
- **明確なフィードバック**: 操作結果の即座な反映
- **キーボード対応**: ESCキーによるキャンセル対応

## 🔗 関連コンポーネント

- [../DetailEcProductModal.tsx](../DetailEcProductModal.tsx) - 親モーダルコンポーネント
- [../DetailEcProduct/](../DetailEcProduct/) - 商品詳細表示・編集
- [../ProductEcOrderHistory/](../ProductEcOrderHistory/) - 注文履歴表示
- [../../CancelSellModal/](../../CancelSellModal/) - 一括取り消しモーダル

## 📝 開発メモ

### 実装の特徴
- **45行のミニマル実装**: 確認機能に特化したシンプル設計
- **安全性重視**: 誤操作防止のための確認ステップ
- **再利用可能**: 他の取り消し操作でも利用可能な汎用設計
- **Material-UI準拠**: 一貫したデザインシステム

### 技術的工夫
- **コールバック設計**: onConfirm・onCancel による柔軟な処理制御
- **状態管理**: 親コンポーネントによる状態制御
- **モーダル制御**: open prop による表示制御
- **型安全性**: TypeScript による型定義

### UI設計原則
- **シンプリシティ**: 必要最小限の要素による明確な UI
- **安全性**: 確認ステップによる誤操作防止
- **一貫性**: Material-UI による統一されたデザイン
- **アクセシビリティ**: キーボード操作・フォーカス管理

### 使用場面
- **商品出品取り消し**: EC商品の出品取り消し確認
- **重要な操作**: 取り返しのつかない操作の確認
- **データ削除**: 重要なデータの削除確認
- **設定変更**: 重要な設定変更の確認

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 