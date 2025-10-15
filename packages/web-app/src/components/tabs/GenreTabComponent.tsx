import { Box, Tabs } from '@mui/material';
import { useEffect, useState } from 'react';
import { useGenre } from '@/feature/genre/hooks/useGenre';
import { CustomTabTableStyle } from '@/components/tabs/CustomTabTableStyle';

// 汎用的な状態の型定義
interface BaseSearchState {
  currentPage?: number;
}

interface ItemSearchState extends BaseSearchState {
  selectedGenreId?: number | null;
}

interface ProductSearchState extends BaseSearchState {
  itemGenreId?: number | null;
}

type SearchState = ItemSearchState | ProductSearchState;

interface Props<T extends SearchState> {
  setSearchState: React.Dispatch<React.SetStateAction<T>>;
  disableInitialization?: boolean;
  ecAvailable?: boolean;
}

function isProductSearchState(state: SearchState): state is ProductSearchState {
  return 'itemGenreId' in state;
}

export const GenreTabComponent = <T extends SearchState>({
  setSearchState,
  disableInitialization = false,
  ecAvailable = false,
}: Props<T>) => {
  const { genre, fetchGenreList } = useGenre(false, ecAvailable);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    fetchGenreList();
  }, [fetchGenreList]);

  // ジャンルの初期化ロジック：ジャンルが取得できたら最初のジャンルを選択（一度だけ）
  useEffect(() => {
    if (!disableInitialization) {
      setSearchState((prev) => {
        if (isProductSearchState(prev)) {
          return {
            ...prev,
            currentPage: 0,
          } as T;
        } else {
          return {
            ...prev,
            currentPage: 0,
          } as T;
        }
      });

      setTabIndex(0); // 最初のジャンルタブに設定
    }
  }, [genre?.itemGenres, setSearchState, disableInitialization]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);

    // 「すべて」の場合 undefined を、それ以外なら選択されたジャンルの id をセット
    const isAllTab = newValue === 0;
    const selectedGenreId: number | undefined = isAllTab
      ? undefined
      : genre?.itemGenres[newValue - 1]?.id;

    setSearchState((prevState) => {
      if (isProductSearchState(prevState)) {
        return {
          ...prevState,
          itemGenreId: selectedGenreId,
          currentPage: 0,
        } as T;
      } else {
        return {
          ...prevState,
          selectedGenreId: selectedGenreId,
          currentPage: 0,
        } as T;
      }
    });
  };

  return (
    <>
      {/* タブの表示 */}
      <Box
        sx={{
          borderBottom: '8px solid #b82a2a',
          display: 'flex',
          alignItems: 'center',
          padding: 0,
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="scrollable" // 横スクロールを有効化
          allowScrollButtonsMobile // モバイル対応
          sx={{
            margin: 0,
            padding: 0,
            minHeight: '31px',
            '& .MuiTabs-scrollButtons': {
              display: 'none', // スクロールボタンを完全に非表示
            },
          }}
        >
          <CustomTabTableStyle label={<Box>すべて</Box>} />
          {genre?.itemGenres.map(
            (itemGenre: { id: number; display_name: string }) => (
              <CustomTabTableStyle
                key={itemGenre.id}
                label={<Box>{itemGenre.display_name}</Box>}
              />
            ),
          )}
        </Tabs>
      </Box>
    </>
  );
};
