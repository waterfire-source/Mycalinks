import { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  Typography,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  TextField,
} from '@mui/material';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { SearchResultMycaTable } from '@/feature/item/components/tables/SearchResultMycaTable';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { Item } from '@prisma/client';
import { useStore } from '@/contexts/StoreContext';
import { useInfiniteLoader } from '@/hooks/useInfiniteLoading';
import { useMycaGenres } from '@/feature/item/hooks/useMycaGenres';
import { useMycaCart } from '@/feature/item/hooks/useMycaCart';
import { useSearchMycaItems } from '@/feature/item/hooks/useSearchMycaItems';
import SearchIcon from '@mui/icons-material/Search';
import { mycaItem } from '@/app/api/store/[store_id]/myca-item/api';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { ItemRegisterModal } from '@/feature/consign/components/register/registerMasterModal/RegisterMasterModal';

interface Props {
  open: boolean;
  onClose: () => void;
  setIsRefetchItem: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UnregisteredProductModal = ({
  open,
  onClose,
  setIsRefetchItem,
}: Props) => {
  const { store } = useStore();
  const [isInfiniteLoading, setIsInfiniteLoading] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const { fetchItems, searchParams, setSearchParams } = useSearchMycaItems(
    store.id,
    1000,
  );
  const { genres, fetchMycaGenres } = useMycaGenres();
  const {
    createItem,
    cartMycaItems,
    addCartMycaItem,
    removeCartMycaItem,
    isLoading: addItemLoading,
  } = useMycaCart();

  const {
    items: searchResults,
    isLoading,
    loadMoreItems,
    resetItemsAndSearch,
    hasMore,
    newItems,
  } = useInfiniteLoader({
    fetchItems,
    itemsPerPage: searchParams.itemsPerPage,
    //isPackItemは指定しない
  });

  // `pos_item_id`がないアイテムのみをフィルタリング。検索用のカスタムフックないでフィルタリングを行わず、ここで行なっている理由は、無限スクロールのhasMoreを判定するためにitemPerPageを使うため
  const filteredSearchResults = searchResults.filter(
    (item) => !item.pos_item_id,
  );

  //結果が5件未満なら再検索
  useEffect(() => {
    if (hasMore === false) {
      setIsInfiniteLoading(false);
      return;
    }
    if (newItems.filter((item) => !item.pos_item_id).length < 5) {
      setIsInfiniteLoading(true);
      loadMoreItems(); // 再検索
      return;
    }
    setIsInfiniteLoading(false);
  }, [newItems, hasMore, loadMoreItems]);

  useEffect(() => {
    fetchMycaGenres();
  }, []);

  const handleSearchTermChange = (newTerm: string) => {
    setSearchParams((prev) => ({
      ...prev,
      searchTerm: newTerm,
    }));
  };

  const handleCategoryChange = (newCategory: number | null) => {
    setSearchParams((prev) => ({
      ...prev,
      selectedCategory: newCategory,
    }));
  };

  const handleItemTypeChange = (newItemType: 'ボックス' | 'カード' | null) => {
    setSearchParams((prev) => ({
      ...prev,
      itemType: newItemType,
    }));
  };

  const handleRarityChange = (newRarity: string) => {
    setSearchParams((prev) => ({
      ...prev,
      rarity: newRarity,
    }));
  };

  const handleSearch = () => {
    resetItemsAndSearch();
  };

  // カートにアイテムを追加する
  const addCartMycaItemFromSearchRes = (
    newItem: mycaItem & { pos_item_id?: Item['id']; genre_name?: string },
  ) => {
    addCartMycaItem({
      myca_item_id: newItem.id,
      ...(newItem.pack_id && { myca_pack_id: newItem.pack_id }),
      display_name: newItem.cardname,
      displayNameWithMeta: newItem.displayNameWithMeta,
      ...(newItem.price && { price: newItem.price }),
      ...(newItem.rarity && { rarity: newItem.rarity }),
      ...(newItem.pack && { pack_name: newItem.pack }),
      ...(newItem.full_image_url && { image_url: newItem.full_image_url }),
      ...(newItem.genre_id && { department_id: newItem.genre_id }),
      ...(newItem.displaytype1 && { displaytype1: newItem.displaytype1 }),
      ...(newItem.genre_name && { genre_name: newItem.genre_name }),
    });
  };

  // Mycaから新しいアイテムを作成
  const createItemFromMyca = async () => {
    if (!store) return;

    try {
      await createItem(store.id);
      onClose();
      setIsRefetchItem(true);
    } catch (error) {
      console.error('Item creation failed:', error);
    }
  };

  // モーダルを開いた直後の初回検索(初回検索をしたくないコンポーネントがありそうだからカスタムフックでは作らないでおいた。)
  useEffect(() => {
    if (open) {
      resetItemsAndSearch();
    }
  }, [open]);

  // genre_idとgenres.idを比較してgenre_nameを追加
  const searchResultsWithGenreName = filteredSearchResults.map((result) => {
    const matchedGenre = genres.find((genre) => genre.id === result.genre_id);
    return {
      ...result,
      genre_name: matchedGenre?.display_name || '不明', // 見つからなかった場合は"不明"
    };
  });

  return (
    <>
      <CustomModalWithIcon
        open={open}
        onClose={onClose}
        title="未登録商品登録"
        width="95%"
        height="80%"
        loading={addItemLoading}
        onActionButtonClick={createItemFromMyca}
        actionButtonText={`${cartMycaItems.length}商品を登録`}
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
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', gap: '16px' }}>
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
                  value={searchParams.selectedCategory}
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

              <FormControl
                variant="outlined"
                size="small"
                sx={{
                  minWidth: 150,
                  backgroundColor: 'common.white',
                  '& .MuiInputLabel-root': { color: 'text.primary' },
                }}
              >
                <InputLabel sx={{ color: 'text.primary' }}>
                  商品カテゴリ
                </InputLabel>
                <Select
                  value={searchParams.itemType}
                  onChange={(e) =>
                    handleItemTypeChange(
                      e.target.value === ''
                        ? null
                        : (e.target.value as 'ボックス' | 'カード'),
                    )
                  }
                  label="商品カテゴリ"
                >
                  <MenuItem value="" sx={{ color: 'text.primary' }}>
                    <Typography color="text.primary">指定なし</Typography>
                  </MenuItem>
                  <MenuItem value="ボックス">ボックス</MenuItem>
                  <MenuItem value="カード">カード</MenuItem>
                </Select>
              </FormControl>

              <TextField
                value={searchParams.rarity}
                onChange={(e) => handleRarityChange(e.target.value)}
                placeholder="レアリティ"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                sx={{ minWidth: 150, backgroundColor: 'white' }}
                size="small"
              />

              <TextField
                value={searchParams.searchTerm}
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
              <PrimaryButtonWithIcon
                onClick={handleSearch}
                icon={<SearchIcon />}
              >
                検索
              </PrimaryButtonWithIcon>
            </Box>
            <SecondaryButtonWithIcon
              onClick={() => {
                setIsRegisterModalOpen(true);
                setIsRefetchItem(false);
              }}
              sx={{
                whiteSpace: 'nowrap',
                minWidth: 'auto',
              }}
            >
              独自商品から商品マスタ作成
            </SecondaryButtonWithIcon>
          </Box>

          <Grid
            container
            spacing={2}
            sx={{
              height: '100%',
              paddingLeft: 2,
              marginTop: 1,
            }}
          >
            <SearchResultMycaTable
              items={searchResultsWithGenreName}
              loadMoreItems={loadMoreItems}
              hasMore={hasMore}
              isLoading={isInfiniteLoading || isLoading}
              cartItems={cartMycaItems}
              addCart={addCartMycaItemFromSearchRes}
              removeCart={removeCartMycaItem}
            />
          </Grid>
        </Box>
      </CustomModalWithIcon>
      {/* 独自商品マスタ作成 */}
      <ItemRegisterModal
        open={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onCloseUnregisteredProductModal={onClose}
        setIsRefetchItem={setIsRefetchItem}
      />
    </>
  );
};
