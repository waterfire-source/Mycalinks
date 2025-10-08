import React, { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { Box, SxProps, Theme, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useMultipleParamsAsState } from '@/hooks/useMultipleParamsAsState';
import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { toHalfWidthOnly } from '@/utils/convertToHalfWidth';

interface Props {
  sx?: SxProps<Theme>;
  onSearch: () => void;
  setSearchState: Dispatch<SetStateAction<ItemSearchState>>;
  searchState: ItemSearchState;
  isGenreInitialized?: boolean;
}

// 商品検索の検索窓等を定義したコンポーネント。urlにquery形式で入力した内容を保存して、リロード時に再度のその内容で検索できるようにしている。
const SearchFieldWithParams: React.FC<Props> = ({
  sx,
  onSearch,
  searchState,
  setSearchState,
  isGenreInitialized = false,
}) => {
  const [queryParams, setQueryParams] = useMultipleParamsAsState([
    'name',
    'rarity',
    'expansion',
    'cardnumber',
    'categoryId',
    'genreId',
    'currentPage',
    'itemsPerPage',
  ]);

  const [initSearch, setInitSearch] = useState(false);

  const handleSearch = () => {
    onSearch();
    setQueryParams({
      name: searchState.searchName ?? '',
      rarity: searchState.rarity ?? '',
      expansion: searchState.expansion ?? '',
      cardnumber: searchState.cardnumber ?? '',
      categoryId: searchState.selectedCategoryId?.toString() || '',
      genreId: searchState.selectedGenreId?.toString() || '',
      currentPage: '', // 検索ボタンが押された時は0にリセットされる
      itemsPerPage:
        searchState.itemsPerPage !== 30
          ? searchState.itemsPerPage.toString()
          : '',
    });
  };

  // urlを見て、初回の検索に使うべき条件を拾ってくる。
  useEffect(() => {
    // queryParams が指定のキーを持っているかを確認(カスタムフックの初期化時は{}がqueryParamsに入ってるから、実際にurlから値をとってくるまで待つためのif文)
    const hasRequiredKeys =
      Object.keys(queryParams).length === 7 &&
      [
        'name',
        'rarity',
        'expansion',
        'cardnumber',
        'categoryId',
        'genreId',
        'currentPage',
        'itemsPerPage',
      ].every((key) => key in queryParams);

    // queryParamsに実態が初めて入った時にのみ以下のif分に入る。
    if (!initSearch && hasRequiredKeys) {
      // queryParamsのいづれかにnull出ない値が入っていた時、再現すべき検索条件が含まれているのでそれをsearchStateに含める。
      const hasAnyValidParam = Object.values(queryParams).some(
        (value) => value !== null,
      );
      if (hasAnyValidParam) {
        setSearchState((prevState) => ({
          ...prevState,
          searchName: queryParams.name ?? undefined,
          rarity: queryParams.rarity ?? undefined,
          expansion: queryParams.expansion ?? undefined,
          cardnumber: queryParams.modelNumber ?? undefined,
          selectedCategoryId: parseInt(queryParams.categoryId ?? ''),
          selectedGenreId: parseInt(queryParams.genreId ?? ''),
          ...(queryParams.itemsPerPage && {
            itemsPerPage: parseInt(queryParams.itemsPerPage),
          }),
          ...(queryParams.currentPage && {
            currentPage: parseInt(queryParams.currentPage),
          }),
        }));
      } else {
        // 再現すべき検索条件がなければそのまま検索（ただし初期化が完了している場合のみ）
        if (isGenreInitialized) {
          onSearch();
        }
        setInitSearch(true);
      }
    }
  }, [queryParams]);

  // 再現すべき検索条件が存在した時に一回だけ実行される。139行目のカスタムフックで、再現すべき検索条件が存在した場合、initSearchがfalseのままでsearchStateが更新される。これを条件として検索を発火する。
  useEffect(() => {
    if (
      !initSearch &&
      isGenreInitialized &&
      searchState.currentPage === 0 &&
      searchState.itemsPerPage === 30 &&
      (searchState.searchName !== '' ||
        searchState.rarity !== '' ||
        searchState.expansion !== '' ||
        searchState.cardnumber !== '' ||
        searchState.selectedCategoryId !== undefined ||
        searchState.selectedGenreId !== undefined)
    ) {
      onSearch();
      setInitSearch(true);
    }
  }, [
    searchState.searchName,
    searchState.selectedCategoryId,
    searchState.selectedGenreId,
    searchState.rarity,
    searchState.expansion,
    searchState.cardnumber,
    searchState.itemsPerPage,
    searchState.currentPage,
    isGenreInitialized,
  ]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}
    >
      <Box
        sx={{
          flexDirection: 'row',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          ...sx,
        }}
      >
        {/* 商品名検索フィールド */}
        <TextField
          variant="outlined"
          size="small"
          placeholder="商品名"
          value={searchState.searchName}
          type="text"
          onChange={(e) =>
            setSearchState((prev) => ({
              ...prev,
              searchName: e.target.value,
            }))
          }
          sx={{
            flexGrow: 2,
            minWidth: 250,
            backgroundColor: 'common.white',
            '& .MuiInputBase-input': {
              color: 'text.primary',
            },
          }}
        />
        {/* エキスパンション検索フィールド */}
        <TextField
          variant="outlined"
          placeholder="エキスパンション"
          size="small"
          value={searchState.expansion}
          type="text"
          onChange={(e) =>
            setSearchState((prev) => ({
              ...prev,
              expansion: e.target.value,
            }))
          }
          sx={{
            minWidth: 50,
            backgroundColor: 'common.white',
            '& .MuiInputBase-input': {
              color: 'text.primary',
            },
          }}
        />
        {/* 型番検索フィールド */}
        <TextField
          variant="outlined"
          placeholder="型番"
          size="small"
          value={searchState.cardnumber}
          type="text"
          onChange={(e) =>
            setSearchState((prev) => ({
              ...prev,
              cardnumber: toHalfWidthOnly(e.target.value),
            }))
          }
          sx={{
            minWidth: 50,
            backgroundColor: 'common.white',
            '& .MuiInputBase-input': {
              color: 'text.primary',
            },
          }}
        />
        {/* rarity検索フィールド */}
        <TextField
          variant="outlined"
          size="small"
          placeholder="レアリティ"
          value={searchState.rarity}
          type="text"
          onChange={(e) =>
            setSearchState((prev) => ({
              ...prev,
              rarity: e.target.value,
            }))
          }
          sx={{
            minWidth: 50,
            backgroundColor: 'common.white',
            '& .MuiInputBase-input': {
              color: 'text.primary',
            },
          }}
        />
        <PrimaryButtonWithIcon
          type="submit"
          icon={<SearchIcon />}
          onClick={handleSearch}
        >
          検索
        </PrimaryButtonWithIcon>
      </Box>
    </form>
  );
};

export default SearchFieldWithParams;
