# EC Core Components Selects - セレクトコンポーネント

## 目的
ECサイトで使用される各種選択入力コンポーネントを提供

## 実装されているコンポーネント (3個)

```
selects/
├── PrefectureSelect.tsx (124行) - 最大規模
├── StockSelect.tsx (56行)
└── SortSelect.tsx (53行)
```

## 主要実装

### PrefectureSelect.tsx (124行) - 都道府県選択コンポーネント
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Menu, MenuItem } from '@mui/material';
import { prefectures } from '@/constants/prefectures';
import { useRouter, useSearchParams } from 'next/navigation';

type Prefecture = (typeof prefectures)[0];

interface Props {
  defaultPrefectureId?: number;
  setPrefectureId?: (prefectureId: number) => void;
  label?: string;
  onPrefectureChange?: (prefectureId: number) => void;
}

export const PrefectureSelect = ({
  defaultPrefectureId = 13, // デフォルトは東京都
  label = 'お届け先',
  setPrefectureId,
  onPrefectureChange,
}: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 初期都道府県の設定
  const [selectedPrefecture, setSelectedPrefecture] = useState(() => {
    const prefectureId =
      Number(searchParams.get('prefecture')) || defaultPrefectureId;
    return prefectures.find((p) => p.id === prefectureId) || prefectures[0];
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (!defaultPrefectureId) return;
    const prefecture = prefectures.find((p) => p.id === defaultPrefectureId);
    if (!prefecture) return;
    setSelectedPrefecture(prefecture);
  }, [defaultPrefectureId]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (prefecture: Prefecture) => {
    setSelectedPrefecture(prefecture);
    setPrefectureId?.(prefecture.id);

    // コールバック関数があれば実行
    onPrefectureChange?.(prefecture.id);

    handleClose();

    // URLパラメータを更新
    const params = new URLSearchParams(window.location.search);
    params.set('prefecture', prefecture.id.toString());
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {label && (
        <Typography variant="body2" sx={{ mr: 1 }}>
          {label}:
        </Typography>
      )}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          border: '1px solid rgba(0, 0, 0, 0.23)',
          borderRadius: '4px',
          px: 1,
          py: 0.5,
          cursor: 'pointer',
        }}
        onClick={handleClick}
        aria-controls={open ? 'prefecture-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        tabIndex={0}
        role="combobox"
      >
        <Typography variant="body2">{selectedPrefecture.name}</Typography>
        <Typography variant="body2" color="grey.500" sx={{ ml: 1 }}>
          ▼
        </Typography>
      </Box>

      <Menu
        id="prefecture-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'prefecture-button',
          sx: { maxHeight: 300 },
          role: 'listbox',
        }}
      >
        {prefectures.map((prefecture) => (
          <MenuItem
            key={prefecture.id}
            onClick={() => handleSelect(prefecture)}
            selected={prefecture.id === selectedPrefecture.id}
            dense
            role="option"
            aria-selected={prefecture.id === selectedPrefecture.id}
          >
            {prefecture.name}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};
```

### StockSelect.tsx (56行) - 在庫選択コンポーネント
```typescript
import { Select, MenuItem, Typography, Stack } from '@mui/material';

type Props = {
  maxStock: number;
  value: number;
  onChange: (value: number) => void;
};

/**
 * 在庫数選択コンポーネント
 * @param maxStock - 在庫数の上限
 */
export const StockSelect = ({ maxStock, value, onChange }: Props) => {
  return (
    <Stack direction="row" sx={{ height: '100%' }}>
      <Select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        sx={{
          width: '100%',
          height: 'auto',
          borderRadius: '4px 0 0 4px',
          '& fieldset': {
            borderColor: 'grey.500',
          },
        }}
      >
        {Array.from({ length: maxStock + 1 }, (_, i) => (
          <MenuItem key={i} value={i}>
            {i}
          </MenuItem>
        ))}
      </Select>
      <Typography
        fontWeight="bold"
        sx={{
          width: '100%',
          height: 'auto',
          whiteSpace: 'nowrap',
          bgcolor: 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid',
          borderColor: 'grey.500',
          borderRadius: '0 4px 4px 0',
          borderLeft: 'none',
          px: 1,
        }}
      >
        在庫{maxStock}
      </Typography>
    </Stack>
  );
};
```

### SortSelect.tsx (53行) - ソート選択コンポーネント
```typescript
import {
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import {
  ORDER_KINDS,
  OrderKind,
  ORDER_KIND_VALUE,
} from '@/app/ec/(core)/constants/orderKind';

type Props = {
  value?: OrderKind['value'];
  onChange: (event: SelectChangeEvent) => void;
};

/**
 * 商品の並び替えを行うセレクトボックスコンポーネント
 * @param value - 現在選択されている値（未指定の場合は価格が安い順）
 * @param onChange - 値が変更された時のハンドラー
 */
export const SortSelect = ({
  value = ORDER_KIND_VALUE.PRICE_ASC,
  onChange,
}: Props) => {
  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <Select
        value={value}
        onChange={onChange}
        displayEmpty
        sx={{
          height: '36px',
          fontSize: '1rem',
          fontWeight: 'bold',
          bgcolor: 'white',
        }}
      >
        {ORDER_KINDS.map((orderKind) => (
          <MenuItem
            key={orderKind.value}
            value={orderKind.value}
            sx={{ fontSize: '1rem' }}
          >
            {orderKind.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
```

## 主要な技術実装

### 複雑な都道府県選択 (PrefectureSelect.tsx - 124行)
- **URL同期**: searchParams・router による URL パラメータ同期
- **状態管理**: 選択状態・メニュー開閉状態の管理
- **初期化**: URL パラメータからの初期値設定
- **アクセシビリティ**: ARIA属性による支援技術対応

### 在庫選択の二分割デザイン (StockSelect.tsx - 56行)
- **セレクトボックス**: 0から最大在庫数までの選択
- **在庫表示**: 右側に在庫数を表示するラベル
- **一体型デザイン**: 左右の境界線を統一した一体感
- **動的生成**: Array.from による動的オプション生成

### 定数連携ソート選択 (SortSelect.tsx - 53行)
- **定数統合**: ORDER_KINDS 定数との連携
- **型安全**: OrderKind 型による型安全性
- **デフォルト値**: 価格昇順をデフォルト値として設定
- **統一スタイル**: 一貫したフォントサイズ・スタイル

### Material-UI カスタマイズ
- **Box・Stack**: レイアウトコンテナの活用
- **Menu・MenuItem**: カスタムメニューの実装
- **Select・FormControl**: セレクトボックスのカスタマイズ
- **sx プロパティ**: 詳細なスタイル調整

## 使用パターン

### 1. 都道府県選択
```typescript
import { PrefectureSelect } from './selects/PrefectureSelect';

const ShippingForm = () => {
  const [prefectureId, setPrefectureId] = useState(13); // 東京都

  const handlePrefectureChange = (newPrefectureId: number) => {
    console.log('都道府県が変更されました:', newPrefectureId);
    // 配送料の再計算など
  };

  return (
    <form>
      <PrefectureSelect
        defaultPrefectureId={prefectureId}
        setPrefectureId={setPrefectureId}
        label="配送先"
        onPrefectureChange={handlePrefectureChange}
      />
    </form>
  );
};
```

### 2. 在庫選択
```typescript
import { StockSelect } from './selects/StockSelect';

const ProductCard = () => {
  const [selectedCount, setSelectedCount] = useState(1);
  const maxStock = 10;

  const handleStockChange = (count: number) => {
    setSelectedCount(count);
    // カート内容の更新など
  };

  return (
    <div>
      <h3>商品名</h3>
      <p>価格: 1,000円</p>
      <StockSelect
        maxStock={maxStock}
        value={selectedCount}
        onChange={handleStockChange}
      />
      <button disabled={selectedCount === 0}>
        カートに追加
      </button>
    </div>
  );
};
```

### 3. ソート選択
```typescript
import { SortSelect } from './selects/SortSelect';
import { ORDER_KIND_VALUE } from '@/app/ec/(core)/constants/orderKind';

const ProductList = () => {
  const [sortOrder, setSortOrder] = useState(ORDER_KIND_VALUE.PRICE_ASC);
  const [products, setProducts] = useState([]);

  const handleSortChange = (event: SelectChangeEvent) => {
    const newSortOrder = event.target.value;
    setSortOrder(newSortOrder);
    
    // 商品リストのソート
    const sortedProducts = [...products].sort((a, b) => {
      switch (newSortOrder) {
        case ORDER_KIND_VALUE.PRICE_ASC:
          return a.price - b.price;
        case ORDER_KIND_VALUE.PRICE_DESC:
          return b.price - a.price;
        case ORDER_KIND_VALUE.CONDITION_ASC:
          return a.condition.localeCompare(b.condition);
        case ORDER_KIND_VALUE.CONDITION_DESC:
          return b.condition.localeCompare(a.condition);
        default:
          return 0;
      }
    });
    
    setProducts(sortedProducts);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>商品一覧</h2>
        <SortSelect value={sortOrder} onChange={handleSortChange} />
      </div>
      
      <div>
        {products.map((product) => (
          <div key={product.id}>
            <h3>{product.name}</h3>
            <p>価格: {product.price}円</p>
            <p>状態: {product.condition}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 4. 複合使用パターン
```typescript
import { PrefectureSelect } from './selects/PrefectureSelect';
import { SortSelect } from './selects/SortSelect';
import { StockSelect } from './selects/StockSelect';

const ProductSearchPage = () => {
  const [prefecture, setPrefecture] = useState(13);
  const [sortOrder, setSortOrder] = useState(ORDER_KIND_VALUE.PRICE_ASC);
  const [selectedCounts, setSelectedCounts] = useState<Record<number, number>>({});

  const handleAddToCart = (productId: number, count: number) => {
    if (count > 0) {
      console.log(`商品 ${productId} を ${count} 個カートに追加`);
    }
  };

  return (
    <div>
      {/* 検索条件 */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <PrefectureSelect
          defaultPrefectureId={prefecture}
          setPrefectureId={setPrefecture}
          label="配送先"
        />
        <SortSelect value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
      </div>

      {/* 商品一覧 */}
      <div>
        {products.map((product) => (
          <div key={product.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
            <h3>{product.name}</h3>
            <p>価格: {product.price}円</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <StockSelect
                maxStock={product.stock}
                value={selectedCounts[product.id] || 0}
                onChange={(count) => setSelectedCounts(prev => ({ ...prev, [product.id]: count }))}
              />
              <button 
                onClick={() => handleAddToCart(product.id, selectedCounts[product.id] || 0)}
                disabled={!selectedCounts[product.id]}
              >
                カートに追加
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 関連ディレクトリ
- `../`: ECサイトコアコンポーネント
- `../../constants/`: 定数（orderKind）
- `/constants/`: アプリ全体の定数（prefectures）

## 開発ノート
- **URL同期**: 都道府県選択の URL パラメータ同期
- **アクセシビリティ**: ARIA属性による支援技術対応
- **型安全性**: TypeScript による厳密な型定義
- **パフォーマンス**: 動的配列生成・メモ化の活用
- **デザイン統一**: Material-UI による一貫したスタイル
- **再利用性**: 柔軟な Props 設計による汎用性

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 