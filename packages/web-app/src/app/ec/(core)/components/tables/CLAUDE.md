# EC Core Components Tables - テーブルコンポーネント

## 目的
ECサイトで使用される表形式データ表示コンポーネントを提供

## 実装されているコンポーネント (1個)

```
tables/
└── ItemInfoTable.tsx (104行)
```

## 主要実装

### ItemInfoTable.tsx (104行) - 商品詳細情報テーブル
```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import type { mycaItem } from '@/app/api/store/[store_id]/myca-item/api';

type Props = {
  item: mycaItem;
};

/**
 * 商品詳細情報テーブル
 * @param item - 商品情報
 */
export const ItemInfoTable = ({ item }: Props) => {
  // nullチェックを行い、デフォルト値を設定
  const displayCardNumber = item.cardnumber ?? '-';
  const displayRarity = item.rarity ?? '-';
  const displayType = item.type ?? '-';
  const displayExpansion = item.pack ?? '-';
  const displayReleaseDate = item.release_date ?? '-';

  return (
    <TableContainer
      sx={{
        borderRadius: 2,
        border: 1,
        borderColor: 'grey.400',
      }}
    >
      <Table
        size="small"
        sx={{
          borderCollapse: 'collapse',
          borderStyle: 'hidden',
          '& td, & th': {
            border: 1,
            borderColor: 'grey.400',
            py: '10px',
          },
          '.MuiTableBody-root .MuiTableCell-root': {
            bgcolor: 'transparent',
            backgroundColor: 'transparent',
          },
        }}
      >
        <TableBody>
          <TableRow>
            <TableCell
              component="th"
              sx={{
                bgcolor: '#eee !important',
                width: '30%',
              }}
            >
              カード番号
            </TableCell>
            <TableCell>{displayCardNumber}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell
              component="th"
              sx={{ bgcolor: '#eee !important', width: '30%' }}
            >
              レアリティ
            </TableCell>
            <TableCell>{displayRarity}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell
              component="th"
              sx={{ bgcolor: '#eee !important', width: '30%' }}
            >
              タイプ
            </TableCell>
            <TableCell>{displayType}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell
              component="th"
              sx={{ bgcolor: '#eee !important', width: '30%' }}
            >
              封入パック
            </TableCell>
            <TableCell>{displayExpansion}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell
              component="th"
              sx={{ bgcolor: '#eee !important', width: '30%' }}
            >
              発売日
            </TableCell>
            <TableCell>{displayReleaseDate}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};
```

## 主要な技術実装

### 商品情報の表示 (ItemInfoTable.tsx - 104行)
- **商品データ**: mycaItem 型による商品情報の表示
- **null安全**: null チェックとデフォルト値（'-'）の設定
- **固定レイアウト**: ヘッダー幅30%の2カラムテーブル
- **統一スタイル**: 一貫したボーダー・背景色・パディング

### 表示項目
- **カード番号**: item.cardnumber（カード固有の番号）
- **レアリティ**: item.rarity（カードのレア度）
- **タイプ**: item.type（カードの種類）
- **封入パック**: item.pack（収録されたパック名）
- **発売日**: item.release_date（発売日情報）

### Material-UI テーブル設計
- **TableContainer**: 角丸・ボーダーコンテナ
- **Table**: 小サイズ・ボーダー統一・背景透明化
- **TableCell**: ヘッダー背景色（#eee）・幅固定（30%）
- **sx プロパティ**: 詳細なスタイルカスタマイズ

### スタイリング特徴
- **角丸デザイン**: borderRadius: 2 による丸い角
- **ボーダー統一**: grey.400 による統一された境界線
- **ヘッダー強調**: 灰色背景（#eee）による項目名の強調
- **レスポンシブ**: 固定幅による一貫したレイアウト

## 使用パターン

