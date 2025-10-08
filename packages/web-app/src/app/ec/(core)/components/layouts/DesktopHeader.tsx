'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Badge,
  Box,
  Button,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  AccountCircle,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import Image from 'next/image';
import { MycaAppGenre } from 'backend-core';
import { createClientAPI } from '@/api/implement';
import { PATH } from '@/app/ec/(core)/constants/paths';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { AccountMenu } from '@/app/ec/(core)/components/layouts/AccountMenu';
import { useEcLoading } from '@/app/ec/(core)/contexts/EcLoadingContext';
import { useCart } from '@/app/ec/(core)/hooks/useCart';
import { EcSessionStorageManager } from '@/app/ec/(core)/utils/sessionStorage';
import { CategorySelectModal } from '@/app/ec/(core)/components/modals/CategorySelectModal';
import { useAppAuth } from '@/providers/useAppAuth';
import { Typography } from '@mui/material';
import {
  getAllGenreNames,
  getGenreMenuConfig,
} from '@/app/ec/(core)/constants/genreMenus';
import { GenreDropdownMenu } from '@/app/ec/(core)/components/menus/GenreDropdownMenu';
import { useHeader } from '@/app/ec/(core)/contexts/HeaderContext';

// PC版検索ボックスのスタイル
const DesktopSearch = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.95),
  border: '1px solid',
  borderColor: alpha(theme.palette.grey[400], 0.8),
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(1),
  width: '100%',
  display: 'flex',
  alignItems: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(1)})`,
    transition: theme.transitions.create('width'),
  },
}));

// ジャンルドロップダウンメニューのスタイル
const GenreButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1, 2),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
}));

// 2段目のジャンルメニューボタンのスタイル
const GenreMenuButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  textTransform: 'none',
  padding: theme.spacing(1.5, 2.5),
  minWidth: 'auto',
  fontSize: '0.9rem',
  fontWeight: '500',
  borderRadius: theme.spacing(3), // 角丸を追加
  border: '2px solid transparent',
  position: 'relative',
  transition: 'all 0.3s ease',

  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateY(-1px)',
  },
  '&.active': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    fontWeight: '600',
  },
}));

export const DesktopHeader = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  // アカウントメニューの開閉状態
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  // カテゴリ選択モーダルの開閉状態
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  // プルダウンメニューの状態管理
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [activeGenreId, setActiveGenreId] = useState<number | null>(null);

  // ジャンル一覧の状態管理
  const [ecGenres, setEcGenres] = useState<MycaAppGenre[]>([]);

  // 選択中のジャンルの状態管理
  const [selectedGenre, setSelectedGenre] = useState<MycaAppGenre | null>(null);

  // 検索クエリの状態管理
  const [searchQuery, setSearchQuery] = useState('');

  // ローディング
  const { isEcLoading } = useEcLoading();

  // カートコンテキスト
  const { cartItemCount } = useCart();

  // ヘッダーコンテンツ
  const { headerContent } = useHeader();

  // アプリ認証
  const { getAccountInfo } = useAppAuth();

  // アカウント情報の状態管理
  const [accountInfo, setAccountInfo] = useState<{
    display_name: string;
    mail: string;
  } | null>(null);

  // セッションストレージのキー名（1時間有効）
  const EC_SEARCH_CATEGORY_KEY = 'ec_search_selected_category';
  const EC_SEARCH_CATEGORY_TIMESTAMP_KEY = 'ec_search_category_timestamp';
  const CATEGORY_CACHE_DURATION = 60 * 60 * 1000; // 1時間（ミリ秒）

  // カテゴリをセッションストレージに保存
  const saveSelectedCategory = useCallback(
    (genre: MycaAppGenre) => {
      const timestamp = Date.now();
      sessionStorage.setItem(EC_SEARCH_CATEGORY_KEY, JSON.stringify(genre));
      sessionStorage.setItem(
        EC_SEARCH_CATEGORY_TIMESTAMP_KEY,
        timestamp.toString(),
      );
    },
    [EC_SEARCH_CATEGORY_KEY, EC_SEARCH_CATEGORY_TIMESTAMP_KEY],
  );

  // セッションストレージからカテゴリを復元
  const loadSelectedCategory = useCallback((): MycaAppGenre | null => {
    try {
      const savedCategory = sessionStorage.getItem(EC_SEARCH_CATEGORY_KEY);
      const timestamp = sessionStorage.getItem(
        EC_SEARCH_CATEGORY_TIMESTAMP_KEY,
      );

      if (!savedCategory || !timestamp) {
        return null;
      }

      const savedTime = parseInt(timestamp, 10);
      const currentTime = Date.now();

      // 1時間以上経過している場合は無効
      if (currentTime - savedTime > CATEGORY_CACHE_DURATION) {
        sessionStorage.removeItem(EC_SEARCH_CATEGORY_KEY);
        sessionStorage.removeItem(EC_SEARCH_CATEGORY_TIMESTAMP_KEY);
        return null;
      }

      return JSON.parse(savedCategory) as MycaAppGenre;
    } catch (error) {
      console.error('Failed to load selected category:', error);
      return null;
    }
  }, [
    EC_SEARCH_CATEGORY_KEY,
    EC_SEARCH_CATEGORY_TIMESTAMP_KEY,
    CATEGORY_CACHE_DURATION,
  ]);

  // アカウントメニューの開閉処理
  const handleAccountMenuOpen = () => {
    setAccountMenuOpen(true);
  };

  const handleAccountMenuClose = () => {
    setAccountMenuOpen(false);
  };

  // プルダウンメニューを開く
  const handleGenreMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    genreId: number,
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveGenreId(genreId);
  };

  // プルダウンメニューを閉じる
  const handleGenreMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveGenreId(null);
  };

  // 検索実行処理
  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      performSearch();
    }
  };

  // 検索実行処理（共通）
  const performSearch = () => {
    // カテゴリが選択されていない場合はモーダルを表示
    if (!selectedGenre) {
      setCategoryModalOpen(true);
      return;
    }

    const urlParams = new URLSearchParams();

    // 検索クエリがある場合は追加
    if (searchQuery.trim()) {
      urlParams.set('name', searchQuery.trim());
    }

    // 在庫ありフラグを追加
    urlParams.set('hasStock', 'true');

    // SessionStorageをクリア（新しいジャンルに移動するため）
    EcSessionStorageManager.clear();

    // 選択されたジャンルのページに遷移
    router.push(
      `${PATH.ITEMS.genre(String(selectedGenre.id))}?${urlParams.toString()}`,
    );
  };

  // カテゴリ選択処理（モーダル）
  const handleCategorySelect = (genre: MycaAppGenre) => {
    setSelectedGenre(genre);
    saveSelectedCategory(genre); // セッションストレージに保存
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

  // URLの変更を監視して検索クエリとカテゴリを初期化
  useEffect(() => {
    const name = searchParams.get('name');
    setSearchQuery(name || '');

    // URLがジャンルページの場合、そのジャンルを選択
    if (params.genre && ecGenres.length > 0) {
      const genreId = parseInt(params.genre as string, 10);
      const matchedGenre = ecGenres.find((genre) => genre.id === genreId);
      if (matchedGenre && selectedGenre?.id !== genreId) {
        setSelectedGenre(matchedGenre);
        saveSelectedCategory(matchedGenre); // セッションストレージにも保存
      }
    }
  }, [searchParams, params, ecGenres, selectedGenre, saveSelectedCategory]);

  // ジャンル一覧の取得と保存されたカテゴリの復元
  useEffect(() => {
    const fetchEcGenre = async () => {
      try {
        const clientAPI = createClientAPI();
        const result = await clientAPI.ec.getEcGenre();
        if ('genres' in result) {
          setEcGenres(result.genres);

          // セッションストレージから保存されたカテゴリを復元
          const savedCategory = loadSelectedCategory();
          if (savedCategory) {
            // 取得したジャンル一覧に保存されたカテゴリが存在するかチェック
            const matchedGenre = result.genres.find(
              (genre) => genre.id === savedCategory.id,
            );
            if (matchedGenre) {
              setSelectedGenre(matchedGenre);
            } else {
              // 存在しない場合はセッションストレージをクリア
              sessionStorage.removeItem(EC_SEARCH_CATEGORY_KEY);
              sessionStorage.removeItem(EC_SEARCH_CATEGORY_TIMESTAMP_KEY);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      }
    };
    fetchEcGenre();
  }, [loadSelectedCategory]);

  // アカウント情報の取得
  useEffect(() => {
    const fetchAccountInfo = async () => {
      try {
        const accountData = await getAccountInfo();
        if (
          accountData &&
          'display_name' in accountData &&
          'mail' in accountData &&
          accountData.display_name &&
          accountData.mail
        ) {
          setAccountInfo({
            display_name: accountData.display_name,
            mail: accountData.mail,
          });
        }
      } catch (error) {
        console.error('Failed to fetch account info:', error);
        // エラー時はアカウント情報を表示しない（ログイン済みでない可能性）
        setAccountInfo(null);
      }
    };

    fetchAccountInfo();
  }, [getAccountInfo]);

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
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: '80px' }}>
          {/* 左側: ロゴ */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Image
              src="/images/logo/mallLogo.png"
              alt="mall logo"
              height={50}
              width={100}
              onClick={() => router.push(PATH.TOP)}
              style={{ cursor: 'pointer' }}
            />
          </Box>

          {/* 中央: ジャンルメニュー + 検索 */}
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, mx: 1 }}>
            {/* カテゴリ選択ボタン */}
            <GenreButton
              endIcon={<ExpandMoreIcon />}
              onClick={() => setCategoryModalOpen(true)}
              disabled={isEcLoading}
              sx={{
                minWidth: '200px',
                color: selectedGenre ? 'inherit' : 'primary.main',
                fontWeight: selectedGenre ? 'normal' : 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              {selectedGenre && (
                <Box
                  component="img"
                  src={
                    selectedGenre.single_genre_image || '/images/ec/noimage.png'
                  }
                  alt={selectedGenre.display_name}
                  sx={{ width: 32, height: 32, objectFit: 'contain' }}
                />
              )}
              {selectedGenre ? selectedGenre.display_name : 'カテゴリ'}
            </GenreButton>

            {/* 検索ボックス */}
            <DesktopSearch>
              <StyledInputBase
                placeholder="商品名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
            </DesktopSearch>

            {/* 検索ボタン */}
            <Button
              variant="contained"
              onClick={performSearch}
              disabled={isEcLoading}
              sx={{
                height: '40px',
                ml: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <SearchIcon />
            </Button>
          </Box>

          {/* 右側: アカウント情報 + カート + アカウント */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
            {/* アカウント情報表示 */}
            {accountInfo && (
              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' }, // モバイルでは非表示
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  cursor: 'pointer',
                }}
                onClick={handleAccountMenuOpen}
              >
                <Typography
                  variant="caption"
                  sx={{
                    lineHeight: 1.2,
                    fontSize: '0.75rem',
                  }}
                >
                  {accountInfo.display_name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    lineHeight: 1.2,
                    fontSize: '0.75rem',
                  }}
                >
                  {accountInfo.mail}
                </Typography>
              </Box>
            )}

            {/* アカウントアイコン */}
            <IconButton
              size="large"
              color="inherit"
              onClick={handleAccountMenuOpen}
              disabled={isEcLoading}
            >
              <AccountCircle />
            </IconButton>

            {/* カートアイコン */}
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
          </Box>
        </Toolbar>

        {/* 2段目: ジャンル一覧 */}
        <Box
          sx={{
            bgcolor: 'primary.main',
            px: 2,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              overflowX: 'auto',
              overflowY: 'hidden',
              justifyContent: 'flex-start',
              minHeight: '48px',
              // スクロールバーのスタイリング
              '&::-webkit-scrollbar': {
                height: 6,
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: 3,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                },
              },
              // Firefox用のスクロールバー
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(0, 0, 0, 0.2) transparent',
            }}
          >
            {getAllGenreNames().map((genre) => (
              <GenreMenuButton
                key={genre.id}
                onClick={(event) => handleGenreMenuOpen(event, genre.id)}
                endIcon={<ExpandMoreIcon />}
                sx={{
                  color:
                    activeGenreId === genre.id
                      ? 'primary.contrastText'
                      : 'primary.contrastText',
                  fontWeight: activeGenreId === genre.id ? 'bold' : 'normal',
                  flexShrink: 0, // ボタンが縮まないようにする
                  opacity: activeGenreId === genre.id ? 1 : 0.9,
                }}
              >
                {genre.name}
              </GenreMenuButton>
            ))}
          </Box>
        </Box>

        {/* 3段目: ヘッダーコンテンツ（動的に表示） */}
        {headerContent && (
          <Box
            sx={{
              bgcolor: 'white',
              px: 2,
              py: 1,
            }}
          >
            {headerContent}
          </Box>
        )}
      </AppBar>

      {/* ヘッダーの高さ分のオフセット（動的に調整） */}
      <Box sx={{ height: headerContent ? '180px' : '117px' }} />

      {/* アカウントメニュー */}
      <AccountMenu open={accountMenuOpen} onClose={handleAccountMenuClose} />

      {/* ジャンル別プルダウンメニュー */}
      <GenreDropdownMenu
        open={Boolean(menuAnchorEl) && activeGenreId !== null}
        anchorEl={menuAnchorEl}
        onClose={handleGenreMenuClose}
        menuConfig={
          activeGenreId ? getGenreMenuConfig(activeGenreId) || null : null
        }
      />

      {/* カテゴリ選択モーダル */}
      <CategorySelectModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        genres={ecGenres}
        onSelect={handleCategorySelect}
      />
    </>
  );
};
