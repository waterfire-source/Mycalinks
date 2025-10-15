import { Box, Tooltip, Typography, Zoom } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import NoImg from '@/components/common/NoImg';
import TertiaryButton from '@/components/buttons/TertiaryButton';
import Image from 'next/image';
import { MycaAddItemType } from '@/feature/item/hooks/useMycaCart';
import { mycaItem } from '@/app/api/store/[store_id]/myca-item/api';
import { Item } from '@prisma/client';
import { InfiniteScrollTable } from '@/components/tables/InfiniteScrollTable';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { ItemText } from '@/feature/item/components/ItemText';

type Props = {
  items: Array<mycaItem & { pos_item_id?: Item['id'] }>;
  cartItems: MycaAddItemType[];
  addCart: (newItem: mycaItem & { pos_item_id?: Item['id'] }) => void;
  removeCart: (mycaItemId: number) => void;
  loadMoreItems: () => void;
  hasMore: boolean;
  isLoading: boolean;
  isPackItem?: true; //パックのみかどうか
};

export const SearchResultMycaTable = ({
  items,
  cartItems,
  addCart,
  removeCart,
  loadMoreItems,
  hasMore,
  isLoading,
  isPackItem,
}: Props) => {
  const columns = getColumns(cartItems, addCart, removeCart, isPackItem);

  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        gap: '20px',
        height: '100%',
        width: '100%',
        overflow: 'auto',
      }}
    >
      <InfiniteScrollTable
        columns={columns}
        items={items}
        loadMoreItems={loadMoreItems}
        hasMore={hasMore}
        isLoading={isLoading}
        maxHeight="580px"
      />
    </Box>
  );
};

// カートにアイテムがあるかどうかを確認する関数
const isItemInCart = (
  item: mycaItem & { pos_item_id?: Item['id'] },
  cartItems: MycaAddItemType[],
) => {
  return cartItems.some((cartItem) => cartItem.myca_item_id === item.id);
};

// columnsを関数として定義
const getColumns = (
  cartItems: MycaAddItemType[],
  addCart: (newItem: mycaItem & { pos_item_id?: Item['id'] }) => void,
  removeCart: (mycaItemId: number) => void,
  isPackItem?: true,
): GridColDef[] => {
  const columns: GridColDef[] = [
    {
      field: 'full_image_url',
      headerName: '画像',
      minWidth: 60,
      flex: 0.1,
      renderCell: (params) =>
        params.value ? (
          <Tooltip
            title={
              <Box
                sx={{
                  width: 142,
                  aspectRatio: '0.71',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  src={params.value}
                  alt="product"
                  width={142}
                  height={142}
                  style={{ objectFit: 'contain' }}
                />
              </Box>
            }
            arrow
            TransitionComponent={Zoom}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                src={params.value}
                alt="product"
                width={30}
                height={30}
                style={{ objectFit: 'contain' }}
              />
            </Box>
          </Tooltip>
        ) : (
          <NoImg />
        ),
      headerAlign: 'left',
      align: 'center',
    },
    {
      field: 'displayNameWithMeta',
      headerName: '商品名',
      minWidth: 200,
      maxWidth: 550,
      flex: 0.3,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <ItemText sx={{ maxWidth: 530 }} text={params.value} />
      ),
    },
    {
      field: 'displaytype1',
      headerName: '商品カテゴリ',
      minWidth: 150,
      flex: 0.15,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <Box display="flex" flexDirection="column">
          <Typography>
            {params.value?.includes('カード') ? 'カード' : 'ボックス'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'add_remove',
      headerName: '操作',
      minWidth: 170,
      flex: 0.2,
      renderCell: (params) => {
        const item = params.row;
        const inCart = isItemInCart(item, cartItems);
        return inCart ? (
          <TertiaryButton onClick={() => removeCart(item.id)}>
            削除
          </TertiaryButton>
        ) : (
          <PrimaryButtonWithIcon
            onClick={() => {
              addCart(item);
            }}
          >
            登録リストに追加
          </PrimaryButtonWithIcon>
        );
      },
      headerAlign: 'center',
      align: 'center',
    },
  ];

  // isPackItem が true でない場合のみジャンルを表示
  if (!isPackItem) {
    columns.splice(2, 0, {
      field: 'genre_name',
      headerName: 'ジャンル',
      minWidth: 150,
      flex: 0.15,
      headerAlign: 'left',
      align: 'left',
    });
  }

  return columns;
};
