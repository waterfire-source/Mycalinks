import React, { Dispatch, SetStateAction } from 'react';
import { SxProps, Theme, TextField, Stack } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { toHalfWidthOnly } from '@/utils/convertToHalfWidth';

interface Props {
  sx?: SxProps<Theme>;
  onSearch: () => void;
  setSearchState: Dispatch<SetStateAction<ItemSearchState>>;
  searchState: ItemSearchState;
  additions?: React.ReactNode;
  showRarityField: boolean;
  showExpansionField: boolean;
  showCardnumberField: boolean;
}

// 商品検索の検索窓等を定義したコンポーネント。
export const ItemSearch: React.FC<Props> = ({
  sx,
  onSearch,
  searchState,
  setSearchState,
  additions = null,
  showRarityField,
  showExpansionField,
  showCardnumberField,
}) => {
  const handleSearch = () => {
    // 検索条件のいずれかが空でない場合に検索を実行
    onSearch();
  };

  // 初回の検索は削除（親コンポーネントで制御）
  // useEffect(() => {
  //   onSearch();
  // }, []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        gap="10px"
        sx={{
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
            minWidth: 200,
            backgroundColor: 'common.white',
            '& .MuiInputBase-input': {
              color: 'text.primary',
            },
          }}
        />

        {/* エキスパンション検索フィールド */}
        {showExpansionField && (
          <TextField
            variant="outlined"
            size="small"
            placeholder="エキスパンション"
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
        )}
        {/* 型番検索フィールド */}
        {showCardnumberField && (
          <TextField
            variant="outlined"
            size="small"
            placeholder="型番"
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
        )}
        {/* rarity検索フィールド */}
        {showRarityField && (
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
        )}
        <PrimaryButtonWithIcon
          type="submit"
          startIcon={<SearchIcon />}
          onClick={handleSearch}
        >
          検索
        </PrimaryButtonWithIcon>
        {/* 追加のアクション */}
        {additions}
      </Stack>
    </form>
  );
};
