# EC Core Contexts - ECサイトReact Context

## 目的
ECサイト全体で共有される状態管理とグローバルな機能を提供するReact Context

## 実装されているContext (2個)

### 1. HeaderContext.tsx (32行)
```typescript
'use client';

import { ReactNode, createContext, useContext, useState } from 'react';

type HeaderContextType = {
  headerContent: ReactNode;
  setHeaderContent: (content: ReactNode) => void;
};

const HeaderContext = createContext<HeaderContextType>({
  headerContent: null,
  setHeaderContent: () => {},
});

export const HeaderProvider = ({ children }: { children: ReactNode }) => {
  const [headerContent, setHeaderContent] = useState<ReactNode>(null);

  return (
    <HeaderContext.Provider value={{ headerContent, setHeaderContent }}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
};
```

### 2. EcLoadingContext.tsx (43行)
```typescript
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// LoadingContext用の型定義
interface LoadingContextProps {
  isEcLoading: boolean;
  setIsEcLoading: (loading: boolean) => void;
}

// デフォルト値
const defaultContext: LoadingContextProps = {
  isEcLoading: false,
  setIsEcLoading: () => {}, // ダミー関数
};

// Contextの作成
const EcLoadingContext = createContext<LoadingContextProps>(defaultContext);

// Provider コンポーネント
export const EcLoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isEcLoading, setIsEcLoadingState] = useState(false);

  const setIsEcLoading = (loading: boolean) => {
    setIsEcLoadingState(loading);
  };

  return (
    <EcLoadingContext.Provider value={{ isEcLoading, setIsEcLoading }}>
      {children}
    </EcLoadingContext.Provider>
  );
};

// カスタムフック
export const useEcLoading = () => {
  const context = useContext(EcLoadingContext);
  if (context === undefined) {
    throw new Error('useEcLoading must be used within an EcLoadingProvider');
  }
  return context;
};
```

## 主要機能

### HeaderContext (32行)
- **動的ヘッダー**: ページごとに異なるヘッダーコンテンツを表示
- **状態管理**: headerContent の ReactNode を管理
- **型安全性**: TypeScript による型定義
- **エラーハンドリング**: Provider外での使用時のエラー処理

#### 使用パターン
```typescript
// ヘッダーコンテンツの設定
const { setHeaderContent } = useHeader();

useEffect(() => {
  setHeaderContent(
    <Box>
      <Typography variant="h6">商品詳細</Typography>
      <Button>戻る</Button>
    </Box>
  );
}, [setHeaderContent]);

// ヘッダーコンテンツの表示
const { headerContent } = useHeader();
return (
  <AppBar>
    {headerContent}
  </AppBar>
);
```

### EcLoadingContext (43行)
- **ローディング状態**: ECサイト全体のローディング状態を管理
- **グローバル管理**: 複数コンポーネント間でのローディング状態共有
- **型安全性**: LoadingContextProps インターフェースによる型定義
- **エラーハンドリング**: Provider外での使用時のエラー処理

#### 使用パターン
```typescript
// ローディング開始
const { setIsEcLoading } = useEcLoading();

const handleApiCall = async () => {
  setIsEcLoading(true);
  try {
    await apiCall();
  } finally {
    setIsEcLoading(false);
  }
};

// ローディング表示
const { isEcLoading } = useEcLoading();
return (
  <div>
    {isEcLoading && <CircularProgress />}
    <MainContent />
  </div>
);
```

## 技術実装の特徴

### Context パターン
```typescript
// 1. Context作成
const HeaderContext = createContext<HeaderContextType>({
  headerContent: null,
  setHeaderContent: () => {},
});

// 2. Provider作成
export const HeaderProvider = ({ children }: { children: ReactNode }) => {
  const [headerContent, setHeaderContent] = useState<ReactNode>(null);

  return (
    <HeaderContext.Provider value={{ headerContent, setHeaderContent }}>
      {children}
    </HeaderContext.Provider>
  );
};

// 3. カスタムフック作成
export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
};
```

### 型安全性
```typescript
// HeaderContext の型定義
type HeaderContextType = {
  headerContent: ReactNode;
  setHeaderContent: (content: ReactNode) => void;
};

// EcLoadingContext の型定義
interface LoadingContextProps {
  isEcLoading: boolean;
  setIsEcLoading: (loading: boolean) => void;
}
```

### エラーハンドリング
```typescript
// Provider外での使用チェック
export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
};

export const useEcLoading = () => {
  const context = useContext(EcLoadingContext);
  if (context === undefined) {
    throw new Error('useEcLoading must be used within an EcLoadingProvider');
  }
  return context;
};
```

## 使用パターン

### 1. Provider の配置
```typescript
// layout.tsx または app.tsx
export default function ECLayout({ children }: { children: ReactNode }) {
  return (
    <EcLoadingProvider>
      <HeaderProvider>
        <ECHeader />
        <main>{children}</main>
      </HeaderProvider>
    </EcLoadingProvider>
  );
}
```

### 2. ヘッダーコンテンツの動的変更
```typescript
// 商品詳細ページ
const ProductDetailPage = () => {
  const { setHeaderContent } = useHeader();

  useEffect(() => {
    setHeaderContent(
      <Stack direction="row" spacing={2}>
        <IconButton onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">商品詳細</Typography>
      </Stack>
    );
  }, [setHeaderContent]);

  return <ProductDetail />;
};
```

### 3. ローディング状態の管理
```typescript
// API呼び出し時のローディング
const ProductList = () => {
  const { setIsEcLoading } = useEcLoading();

  const fetchProducts = async () => {
    setIsEcLoading(true);
    try {
      const products = await getProducts();
      setProducts(products);
    } catch (error) {
      console.error(error);
    } finally {
      setIsEcLoading(false);
    }
  };

  return <ProductGrid products={products} />;
};
```

## 関連ディレクトリ
- `../`: ECサイトコア機能
- `../components/layouts/`: レイアウトコンポーネント（Context利用者）
- `../../`: ECサイトメイン（Context利用者）
- `/contexts/`: アプリ全体のContext

## 開発ノート
- **最小限の実装**: 必要最小限の2つのContext
- **型安全性**: TypeScript による厳密な型定義
- **エラーハンドリング**: Provider外使用時の適切なエラー処理
- **パフォーマンス**: 軽量な状態管理
- **拡張性**: 新しいContextの追加が容易な構造

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 