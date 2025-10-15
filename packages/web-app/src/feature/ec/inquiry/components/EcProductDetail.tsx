import { Grid, Box, Typography, Stack } from '@mui/material';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';

import { EcCartProducts } from '@/feature/ec/inquiry/components/EcProductsDetailList';
import { ConditionChip } from '@/feature/products/components/ConditionChip';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';

interface Props {
  product: EcCartProducts['products'][0];
  productDetail: BackendProductAPI[0]['response']['200']['products'][0];
}

//取引した商品の詳細情報をカード形式で表示
export const EcProductDetail = ({ product, productDetail }: Props) => {
  return (
    <>
      <Grid
        container
        sx={{
          p: 1,
          borderBottom: '1px solid',
          borderBottomColor: 'grey.300',
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
          >
            <Box>
              <ItemImage imageUrl={productDetail.image_url} />
            </Box>
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
          <ItemText text={productDetail.display_name} />
          {productDetail.condition_option_display_name && (
            <ConditionChip
              condition={productDetail.condition_option_display_name}
            />
          )}
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
              単価: {product.totalUnitPrice.toLocaleString()}円
            </Typography>
          </Stack>
          <Stack gap="12px" direction="row" alignItems="center">
            <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
              数量：{product.itemCount}
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
            商品合計:{' '}
            {(product.totalUnitPrice * product.itemCount).toLocaleString()}円
          </Typography>
        </Grid>
      </Grid>
    </>
  );
};
