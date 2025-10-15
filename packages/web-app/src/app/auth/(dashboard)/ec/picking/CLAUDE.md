# ECピッキング管理

## 目的
EC注文の商品ピッキング作業をサポートするチェックリストページ

## 実装されている機能

### メインページ (page.tsx - 275行)
- **注文情報表示**: 注文番号・集荷予定日の表示
- **商品一覧表示**: DataGridによる商品詳細リスト
- **スキャン機能**: 行クリックまたは数量入力によるピッキング確認
- **進捗管理**: スキャン数/必要数の可視化
- **完了処理**: ピッキング完了時の確認とアラート

### ピッキング機能の詳細
- **商品情報表示**: 画像・商品名・型番・レアリティ・状態・価格
- **数量管理**: スキャン数と必要数の表示・入力
- **視覚的フィードバック**: 完了時の色変更（赤色表示）
- **不足アラート**: 数量不足時の確認モーダル
- **行クリック**: 行クリックでスキャン数+1の操作

## ファイル構成
```
picking/
└── page.tsx    # ピッキングチェックリストページ（275行）
```

## 技術実装詳細

### データ構造
```typescript
interface PickingItem extends OrderItem {
  id: string;
  scannedQuantity: number;  // スキャン済み数量
}

// 商品情報構造
interface OrderItem {
  name: string;          // 商品名
  condition: string;     // 状態（S/A/B/C）
  price: number;         // 価格
  quantity: number;      // 必要数量
  image: string;         // 商品画像URL
  rarity: string;        // レアリティ（R/SR/C）
  modelNumber: string;   // 型番
}
```

### スキャン機能
```typescript
// 行クリックでスキャン数+1
const handleScanComplete = (id: string) => {
  setItems((prevItems) => {
    return prevItems.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          scannedQuantity: Math.min(item.scannedQuantity + 1, item.quantity),
        };
      }
      return item;
    });
  });
};

// 数量入力での直接変更
onChange={(e) => {
  const value = Math.min(
    Math.max(0, parseInt(e.target.value) || 0),
    params.row.quantity,
  );
  setItems((prevItems) =>
    prevItems.map((item) =>
      item.id === params.row.id
        ? { ...item, scannedQuantity: value }
        : item,
    ),
  );
}}
```

### 完了処理
```typescript
// ピッキング完了チェック
const handlePickingComplete = () => {
  const hasInsufficientItems = items.some(
    (item) => item.scannedQuantity < item.quantity,
  );
  
  if (hasInsufficientItems) {
    setIsAlertModalOpen(true);  // 不足アラート表示
  } else {
    submitPicking();            // 完了処理実行
  }
};

// 完了API呼び出し
const submitPicking = () => {
  // TODO: ピッキング完了APIコール
  setAlertState({
    message: 'ピッキングが完了しました',
    severity: 'success',
  });
  router.push(PATH.EC.root);
};
```

## DataGrid設定詳細

### 列定義
```typescript
const columns: GridColDef[] = [
  {
    field: 'product',
    headerName: '商品',
    flex: 3,
    renderCell: (params) => (
      // 商品画像 + 商品名の表示
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Image src={params.row.image} alt={params.row.name} 
               width={60} height={90} />
        <Typography variant="body2">{params.row.name}</Typography>
      </Box>
    ),
  },
  {
    field: 'scanStatus',
    headerName: 'スキャン数/数量',
    renderCell: (params) => (
      // 数量入力フィールド + 必要数表示
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
        <TextField
          type="number"
          value={params.row.scannedQuantity}
          inputProps={{ min: 0, max: params.row.quantity }}
          sx={{
            '& input': {
              color: params.row.scannedQuantity === params.row.quantity 
                     ? 'red' : 'inherit',
            },
          }}
        />
        <Typography>/</Typography>
        <Typography>{params.row.quantity}</Typography>
      </Box>
    ),
  },
];
```

### UI/UX設計
- **高さ調整**: 行の高さを100pxに設定（商品画像表示のため）
- **クリック操作**: 行クリックでスキャン数増加
- **視覚的フィードバック**: 完了時の赤色表示
- **ホバー効果**: 行ホバー時の背景色変更
- **操作防止**: 数量入力時の行クリックイベント停止

## 使用パターン
1. **注文選択**: 注文一覧からピッキング対象を選択
2. **商品確認**: 商品画像・詳細情報を確認
3. **ピッキング作業**: 
   - 商品を見つけて行をクリック（スキャン数+1）
   - または数量フィールドに直接入力
4. **進捗確認**: スキャン数/必要数で進捗を確認
5. **完了処理**: 全商品完了後「ピッキング完了」ボタンを押下

## モックデータ使用
- **mockOrderDetail**: 注文詳細・商品情報のモックデータ
- **7商品のサンプル**: ポケモンカードの商品データ
- **画像プレースホルダー**: `https://via.placeholder.com/60x80`

## エラーハンドリング・アラート
- **数量不足アラート**: 必要数に達していない商品がある場合の確認モーダル
- **完了通知**: ピッキング完了時の成功メッセージ
- **AlertConfirmationModal**: 不足時の確認ダイアログ

## 関連ディレクトリ
- `/feature/ec/mockOrderDetail.ts`: モックデータ
- `/components/modals/ec/OrderDetailModal`: 注文詳細モーダル
- `/components/buttons/PrimaryButton`: 完了ボタン
- `/components/modals/common/AlertConfirmationModal`: 確認モーダル
- `../list/`: 注文一覧との連携

## 開発ノート
- **TODO**: 実際のAPI連携（現在はモックデータ使用）
- **バーコードスキャン**: 将来的なバーコードスキャン機能対応準備
- **レスポンシブ**: DataGridによる柔軟なレイアウト
- **パフォーマンス**: 大量商品対応のページネーション（50件/ページ）
- **アクセシビリティ**: 日本語ローカライゼーション対応 