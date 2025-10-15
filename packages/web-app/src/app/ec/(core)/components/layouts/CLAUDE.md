# EC Core Components Layouts - レイアウトコンポーネント

## 目的
ECサイトの基本レイアウト・ヘッダー・サイドメニュー・アカウントメニューを提供

## 実装されているコンポーネント (4個)

```
layouts/
├── Header.tsx (266行) - 最大規模
├── SideMenu.tsx (131行)
├── AccountMenu.tsx (91行)
└── ECLayout.tsx (38行)
```

## 主要実装

### Header.tsx (266行) - メインヘッダー
```typescript
'use client';

import { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Badge,
  Box,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ShoppingCart as CartIcon,
  AccountCircle,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import Image from 'next/image';
import { SideMenu } from '@/app/ec/(core)/components/layouts/SideMenu';
import { useHeader } from '@/app/ec/(core)/contexts/HeaderContext';
import { MycaAppGenre } from 'backend-core';
import { createClientAPI } from '@/api/implement';
import { PATH } from '@/app/ec/(core)/constants/paths';
import {
  useRouter,
  usePathname,
  useSearchParams,
  useParams,
} from 'next/navigation';
import { AccountMenu } from '@/app/ec/(core)/components/layouts/AccountMenu';
import { useEcLoading } from '@/app/ec/(core)/contexts/EcLoadingContext';
import { useCart } from '@/app/ec/(core)/hooks/useCart';

// 検索ボックスのスタイル
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.95),
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    width: 'auto',
  },
  border: '1px solid',
  borderColor: alpha(theme.palette.grey[400], 0.8),
  margin: theme.spacing(1, 0),
}));

// 検索入力フィールドのスタイル
const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: theme.spacing(1),
    transition: theme.transitions.create('width'),
  },
}));

// ヘッダーの高さ分の余白を確保するためのコンポーネント
const ContentOffset = styled('div')<{ showSearch?: boolean }>(
  ({ showSearch }) => ({
    height: showSearch ? '129px' : '80px',
  }),
);

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();

  // サイドメニューの開閉状態
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  // アカウントメニューの開閉状態
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  // ヘッダーコンテンツの状態管理
  const { headerContent } = useHeader();
  // ジャンル一覧の状態管理
  const [ecGenres, setEcGenres] = useState<MycaAppGenre[]>([]);
  // 検索クエリの状態管理
  const [searchQuery, setSearchQuery] = useState('');

  // ローディング
  const { isEcLoading } = useEcLoading();
  // カートコンテキスト
  const { cartItemCount } = useCart();

  // 検索実行処理
  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const urlParams = new URLSearchParams(window.location.search);
      if (searchQuery.trim()) {
        urlParams.set('name', searchQuery.trim());
      } else {
        urlParams.delete('name');
      }

      // genreIdがパスパラメータにある場合はgenreパスを使用
      if (params.genre) {
        router.push(
          `${PATH.ITEMS.genre(
            params.genre as string,
          )}?${urlParams.toString()}&hasStock=true`,
        );
      } else {
        // genreIdがない場合は適切なデフォルトルートに遷移
        router.push(`${PATH.TOP}`);
      }
    }
  };

  // カートページへ遷移
  const handleCart = () => {
    const prefecture = searchParams.get('prefecture');
    if (prefecture) {
      router.push(`${PATH.CART}?prefecture=${prefecture}`);
    } else {
      router.push(PATH.CART);
    }
  };

  // URLの変更を監視して検索クエリを初期化
  useEffect(() => {
    const name = searchParams.get('name');
    setSearchQuery(name || '');
  }, [searchParams, params]);

  // ジャンル一覧の取得
  useEffect(() => {
    const fetchEcGenre = async () => {
      try {
        const clientAPI = createClientAPI();
        const result = await clientAPI.ec.getEcGenre();
        if ('genres' in result) {
          setEcGenres(result.genres);
        }
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      }
    };
    fetchEcGenre();
  }, []);

  // 商品一覧画面でのみ検索欄を表示
  const showSearch = pathname === PATH.ITEMS.genre(params.genre as string);

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          bgcolor: 'white',
          color: 'black',
          boxShadow: 1,
          width: '100%',
          zIndex: (theme) => theme.zIndex.drawer,
        }}
      >
        <Toolbar>
          {/* メニューボタン */}
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenuOpen}
            disabled={isEcLoading}
          >
            <MenuIcon />
          </IconButton>
          {/* ロゴ */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', paddingTop: '5px' }}
          >
            <Image
              src="/images/logo/mallLogo.png"
              alt="mall logo"
              height={40}
              width={80}
              onClick={() => router.push(PATH.TOP)}
              style={{ cursor: 'pointer' }}
            />
          </Box>
          {/* 検索ボックス（商品一覧ページのみ表示） */}
          {showSearch && (
            <Search>
              <StyledInputBase
                placeholder="商品名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
            </Search>
          )}
          {/* 右側のアイコン群 */}
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            size="large"
            color="inherit"
            onClick={handleCart}
            disabled={isEcLoading}
          >
            <Badge badgeContent={cartItemCount} color="error">
              <CartIcon />
            </Badge>
          </IconButton>
          <IconButton
            size="large"
            color="inherit"
            onClick={handleAccountMenuOpen}
            disabled={isEcLoading}
          >
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>
      {/* コンテンツのオフセット */}
      <ContentOffset showSearch={showSearch} />
      {/* サイドメニュー */}
      <SideMenu
        open={sideMenuOpen}
        onClose={handleMenuClose}
        menuItems={ecGenres}
      />
      {/* アカウントメニュー */}
      <AccountMenu
        open={accountMenuOpen}
        onClose={handleAccountMenuClose}
      />
    </>
  );
};
```

