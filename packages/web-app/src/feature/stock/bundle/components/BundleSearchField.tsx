import React, { useEffect, Dispatch, SetStateAction } from 'react';
import { TextField, Button, Stack } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';

interface Props {
  onSearch: () => void;
  setSearchState: Dispatch<SetStateAction<ItemSearchState>>;
  searchState: ItemSearchState;
}

// 商品検索の検索窓等を定義したコンポーネント。
export const BundleSearchField: React.FC<Props> = ({
  onSearch,
  searchState,
  setSearchState,
}) => {
  const handleSearch = () => {
    // 検索条件のいずれかが空でない場合に検索を実行
    onSearch();
  };

  // 初回の検索
  useEffect(() => {
    onSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}
    >
      <Stack direction="row" alignItems="center" gap="10px">
        {/* 商品名検索フィールド */}
        <TextField
          variant="outlined"
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
            height: '40px',
            width: '300px',
            backgroundColor: 'common.white',
            '& .MuiInputBase-input': {
              color: 'text.primary',
              padding: '8px 12px',
            },
          }}
        />
        {/* 型番検索フィールド */}
        <TextField
          variant="outlined"
          placeholder="型番"
          value={searchState.cardnumber}
          type="text"
          onChange={(e) =>
            setSearchState((prev) => ({
              ...prev,
              cardnumber: e.target.value,
            }))
          }
          sx={{
            height: '40px',
            width: '100px',
            backgroundColor: 'common.white',
            '& .MuiInputBase-input': {
              color: 'text.primary',
              padding: '8px 12px',
            },
          }}
        />
        {/* タグ検索フィールド */}
        <TextField
          variant="outlined"
          placeholder="タグ"
          value={searchState.cardnumber}
          type="text"
          onChange={(e) =>
            setSearchState((prev) => ({
              ...prev,
              cardnumber: e.target.value,
            }))
          }
          sx={{
            height: '40px',
            width: '100px',
            backgroundColor: 'common.white',
            '& .MuiInputBase-input': {
              height: '100%',
              color: 'text.primary',
              padding: '8px 12px',
            },
          }}
        />
        <Button
          variant="contained"
          type="submit"
          size="large"
          sx={{
            height: '40px',
            padding: '8px 12px',
            backgroundColor: 'primary.main',
            whiteSpace: 'nowrap',
          }}
          startIcon={<SearchIcon />}
          onClick={handleSearch}
        >
          検索
        </Button>
      </Stack>
    </form>
  );
};
