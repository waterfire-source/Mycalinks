import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { CustomModalWithHeader } from '@/components/modals/CustomModalWithHeader';
import { useSaleCartContext } from '@/contexts/SaleCartContext';
import { SaleCartItem } from '@/feature/sale/hooks/useSaleCart';
import { palette } from '@/theme/palette';
import { Stack, Typography } from '@mui/material';
interface Props {
  multipleProducts: BackendProductAPI[0]['response']['200']['products'];
  open: boolean;
  onClose: () => void;
}
export const MultipleProductModal = ({
  multipleProducts,
  open,
  onClose,
}: Props) => {
  const { addProducts } = useSaleCartContext();
  const onClickProduct = (
    product: BackendProductAPI[0]['response']['200']['products'][0],
  ) => {
    const newProduct: Omit<SaleCartItem, 'variants'> = {
      productId: product.id,
      imageUrl: product.image_url ?? '',
      displayName: product.display_name,
      conditionName: product.condition_option_display_name ?? '',
      stockNumber: product.stock_number,
      originalSalePrice: product.sell_price,
      originalSpecificSalePrice: product.specific_sell_price,
      infinite_stock: product.item_infinite_stock,
    };

    addProducts({
      newProduct: newProduct,
      itemCount: 1,
      unitPrice: product.specific_sell_price ?? product.sell_price ?? 0,
    });
    onClose();
  };
  return (
    <CustomModalWithHeader
      open={open}
      onClose={onClose}
      title="商品を選択"
      sx={{ maxHeight: '90vh', overflowY: 'auto' }}
    >
      <Stack gap="24px">
        <Typography
          variant="body1"
          color={palette.text.tertiary}
          textAlign="center"
        >
          同じコードが登録されている商品がスキャンされました。
          <br />
          該当する商品を選択してください。
        </Typography>
        <Stack gap="12px">
          {multipleProducts.map((product) => (
            <Stack
              key={product.id}
              sx={{
                borderRadius: '8px',
                padding: '12px',
                backgroundColor: palette.grey[200],
              }}
              direction="column"
              gap="8px"
              onClick={() => onClickProduct(product)}
            >
              <Typography variant="body1" minWidth="50px">
                {product.displayNameWithMeta}
                {product.consignment_client_id &&
                  (product.consignment_client__display_name ||
                    product.consignment_client__full_name) &&
                  ` (委託者：${
                    product.consignment_client__display_name ||
                    product.consignment_client__full_name
                  })`}
              </Typography>
              <Typography variant="body1" minWidth="50px">
                {product.condition_option_display_name}
              </Typography>
              <Typography variant="body1" minWidth="120px">
                販売価格：{product.sell_price?.toLocaleString()}円
              </Typography>
              <Typography variant="body1">
                (在庫数：
                {product.item_infinite_stock
                  ? '∞'
                  : product.stock_number.toLocaleString()}
                点)
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </CustomModalWithHeader>
  );
};
