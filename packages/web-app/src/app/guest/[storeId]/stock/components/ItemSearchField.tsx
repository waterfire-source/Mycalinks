import { Box, SxProps, TextField, Theme, useMediaQuery } from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { InfiniteItemSearchState } from '@/feature/item/hooks/useInfiniteItemSearch';
import { useMultipleParamsAsState } from '@/hooks/useMultipleParamsAsState';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import SelectionButtonGroup from '@/components/inputFields/SelectionButtonGroup';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';
import {
  ChangeFindOptionType,
  FindOptionType,
} from '@/feature/item/hooks/useSearchItemByFindOption';
import { FindOptionSelect } from '@/feature/item/components/select/FindOptionSelect';

interface Props {
  sx?: SxProps<Theme>;
  onSearch: () => void;
  setSearchState: Dispatch<SetStateAction<InfiniteItemSearchState>>;
  searchState: InfiniteItemSearchState;
  storeId: number;
  selectedFindOption: FindOptionType[];
  handleChangeFindOption: (values: ChangeFindOptionType) => void;
  cardCategoryId?: number;
}

export const ItemSearchField = ({
  sx,
  onSearch,
  searchState,
  setSearchState,
  storeId,
  selectedFindOption,
  handleChangeFindOption,
  cardCategoryId,
}: Props) => {
  const [queryParams, setQueryParams] = useMultipleParamsAsState([
    'name',
    'rarity',
    'cardNumber',
    'genreId',
    'hasStock',
    'currentPage',
    'itemsPerPage',
  ]);

  const [selectedStockOption, setSelectedStockOption] = useState<number>(1);

  useEffect(() => {
    // `queryParams.hasStock` が 'true' の場合、「在庫あり」を選択
    setSelectedStockOption(queryParams.hasStock === 'true' ? 0 : 1);
  }, [queryParams.hasStock]);

  // 「在庫あり」「すべて」を変更した場合の検索処理
  const handleSelection = (index: number) => {
    if (searchState.isLoading) return;

    window.scrollTo({ top: 0, behavior: 'smooth' });

    const hasStock = index === 0 ? true : undefined;

    setSelectedStockOption(index);

    setSearchState((prev) => ({
      ...prev,
      hasStock: hasStock,
      searchResults: [],
      currentPage: 1,
    }));

    setQueryParams({
      name: searchState.searchName ?? '',
      rarity: searchState.rarity ?? '',
      cardnumber: searchState.cardNumber ?? '',
      genreId: searchState.selectedGenreId?.toString() || '',
      hasStock: hasStock ? 'true' : '',
      currentPage: '',
      itemsPerPage:
        searchState.itemsPerPage !== 30
          ? searchState.itemsPerPage.toString()
          : '',
    });
  };

  // 検索ボタンクリック時の検索処理
  const handleSearch = () => {
    // 画面を上部にスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setQueryParams({
      name: searchState.searchName ?? '',
      rarity: searchState.rarity ?? '',
      cardnumber: searchState.cardNumber ?? '',
      genreId: searchState.selectedGenreId?.toString() || '',
      ...(searchState.hasStock ? { hasStock: 'true' } : { hasStock: '' }),
      currentPage: '',
      itemsPerPage:
        searchState.itemsPerPage !== 30
          ? searchState.itemsPerPage.toString()
          : '',
    });

    // 検索状態をリセット（カードリストのリセット）
    setSearchState((prev) => ({
      ...prev,
      searchResults: [],
      currentPage: 1,
    }));

    onSearch();
  };

  // レスポンシブ対応
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', ...sx }}>
      {/* 1行目: 検索項目（商品名、型番、レアリティ） */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: isTablet ? 'wrap' : 'nowrap',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        <TextField
          variant="outlined"
          size="small"
          placeholder="商品名"
          value={searchState.searchName ?? ''}
          type="text"
          onChange={(e) =>
            setSearchState((prev) => ({ ...prev, searchName: e.target.value }))
          }
          sx={{ flex: 1, minWidth: 150, backgroundColor: 'common.white' }}
        />
        <TextField
          variant="outlined"
          placeholder="エキスパンション+型番"
          size="small"
          value={searchState.cardNumber ?? ''}
          type="text"
          onChange={(e) =>
            setSearchState((prev) => ({
              ...prev,
              cardNumber: e.target.value,
            }))
          }
          sx={{ flex: 1, minWidth: 150, backgroundColor: 'common.white' }}
        />
        <TextField
          variant="outlined"
          size="small"
          placeholder="レアリティ"
          value={searchState.rarity ?? ''}
          type="text"
          onChange={(e) =>
            setSearchState((prev) => ({
              ...prev,
              rarity: e.target.value,
            }))
          }
          sx={{ flex: 1, minWidth: 150, backgroundColor: 'common.white' }}
        />

        {/* 画面サイズが大きい場合は検索ボタンを1行目に配置 */}
        {!isTablet && (
          <Box sx={{ flexShrink: 0 }}>
            <PrimaryButtonWithIcon
              type="submit"
              icon={<SearchIcon />}
              onClick={handleSearch}
            >
              検索
            </PrimaryButtonWithIcon>
          </Box>
        )}
      </Box>

      {/* 2行目: 小さい画面では検索ボタンを2行目に配置 */}
      {isTablet && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <PrimaryButtonWithIcon
            type="submit"
            icon={<SearchIcon />}
            onClick={handleSearch}
          >
            検索
          </PrimaryButtonWithIcon>
        </Box>
      )}

      {/* 3行目: FindOption,在庫有無 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <FindOptionSelect
          storeID={storeId}
          selectedGenreId={searchState.selectedGenreId}
          selectedCategoryId={searchState.selectedCategoryId}
          selectedFindOption={selectedFindOption}
          handleChangeFindOption={handleChangeFindOption}
          cardCategoryId={cardCategoryId}
        />
        <SelectionButtonGroup
          labels={['在庫あり', 'すべて']}
          onClick={handleSelection}
          initialSelectedIndex={selectedStockOption}
          disabled={searchState.isLoading}
        />
      </Box>
    </Box>
  );
};
