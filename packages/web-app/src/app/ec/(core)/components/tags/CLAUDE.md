# EC Core Components Tags - タグコンポーネント

## 目的
ECサイトで使用される各種タグ・ラベル表示コンポーネントを提供

## 実装されているコンポーネント (1個)

```
tags/
└── ConditionTag.tsx (34行)
```

## 主要実装

### ConditionTag.tsx (34行) - 商品状態タグコンポーネント
```typescript
import { Typography } from '@mui/material';
import { ConditionOptionHandle } from '@prisma/client';
import { getConditionLabel } from '@/app/ec/(core)/utils/condition';

type Props = {
  value: ConditionOptionHandle;
};

/**
 * 商品状態タグコンポーネント
 * @param value - 商品状態のハンドル
 */
export const ConditionTag = ({ value }: Props) => {
  return (
    <Typography
      variant="caption"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
        fontSize: '0.65rem !important',
        borderRadius: '4px',
        padding: '4px 6px',
        border: '1px solid',
        borderColor: 'grey.700',
        whiteSpace: 'nowrap',
      }}
    >
      {getConditionLabel(value)}
    </Typography>
  );
};
```

## 主要な技術実装

### 商品状態の視覚化 (ConditionTag.tsx - 34行)
- **Prisma連携**: ConditionOptionHandle 型による型安全性
- **ユーティリティ統合**: getConditionLabel による状態ラベル取得
- **コンパクト設計**: 小さなタグ形式での状態表示
- **レスポンシブ**: whiteSpace: 'nowrap' による改行防止

### スタイリング特徴
- **小サイズフォント**: 0.65rem による控えめなサイズ
- **ボーダーデザイン**: grey.700 による明確な境界線
- **角丸**: 4px の適度な角丸
- **中央揃え**: フレックスレイアウトによる中央配置

### Material-UI 統合
- **Typography**: caption variant による小さなテキスト
- **sx プロパティ**: 詳細なスタイルカスタマイズ
- **フレックスレイアウト**: 中央揃えの実現
- **レスポンシブ**: 改行防止による安定表示

### 型安全性
- **Prisma型**: ConditionOptionHandle による型制約
- **ユーティリティ関数**: getConditionLabel による一貫したラベル表示
- **TypeScript**: 厳密な型チェック
- **Props型**: 明確な Props 型定義

## 使用パターン

### 1. 基本的な商品状態表示
```typescript
import { ConditionTag } from './tags/ConditionTag';
import { ConditionOptionHandle } from '@prisma/client';

const ProductCard = ({ product }) => {
  return (
    <div>
      <h3>{product.name}</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ConditionTag value={product.condition as ConditionOptionHandle} />
        <span>{product.price}円</span>
      </div>
    </div>
  );
};
```

### 2. 商品一覧での状態表示
```typescript
import { ConditionTag } from './tags/ConditionTag';

const ProductList = ({ products }) => {
  return (
    <div>
      {products.map((product) => (
        <div key={product.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '5px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>{product.name}</h4>
            <ConditionTag value={product.condition} />
          </div>
          <p>価格: {product.price}円</p>
          <p>在庫: {product.stock}個</p>
        </div>
      ))}
    </div>
  );
};
```

### 3. フィルター条件での状態表示
```typescript
import { ConditionTag } from './tags/ConditionTag';
import { ConditionOptionHandle } from '@prisma/client';

const FilterConditions = ({ selectedConditions, onConditionToggle }) => {
  const allConditions: ConditionOptionHandle[] = ['A', 'B', 'C', 'D'];

  return (
    <div>
      <h3>商品状態で絞り込み</h3>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {allConditions.map((condition) => (
          <div
            key={condition}
            onClick={() => onConditionToggle(condition)}
            style={{
              cursor: 'pointer',
              opacity: selectedConditions.includes(condition) ? 1 : 0.5,
              transform: selectedConditions.includes(condition) ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.2s ease',
            }}
          >
            <ConditionTag value={condition} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 4. カート内での状態表示
```typescript
import { ConditionTag } from './tags/ConditionTag';

const CartItem = ({ item }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '10px', border: '1px solid #ddd' }}>
      <img src={item.imageUrl} alt={item.name} style={{ width: '60px', height: '60px', marginRight: '10px' }} />
      <div style={{ flex: 1 }}>
        <h4>{item.name}</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <ConditionTag value={item.condition} />
          <span>数量: {item.quantity}</span>
          <span>価格: {item.price}円</span>
        </div>
      </div>
    </div>
  );
};
```

### 5. 検索結果での状態表示
```typescript
import { ConditionTag } from './tags/ConditionTag';

const SearchResultItem = ({ product, searchTerm }) => {
  const highlightText = (text: string, term: string) => {
    if (!term) return text;
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === term.toLowerCase() ? 
        <mark key={index}>{part}</mark> : part
    );
  };

  return (
    <div style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3>{highlightText(product.name, searchTerm)}</h3>
          <p>カード番号: {product.cardNumber}</p>
          <p>レアリティ: {product.rarity}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <ConditionTag value={product.condition} />
          <span style={{ fontWeight: 'bold', color: '#d32f2f' }}>{product.price}円</span>
        </div>
      </div>
    </div>
  );
};
```

### 6. 商品詳細での複数状態表示
```typescript
import { ConditionTag } from './tags/ConditionTag';

const ProductDetail = ({ product }) => {
  const availableConditions = product.variants || [];

  return (
    <div>
      <h1>{product.name}</h1>
      <img src={product.imageUrl} alt={product.name} style={{ width: '200px', height: '200px' }} />
      
      <div style={{ marginTop: '20px' }}>
        <h3>利用可能な状態</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {availableConditions.map((variant) => (
            <div
              key={variant.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              onClick={() => selectVariant(variant)}
            >
              <ConditionTag value={variant.condition} />
              <span style={{ fontSize: '0.8rem' }}>{variant.price}円</span>
              <span style={{ fontSize: '0.7rem', color: '#666' }}>在庫: {variant.stock}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

### 7. カスタムスタイルでの使用
```typescript
import { ConditionTag } from './tags/ConditionTag';
import { Box } from '@mui/material';

const CustomConditionDisplay = ({ condition, size = 'normal' }) => {
  const sizeStyles = {
    small: { fontSize: '0.5rem', padding: '2px 4px' },
    normal: {}, // デフォルト
    large: { fontSize: '0.8rem', padding: '6px 8px' },
  };

  return (
    <Box
      sx={{
        '& .MuiTypography-root': {
          ...sizeStyles[size],
        },
      }}
    >
      <ConditionTag value={condition} />
    </Box>
  );
};

// 使用例
const App = () => {
  return (
    <div>
      <CustomConditionDisplay condition="A" size="small" />
      <CustomConditionDisplay condition="B" size="normal" />
      <CustomConditionDisplay condition="C" size="large" />
    </div>
  );
};
```

## 関連ディレクトリ
- `../`: ECサイトコアコンポーネント
- `../../utils/`: ユーティリティ（condition）
- `@prisma/client`: Prisma型定義

## 開発ノート
- **シンプル設計**: 単一責任の原則に従った状態表示専用コンポーネント
- **型安全性**: Prisma型による厳密な型制約
- **視覚的一貫性**: 統一されたスタイルによる一貫した表示
- **再利用性**: 様々な場所で使用可能な汎用設計
- **パフォーマンス**: 軽量で高速な描画
- **拡張性**: 新しい状態の追加が容易な構造

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 