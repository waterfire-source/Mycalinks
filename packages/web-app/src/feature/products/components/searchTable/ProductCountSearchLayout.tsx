// 商品検索レイアウトコンポーネント
import { useEffect, FC, SetStateAction, Dispatch, ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';
import { ItemSearch } from '@/feature/item/components/search/ItemSearch';
import { GenreTabComponent } from '@/components/tabs/GenreTabComponent';
import { CategorySelectOnServer } from '@/feature/products/components/searchTable/CategorySelectOnServer';
import { palette } from '@/theme/palette';
import { ItemSortSelect } from '@/feature/products/components/searchTable/ItemSortSelect';
import { SpecialtySelect } from '@/feature/specialty/components/SpecialtySelect';
import { Specialties } from '@/feature/specialty/hooks/useGetSpecialty';
import { ManagementNumberCheck } from '@/feature/products/components/ManagementNumberCheck';

// コンポーネントのプロップスの型定義
interface Props {
  width: string;
  height: string;
  contentsHeight?: string;
  leftWidth?: string; // 商品テーブルの幅
  rightWidth?: string; // 検索結果の幅
  searchState: ItemSearchState;
  setSearchState: Dispatch<SetStateAction<ItemSearchState>>;
  onSearch: () => void;
  addSearchResult: (itemSearchState: ItemSearchState) => void;
  currentPage?: number;
  tableComponent: (
    searchState: ItemSearchState,
    setSearchState: Dispatch<SetStateAction<ItemSearchState>>,
  ) => React.ReactNode;
  resultComponent: ReactNode;
  resetItems: () => void;
  resultHeaderComponent?: ReactNode;
  //  特殊状態
  showSpecialtySelect?: boolean;
  specialties?: Specialties;
  selectedSpecialtyId?: number;
  setSelectedSpecialtyId?: (specialtyId: number | undefined) => void;
  // 管理番号
  showManagementNumberCheck?: boolean;
  enableManagementNumber?: boolean;
  setEnableManagementNumber?: (enable: boolean) => void;
  // Header右端のボタン
  rightHeaderButton?: ReactNode;
  isRefetchItem?: boolean;
}

// ProductCountSearchLayoutコンポーネントの定義
export const ProductCountSearchLayout: FC<Props> = ({
  height,
  contentsHeight = 'calc(100vh - 380px)',
  leftWidth = '60%',
  rightWidth = '38%',
  searchState,
  setSearchState,
  onSearch,
  addSearchResult,
  currentPage = 0,
  tableComponent,
  resultComponent,
  resetItems,
  resultHeaderComponent,
  showSpecialtySelect = false,
  specialties,
  selectedSpecialtyId,
  setSelectedSpecialtyId,
  showManagementNumberCheck = false,
  enableManagementNumber = false,
  setEnableManagementNumber,
  rightHeaderButton,
  isRefetchItem = false,
}: Props) => {
  useEffect(() => {
    // 検索した時に新しい商品を追加
    addSearchResult(searchState);
  }, [searchState.itemsPerPage, searchState.searchResults]);

  // 検索ハンドラ
  const handleSearch = () => {
    resetItems();
    onSearch();
  };

  // ジャンル、カテゴリ、並び順が変更されたら再検索をかける
  useEffect(() => {
    handleSearch();
  }, [
    searchState.selectedGenreId,
    searchState.selectedCategoryId,
    searchState.orderBy,
  ]);

  // 追加の商品を読み込む
  useEffect(() => {
    setSearchState((prev) => ({
      ...prev,
      currentPage: currentPage,
    }));
    addSearchResult(searchState);
  }, [currentPage]);

  // 任意のタイミングで再取得
  useEffect(() => {
    if (isRefetchItem) {
      onSearch();
    }
  }, [isRefetchItem]);

  // UIのレンダリング
  return (
    <Stack width="100%" height={height} gap="12px">
      <Stack
        width="100%"
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <Stack width={leftWidth}>
          {/* 検索フォーム */}
          <ItemSearch
            searchState={searchState}
            onSearch={handleSearch}
            setSearchState={setSearchState}
            showRarityField={true}
            showExpansionField={true}
            showCardnumberField={true}
          />
        </Stack>
        <Box width={rightWidth}>{resultHeaderComponent}</Box>
        {rightHeaderButton}
      </Stack>
      {/* 商品テーブル */}
      <Stack direction="row" width="100%" gap="12px" height={contentsHeight}>
        <Stack height="100%" width={leftWidth}>
          <GenreTabComponent setSearchState={setSearchState} />
          <Stack
            direction="row"
            gap="12px"
            py="8px"
            px="12px"
            justifyContent="space-between"
            sx={{
              backgroundColor: palette.common.white,
              borderRadius: '1px',
              borderBottom: `1px solid ${palette.grey[300]}`,
            }}
          >
            <Stack direction="row" gap="12px" alignItems="center">
              <CategorySelectOnServer
                onSelect={(e) =>
                  setSearchState((prevState) => ({
                    ...prevState,
                    selectedCategoryId: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                    currentPage: 0, // ページリセット
                  }))
                }
              />
              {/* 特殊状態のセレクトボックス */}
              {showSpecialtySelect && specialties && (
                <SpecialtySelect
                  sx={{ minWidth: '120px' }}
                  specialties={specialties}
                  selectedSpecialtyId={selectedSpecialtyId}
                  onSelect={(e) => {
                    if (e.target.value) {
                      setSelectedSpecialtyId?.(Number(e.target.value));
                    } else {
                      setSelectedSpecialtyId?.(undefined);
                    }
                  }}
                />
              )}
              {showManagementNumberCheck && (
                <ManagementNumberCheck
                  checked={enableManagementNumber}
                  onChange={() =>
                    setEnableManagementNumber?.(!enableManagementNumber)
                  }
                />
              )}
            </Stack>
            <Stack direction="row" gap="12px" alignItems="center">
              <Typography>並び替え</Typography>
              <ItemSortSelect setSearchState={setSearchState} />
            </Stack>
          </Stack>
          <Box width="100%" height={`calc(${contentsHeight} - 100px)`}>
            {tableComponent(searchState, setSearchState)}
          </Box>
        </Stack>
        <Box width={rightWidth} height={contentsHeight}>
          {resultComponent}
        </Box>
      </Stack>
    </Stack>
  );
};
