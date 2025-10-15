import React from 'react';
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { SearchResultMycaTable } from '@/feature/item/components/tables/SearchResultMycaTable';
import { MycaAppGenre } from 'backend-core';
import { MycaAddItemType } from '@/feature/item/hooks/useMycaCart';
import { mycaItem } from '@/app/api/store/[store_id]/myca-item/api';
import { Item } from '@prisma/client';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import SearchIcon from '@mui/icons-material/Search';
import { AddedPack } from '@/feature/item/components/cards/AddedPack';
import { HelpIcon } from '@/components/common/HelpIcon';

interface Props {
  open: boolean;
  onClose: () => void;
  searchState: {
    searchTerm: string;
    selectedCategory: number | null;
    searchResults: (mycaItem & {
      pos_item_id?: Item['id'];
    })[];
    isLoading: boolean;
    hasMore: boolean;
  };
  genres: MycaAppGenre[];
  createPackItem: () => void;
  cartMycaItems: MycaAddItemType[];
  addCartMycaItem: (
    newItem: mycaItem & {
      pos_item_id?: Item['id'];
    },
  ) => void;
  removeCartMycaItem: (mycaItemId: number) => void;
  isLoading: boolean;
  addItemLoading: boolean;
  handleSearchTermChange: (newTerm: string) => void;
  handleCategoryChange: (newCategory: number | null) => void;
  handleSearch: () => void;
  loadMoreItems: () => void;
}

export const MycaPackItemsModal: React.FC<Props> = ({
  open,
  onClose,
  searchState,
  genres,
  createPackItem,
  cartMycaItems,
  addCartMycaItem,
  removeCartMycaItem,
  isLoading,
  handleSearchTermChange,
  handleCategoryChange,
  handleSearch,
  loadMoreItems,
  addItemLoading,
}) => {
  // genre_idとgenres.idを比較してgenre_nameを追加
  const searchResultsWithGenreName = searchState.searchResults.map((result) => {
    const matchedGenre = genres.find((genre) => genre.id === result.genre_id);
    return {
      ...result,
      genre_name: matchedGenre?.display_name || '不明', // 見つからなかった場合は"不明"
    };
  });
  return (
    <CustomModalWithIcon
      open={open}
      onClose={onClose}
      title="指定したBOXに含まれているカードをすべて登録"
      titleInfo={<HelpIcon helpArchivesNumber={176} />}
      width="95%"
      height="85%"
      loading={addItemLoading}
      onActionButtonClick={createPackItem}
      actionButtonText="指定したBOXに含まれるカードの商品を登録する" // 動的に件数を表示
      onCancelClick={onClose}
      cancelButtonText="商品登録をやめる"
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          height: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: '16px',
          }}
        >
          <FormControl
            variant="outlined"
            size="small"
            sx={{
              minWidth: 150,
              backgroundColor: 'common.white',
              '& .MuiInputLabel-root': {
                color: 'text.primary',
              },
            }}
          >
            <InputLabel sx={{ color: 'text.primary' }}>ジャンル</InputLabel>
            <Select
              value={searchState.selectedCategory}
              onChange={(e) =>
                handleCategoryChange(
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              label="ジャンル"
            >
              <MenuItem value={undefined} sx={{ color: 'text.primary' }}>
                <Typography color="text.primary">指定なし</Typography>
              </MenuItem>
              {genres.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.display_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            value={searchState.searchTerm}
            onChange={(e) => handleSearchTermChange(e.target.value)}
            placeholder="商品名"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            sx={{ minWidth: 300, backgroundColor: 'white' }}
            size="small"
          />
          <PrimaryButtonWithIcon onClick={handleSearch} icon={<SearchIcon />}>
            検索
          </PrimaryButtonWithIcon>
        </Box>

        {/* 検索結果とカート */}
        <Grid container spacing={2} sx={{ height: '100%' }}>
          <Grid item xs={9}>
            <SearchResultMycaTable
              items={searchResultsWithGenreName}
              loadMoreItems={loadMoreItems}
              hasMore={searchState.hasMore}
              isLoading={searchState.isLoading || isLoading}
              cartItems={cartMycaItems}
              addCart={addCartMycaItem}
              removeCart={removeCartMycaItem}
              isPackItem={true}
            />
          </Grid>
          <Grid item xs={3}>
            <AddedPack
              rows={cartMycaItems}
              removeCartMycaItem={removeCartMycaItem}
            />
          </Grid>
        </Grid>
      </Box>
    </CustomModalWithIcon>
  );
};
