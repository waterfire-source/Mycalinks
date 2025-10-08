import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { Box, Typography } from '@mui/material';
import { ItemText } from '@/feature/item/components/ItemText';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { useUpdateProduct } from '@/feature/products/hooks/useUpdateProduct';
import { EditManagementNumberField } from '@/components/inputFields/EditManagementNumberField';
import { BoxCategoryTransferButton } from '@/app/auth/(dashboard)/stock/components/detailModal/BoxCategoryTransferButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';

interface Props {
  detailData: BackendProductAPI[0]['response']['200']['products'][0][];
  fetchProducts: () => Promise<void>;
  onCancelSpecialPrice?: () => void;
  loading?: boolean;
  fetchAllProducts?: () => Promise<void>;
}

export const DetailComponent = ({
  detailData,
  fetchProducts,
  onCancelSpecialPrice,
  loading,
  fetchAllProducts,
}: Props) => {
  const { updateProduct, isLoadingUpdateProduct } = useUpdateProduct();

  const productState = detailData[0]?.condition_option_display_name || null;

  // detailData[0]の存在チェック、ランタイムエラー防止のため
  if (!detailData || !detailData[0]) return null;

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="flex-start" // 全体を左寄せ
      sx={{ maxWidth: 300, mx: 'auto', p: 2 }}
    >
      {/* 画像 */}
      <ItemImage imageUrl={detailData[0]?.image_url} height={300} />

      {/* 商品名 */}
      <ItemText sx={{ mt: 2 }} text={detailData[0]?.displayNameWithMeta} />

      {/* 状態 */}
      <Box display="flex" gap={1} sx={{ mt: 1 }}>
        {productState && (
          <Typography>
            {detailData[0]?.is_special_price_product ? '特価' : productState}
          </Typography>
        )}
      </Box>

      {/* 委託者名 */}
      {detailData[0]?.consignment_client_id && (
        <ItemText
          text={`委託者：${detailData[0]?.consignment_client__full_name}`}
        />
      )}

      {/* 価格情報 */}
      <Box display="flex" alignItems="center" sx={{ mt: 1, gap: 2 }}>
        {/* 販売価格 */}
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              backgroundColor: 'red',
              color: 'white',
              borderRadius: '50%',
              width: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 'bold',
            }}
          >
            販
          </Box>
          <Typography variant="body1">
            {detailData[0]?.actual_sell_price?.toLocaleString()}円
          </Typography>
        </Box>
        {/* 仕入価格 */}
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              backgroundColor: '#2A69B8',
              color: 'white',
              borderRadius: '50%',
              width: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 'bold',
            }}
          >
            買
          </Box>
          <Typography variant="body1">
            {detailData[0]?.actual_buy_price?.toLocaleString()}円
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          mt: '5px',
          mb: '10px',
        }}
      >
        {/* 在庫情報 */}
        <Typography variant="body1">
          総在庫数：
          {detailData[0]?.item_infinite_stock
            ? '∞'
            : detailData[0]?.stock_number
            ? detailData[0]?.stock_number.toLocaleString()
            : 0}
        </Typography>
        <BoxCategoryTransferButton
          detailData={detailData}
          fetchProducts={fetchProducts}
        />
      </Box>
      {/* 特価解除ボタン */}
      {onCancelSpecialPrice && detailData[0]?.is_special_price_product && (
        <SecondaryButton onClick={onCancelSpecialPrice} loading={loading}>
          特価解除
        </SecondaryButton>
      )}

      {/* 管理番号 */}
      {detailData[0].management_number !== null && (
        <EditManagementNumberField
          initValue={detailData[0].management_number || ''}
          productId={detailData[0].id}
          updateProduct={updateProduct}
          loading={isLoadingUpdateProduct}
          onUpdate={() => {
            fetchProducts();
            fetchAllProducts?.();
          }}
        />
      )}
    </Box>
  );
};