### 1. 基本的な商品詳細表示
```typescript
import { ItemInfoTable } from './tables/ItemInfoTable';

const ProductDetailPage = () => {
  const [item, setItem] = useState<mycaItem | null>(null);

  useEffect(() => {
    // 商品情報の取得
    fetchItemData(itemId).then(setItem);
  }, [itemId]);

  if (!item) {
    return <div>読み込み中...</div>;
  }

  return (
    <div>
      <h2>{item.cardname}</h2>
      <ItemInfoTable item={item} />
    </div>
  );
};
```

### 2. 商品比較表示
```typescript
import { ItemInfoTable } from './tables/ItemInfoTable';

const ProductComparisonPage = () => {
  const [items, setItems] = useState<mycaItem[]>([]);

  return (
    <div>
      <h2>商品比較</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {items.map((item) => (
          <div key={item.id}>
            <h3>{item.cardname}</h3>
            <ItemInfoTable item={item} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 3. モーダル内での商品詳細表示
```typescript
import { ItemInfoTable } from './tables/ItemInfoTable';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';

const ProductDetailModal = ({ open, onClose, item }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{item?.cardname}</DialogTitle>
      <DialogContent>
        {item && <ItemInfoTable item={item} />}
      </DialogContent>
    </Dialog>
  );
};
```

### 4. カスタムスタイルでの使用
```typescript
import { ItemInfoTable } from './tables/ItemInfoTable';
import { Box } from '@mui/material';

const CustomProductDetail = ({ item }) => {
  return (
    <Box
      sx={{
        maxWidth: 400,
        margin: '0 auto',
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      <h3 style={{ textAlign: 'center', marginBottom: '16px' }}>
        {item.cardname}
      </h3>
      <ItemInfoTable item={item} />
      
      {/* 追加情報 */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <button>お気に入りに追加</button>
        <button>カートに追加</button>
      </Box>
    </Box>
  );
};
```

### 5. データが不完全な場合の表示
```typescript
import { ItemInfoTable } from './tables/ItemInfoTable';

const PartialItemDisplay = () => {
  // 一部のデータが欠けている商品
  const incompleteItem: mycaItem = {
    id: 1,
    cardname: 'ピカチュウ',
    cardnumber: null, // データなし
    rarity: 'C',
    type: null, // データなし
    pack: 'ベーシックパック',
    release_date: null, // データなし
  };

  return (
    <div>
      <h2>データ不完全な商品</h2>
      <ItemInfoTable item={incompleteItem} />
      <p>※ 「-」は情報が登録されていない項目です</p>
    </div>
  );
};
```

### 6. 動的データ更新
```typescript
import { ItemInfoTable } from './tables/ItemInfoTable';
import { useState, useEffect } from 'react';

const LiveItemDisplay = ({ itemId }) => {
  const [item, setItem] = useState<mycaItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/items/${itemId}`);
        const data = await response.json();
        setItem(data);
      } catch (error) {
        console.error('商品情報の取得に失敗:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (itemId) {
      fetchItem();
    }
  }, [itemId]);

  if (isLoading) {
    return <div>商品情報を読み込み中...</div>;
  }

  if (!item) {
    return <div>商品が見つかりません</div>;
  }

  return (
    <div>
      <h2>{item.cardname}</h2>
      <ItemInfoTable item={item} />
      <button onClick={() => window.location.reload()}>
        情報を更新
      </button>
    </div>
  );
};
```

## 関連ディレクトリ
- `../`: ECサイトコアコンポーネント
- `/app/api/store/[store_id]/myca-item/api`: 商品データ型定義

## 開発ノート
- **シンプル設計**: 単一責任の原則に従った商品詳細表示専用コンポーネント
- **null安全**: 全項目でnullチェックとデフォルト値設定
- **スタイル統一**: Material-UI による一貫したテーブルデザイン
- **型安全性**: TypeScript と mycaItem 型による型安全性
- **レスポンシブ**: 固定幅による安定したレイアウト
- **拡張性**: 追加項目の容易な追加が可能な構造

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 