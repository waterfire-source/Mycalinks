import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { CartItem } from '@/app/auth/(dashboard)/inventory-count/[inventoryId]/[shelfId]/components/InventoryAddModal';
import { CustomModalWithHeader } from '@/components/modals/CustomModalWithHeader';
import { palette } from '@/theme/palette';
import { Stack, Typography } from '@mui/material';
interface Props {
  multipleProducts:
    | BackendProductAPI[0]['response']['200']['products']
    | CartItem[];
  open: boolean;
  handleAddProductToResult: (
    product: BackendProductAPI[0]['response']['200']['products'][0],
  ) => void;
  onClose: () => void;
}
export const MultipleProductModal = ({
  multipleProducts,
  open,
  handleAddProductToResult,
  onClose,
}: Props) => {
  const onClickProduct = (
    product: BackendProductAPI[0]['response']['200']['products'][0],
  ) => {
    handleAddProductToResult(product);
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
                cursor: 'pointer',
              }}
              direction="column"
              gap="8px"
              onClick={() => onClickProduct(product)}
            >
              <Typography variant="body1" minWidth="50px">
                {product.displayNameWithMeta}
              </Typography>
              <Typography variant="body1" minWidth="50px">
                {product.condition_option_display_name}
              </Typography>
              <Typography variant="body1" minWidth="120px">
                販売価格：{product.sell_price?.toLocaleString()}円
              </Typography>
              <Typography variant="body1">
                (在庫数：{product.stock_number.toLocaleString()}点)
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </CustomModalWithHeader>
  );
};
