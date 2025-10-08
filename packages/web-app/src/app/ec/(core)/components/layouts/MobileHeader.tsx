'use client';

import { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Badge,
  Box,
  Typography,
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

export const MobileHeader = () => {
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

  // サイドメニューを開く
  const handleMenuOpen = () => {
    setSideMenuOpen(true);
  };

  // サイドメニューを閉じる
  const handleMenuClose = () => {
    setSideMenuOpen(false);
  };

  // アカウントメニューを開く
  const handleAccountMenuOpen = () => {
    setAccountMenuOpen(true);
  };

  // アカウントメニューを閉じる
  const handleAccountMenuClose = () => {
    setAccountMenuOpen(false);
  };

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
            {process.env.NEXT_PUBLIC_RUN_MODE === 'customer-prod' ? (
              <Image
                src="/images/ec/mallLogo.png"
                alt="mall logo"
                height={40}
                width={80}
                onClick={() => router.push(PATH.TOP)}
                style={{ cursor: 'pointer' }}
              />
            ) : process.env.NEXT_PUBLIC_RUN_MODE === 'prod' ? (
              <Typography
                onClick={() => router.push(PATH.TOP)}
                sx={{ cursor: 'pointer' }}
              >
                io環境
              </Typography>
            ) : process.env.NEXT_PUBLIC_RUN_MODE === 'stg' ? (
              <Typography
                onClick={() => router.push(PATH.TOP)}
                sx={{ cursor: 'pointer' }}
              >
                ステージング環境
              </Typography>
            ) : process.env.NEXT_PUBLIC_RUN_MODE === 'dev' ||
              process.env.NEXT_PUBLIC_RUN_MODE === 'local' ? (
              <Typography
                onClick={() => router.push(PATH.TOP)}
                sx={{ cursor: 'pointer' }}
              >
                開発環境
              </Typography>
            ) : null}
          </Box>
          {/* タイトル */}
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* <Typography variant="h2" component="div">
              モール
            </Typography> */}
          </Box>
          {/* アカウントアイコン */}
          <IconButton
            color="inherit"
            onClick={handleAccountMenuOpen}
            disabled={isEcLoading}
          >
            <AccountCircle />
          </IconButton>
          {/* カートアイコン */}
          <IconButton
            color="inherit"
            onClick={handleCart}
            disabled={isEcLoading}
          >
            <Badge badgeContent={cartItemCount} color="error">
              <CartIcon />
            </Badge>
          </IconButton>
        </Toolbar>
        {/* 検索バーとヘッダーコンテンツ */}
        <Box sx={{ px: 2, pb: 1 }}>
          {showSearch && (
            <Search>
              <StyledInputBase
                placeholder="モール内検索"
                inputProps={{ 'aria-label': 'search' }}
                value={searchQuery}
                onKeyDown={handleSearch}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isEcLoading}
              />
            </Search>
          )}
          {headerContent && <Box sx={{ mt: 1 }}>{headerContent}</Box>}
        </Box>
      </AppBar>
      {/* ヘッダーの高さ分のオフセット */}
      <ContentOffset showSearch={showSearch} />
      {/* サイドメニュー */}
      <SideMenu
        open={sideMenuOpen}
        onClose={handleMenuClose}
        menuItems={ecGenres}
      />
      {/* アカウントメニュー */}
      <AccountMenu open={accountMenuOpen} onClose={handleAccountMenuClose} />
    </>
  );
};