### SideMenu.tsx (131行) - サイドメニュー
```typescript
'use client';

import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Box,
  IconButton,
  Typography,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { MycaAppGenre } from 'backend-core';
import Link from 'next/link';
import { PATH } from '@/app/ec/(core)/constants/paths';
import { EcSessionStorageManager } from '@/app/ec/(core)/utils/sessionStorage';

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
  menuItems: MycaAppGenre[];
}

export const SideMenu = ({ open, onClose, menuItems }: SideMenuProps) => {
  const handleClick = () => {
    // SessionStorageをクリア（新しいジャンルに移動するため）
    EcSessionStorageManager.clear();
    onClose();
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = '/images/ec/noimage.png';
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: '85%',
          maxWidth: '360px',
          boxSizing: 'border-box',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1,
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        }}
      >
        <Link
          href={PATH.TOP}
          style={{ textDecoration: 'none', color: 'inherit' }}
          onClick={handleClick}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <Box
              component="img"
              src="/images/logo/shopMycaLogo.png"
              alt="mycalinks logo"
              sx={{ height: 28, mr: 1 }}
              onError={handleImageError}
            />
            <Typography
              variant="subtitle1"
              component="div"
              sx={{ fontWeight: 'bold' }}
            >
              モール
            </Typography>
          </Box>
        </Link>
        <IconButton onClick={onClose} edge="end" aria-label="close">
          <CloseIcon />
        </IconButton>
      </Box>

      <List
        sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}
        component="nav"
      >
        {menuItems.map((item) => (
          <React.Fragment key={item.id}>
            <ListItem disablePadding divider>
              <Link
                // デフォルトでは在庫のある商品のみ表示
                href={`${PATH.ITEMS.genre(String(item.id))}?hasStock=true`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  width: '100%',
                }}
                onClick={handleClick}
              >
                <ListItemButton component="div">
                  <ListItemIcon sx={{ minWidth: 42 }}>
                    <Box
                      component="img"
                      src={item.single_genre_image || '/images/ec/noimage.png'}
                      alt={item.display_name}
                      sx={{ width: 28, height: 28, objectFit: 'contain' }}
                      onError={handleImageError}
                    />
                  </ListItemIcon>
                  <ListItemText primary={item.display_name} />
                </ListItemButton>
              </Link>
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};
```

### ECLayout.tsx (38行) - 最小規模
```typescript
'use client';

import React, { Suspense } from 'react';
import Box from '@mui/material/Box';
import { Header } from '@/app/ec/(core)/components/layouts/Header';
import { AlertProvider } from '@/contexts/AlertContext';
import { HeaderProvider } from '@/app/ec/(core)/contexts/HeaderContext';
import { EcLoadingProvider } from '@/app/ec/(core)/contexts/EcLoadingContext';
import { CartProvider } from '@/contexts/CartContext';

export default function ECLayout({ children }: { children: React.ReactNode }) {
  return (
    <AlertProvider>
      <CartProvider>
        <EcLoadingProvider>
          <HeaderProvider>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100svh',
                bgcolor: '#f5f5f5',
              }}
            >
              <Suspense fallback={<div>Loading...</div>}>
                <Header />
              </Suspense>
              <Box component="main" sx={{ flex: 1, pb: 7 }}>
                {children}
              </Box>
            </Box>
          </HeaderProvider>
        </EcLoadingProvider>
      </CartProvider>
    </AlertProvider>
  );
}
```

