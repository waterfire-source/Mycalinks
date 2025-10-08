import { Grid, Box, Typography, Checkbox, Stack, Modal } from '@mui/material';
import { Product, Transaction_Cart } from '@prisma/client';
import { usePathname } from 'next/navigation';
import { PATH } from '@/constants/paths';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { useItems } from '@/feature/item/hooks/useItems';
import { useStore } from '@/contexts/StoreContext';
import { useEffect, useMemo, useState } from 'react';
import { ItemDetailModalContainer } from '@/feature/item/components/modals/ItemDetailModalContainer';
import { useItemSearch } from '@/feature/item/hooks/useItemSearch';
import {
  FormattedItem,
  formatApiResponseToFormattedItem,
} from '@/components/dataGrid/RightClickDataGrid';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';

interface TransactionCartDetailProps {
  transactionCart: {
    product_id: Product['id'];
    product_name: Product['display_name'];
    item_count: Transaction_Cart['item_count'];
    unit_price: Transaction_Cart['unit_price'];
    total_unit_price: Transaction_Cart['total_unit_price'];
    discount_price: Transaction_Cart['discount_price'];
    sale_discount_price: Transaction_Cart['sale_discount_price'];
    total_discount_price: Transaction_Cart['total_discount_price'];
    reservation_price?: Transaction_Cart['reservation_price'];
    reservation_reception_product_id_for_deposit?: Transaction_Cart['reservation_reception_product_id_for_deposit'];
    reservation_reception_product_id_for_receive?: Transaction_Cart['reservation_reception_product_id_for_receive'];
    product_details?: BackendProductAPI[0]['response']['200']['products'][0];
    consignment_commission_unit_price: Transaction_Cart['consignment_commission_unit_price'];
  };
  transactionKind?: string | null;
  checked: boolean;
  onCheckboxChange: () => void;
  setProductId?: React.Dispatch<React.SetStateAction<number | undefined>>;
  setIsDetailModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

//取引した商品の詳細情報をカード形式で表示
export const TransactionCartDetail = ({
  transactionCart,
  transactionKind,
  checked,
  onCheckboxChange,
  setProductId,
  setIsDetailModalOpen,
}: TransactionCartDetailProps) => {
  const {
    product_name,
    unit_price,
    total_unit_price,
    product_details,
    item_count,
    total_discount_price,
    reservation_price,
    consignment_commission_unit_price,
  } = transactionCart;
  const pathname = usePathname(); // 現在のURLパスを取得
  const { store } = useStore();
  const { items } = useItems();
  const [selectedItem, setSelectedItem] = useState<FormattedItem>();
  const [isModalOpen, setModalOpen] = useState(false);
  const { performSearch } = useItemSearch(store.id);

  const isReservationReceive = useMemo(() => {
    if (!transactionCart) return false;
    return !!transactionCart.reservation_reception_product_id_for_receive;
  }, [transactionCart]);

  const totalPrice = useMemo(() => {
    if (isReservationReceive)
      return (
        (total_unit_price ?? unit_price) + Math.abs(reservation_price ?? 0)
      );
    return total_unit_price ?? unit_price;
  }, [isReservationReceive, reservation_price, total_unit_price, unit_price]);

  const onClickImage = (ProductId: number) => {
    if (!setProductId || setIsDetailModalOpen === undefined) return;
    setProductId(ProductId);
    setIsDetailModalOpen(true);
  };
  //itemの結果を整形してstateに格納
  useEffect(() => {
    if (!items) return;
    setSelectedItem(formatApiResponseToFormattedItem(items[0]));
    setModalOpen(true);
  }, [items]);

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <Grid
        container
        spacing={1}
        sx={{
          p: 1,
          borderBottom: '1px solid',
          borderBottomColor: 'grey.200',
          width: '100%',
        }}
      >
        <Grid
          item
          xs={3}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: 2,
            }}
            onClick={
              product_details
                ? () => onClickImage(product_details.id)
                : undefined
            }
          >
            <ItemImage
              imageUrl={product_details?.image_url ?? null}
              height={84}
            />
          </Box>
        </Grid>

        <Grid
          item
          xs={4}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'start',
            justifyContent: 'center',
          }}
        >
          <ItemText text={product_details?.displayNameWithMeta ?? '-'} />
          <Typography variant="body2">
            {product_details?.is_special_price_product
              ? '特価在庫'
              : product_details?.condition_option_display_name}
          </Typography>
        </Grid>

        <Grid
          item
          xs={4}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'start',
            justifyContent: 'center',
          }}
        >
          <Stack gap="12px" direction="row" alignItems="center">
            <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
              単価：
              {unit_price.toLocaleString()}円
            </Typography>
            {total_discount_price ? (
              <>
                <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                  {transactionKind === 'buy' ? '割増' : '割引'}：
                  {Math.abs(total_discount_price).toLocaleString()}円
                </Typography>
              </>
            ) : (
              ''
            )}
          </Stack>
          <Stack gap="12px" direction="row" alignItems="center">
            <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
              数量：{item_count}
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
            商品合計：
            {(totalPrice * item_count).toLocaleString()}円
          </Typography>
          {isReservationReceive && reservation_price && (
            <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
              うち前金：
              {(Math.abs(reservation_price) * item_count).toLocaleString()}円
            </Typography>
          )}
          {product_details?.consignment_client_id && (
            <>
              <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                うち委託手数料：
                {consignment_commission_unit_price.toLocaleString()}円
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                委託先名：{product_details?.consignment_client__full_name ?? ''}
              </Typography>
            </>
          )}
        </Grid>

        <Grid
          item
          xs={1}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {pathname === `${PATH.TRANSACTION}` && (
            <Checkbox
              sx={{
                '& .MuiSvgIcon-root': {
                  color: 'primary.main',
                },
              }}
              checked={checked !== undefined ? checked : false} // チェックボックスの状態
              onChange={onCheckboxChange} // チェックボックスの状態変更時の処理
            />
          )}
        </Grid>
      </Grid>

      {/* モーダルの表示 */}
      {selectedItem && store.id && (
        <Modal open={isModalOpen} onClose={handleCloseModal}>
          <Box>
            <ItemDetailModalContainer
              open={isModalOpen}
              onClose={handleCloseModal}
              item={selectedItem}
              selectedStoreID={store.id}
              refetchItemsAfterUpdate={() => performSearch()}
            />
          </Box>
        </Modal>
      )}
    </>
  );
};