### AccountMenu.tsx (91行) - アカウントメニュー
- **アカウント管理**: ログイン・ログアウト・マイページ等のメニュー
- **認証状態**: ログイン状態に応じたメニュー表示
- **ナビゲーション**: 各種アカウント関連ページへの遷移

## 主要な技術実装

### 複雑なヘッダー機能 (Header.tsx - 266行)
- **動的検索**: 商品一覧ページでのみ検索ボックス表示
- **ジャンル連携**: サイドメニューでのジャンル一覧表示
- **カート統合**: カートアイテム数のバッジ表示
- **状態管理**: ローディング状態・メニュー開閉状態の管理

### スタイリング (styled-components)
- **Search**: 検索ボックスのカスタムスタイル
- **StyledInputBase**: 検索入力フィールドのスタイル
- **ContentOffset**: ヘッダー高さ分のオフセット調整

### レスポンシブデザイン
- **ブレークポイント**: sm以上で検索ボックス幅調整
- **モバイル対応**: サイドメニューの幅調整（85%、最大360px）
- **アイコン**: Material-UI Icons の活用

### サイドメニュー機能 (SideMenu.tsx - 131行)
- **ジャンル表示**: MycaAppGenre による動的ジャンル一覧
- **画像エラー処理**: 画像読み込み失敗時のフォールバック
- **セッション管理**: ジャンル移動時のセッションストレージクリア
- **ナビゲーション**: Next.js Link による SPA ナビゲーション

### レイアウト構造 (ECLayout.tsx - 38行)
- **Provider階層**: 複数のContext Providerの階層構造
- **Suspense**: Header コンポーネントの遅延読み込み
- **フレックスレイアウト**: 縦方向のフレックスレイアウト
- **背景色**: 統一された背景色設定

## 使用パターン

### 1. 基本レイアウト
```typescript
import ECLayout from './layouts/ECLayout';

const App = () => {
  return (
    <ECLayout>
      <YourPageContent />
    </ECLayout>
  );
};
```

### 2. ヘッダー単体使用
```typescript
import { Header } from './layouts/Header';

const CustomLayout = () => {
  return (
    <div>
      <Header />
      <main>
        <YourContent />
      </main>
    </div>
  );
};
```

### 3. サイドメニュー単体使用
```typescript
import { SideMenu } from './layouts/SideMenu';

const CustomPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [genres, setGenres] = useState<MycaAppGenre[]>([]);

  return (
    <div>
      <button onClick={() => setMenuOpen(true)}>
        メニューを開く
      </button>
      <SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        menuItems={genres}
      />
    </div>
  );
};
```

### 4. アカウントメニュー統合
```typescript
import { Header } from './layouts/Header';
import { AccountMenu } from './layouts/AccountMenu';

const HeaderWithAccount = () => {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  return (
    <>
      <Header onAccountClick={() => setAccountMenuOpen(true)} />
      <AccountMenu
        open={accountMenuOpen}
        onClose={() => setAccountMenuOpen(false)}
      />
    </>
  );
};
```

## 関連ディレクトリ
- `../`: ECサイトコアコンポーネント
- `../../contexts/`: ECサイトContext（HeaderContext, EcLoadingContext）
- `../../hooks/`: ECサイトフック（useCart）
- `../../constants/`: 定数（paths）
- `../../utils/`: ユーティリティ（sessionStorage）
- `/contexts/`: アプリ全体のContext

## 開発ノート
- **複雑な状態管理**: 複数のメニュー開閉状態・検索状態・ローディング状態
- **動的表示**: パスに応じた検索ボックス表示制御
- **レスポンシブ**: モバイル・デスクトップ対応のレイアウト
- **パフォーマンス**: Suspense による遅延読み込み
- **エラーハンドリング**: 画像エラー・API エラーの適切な処理
- **セッション管理**: ジャンル移動時のセッションストレージ制御

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 