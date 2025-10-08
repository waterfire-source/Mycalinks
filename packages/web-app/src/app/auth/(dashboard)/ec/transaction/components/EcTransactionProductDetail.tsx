import { Grid, Box, Typography, Stack } from '@mui/material';

import { EcOrderByStoreInfoType } from '@/app/auth/(dashboard)/ec/transaction/type';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import TagLabel from '@/components/common/TagLabel';

interface Props {
  transactionProduct: EcOrderByStoreInfoType['products'][0];
  productDetail?: BackendProductAPI[0]['response']['200']['products'][0];
}

//取引した商品の詳細情報をカード形式で表示(詳細)
export const EcTransactionProductDetail = ({
  transactionProduct,
  productDetail,
}: Props) => {
  const { displayNameWithMeta, item_count, total_unit_price } =
    transactionProduct;
  const [name, meta] = displayNameWithMeta
    ? displayNameWithMeta.split('（')
    : '';

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
          >
            <ItemImage
              imageUrl={productDetail?.image_url ?? null}
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
          <ItemText text={name} />
          {meta && (
            <Typography variant="caption" sx={{ whiteSpace: 'normal' }}>
              （{meta}
            </Typography>
          )}
          {productDetail?.condition_option_display_name && (
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <TagLabel
                width="fit-content"
                height="20px"
                typographyVariant="caption"
              >
                {productDetail?.condition_option_display_name}
              </TagLabel>
            </Box>
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
              単価: {total_unit_price.toLocaleString()}円
            </Typography>
          </Stack>
          <Stack gap="12px" direction="row" alignItems="center">
            <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
              数量：{item_count}
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
            商品合計: {(total_unit_price * item_count).toLocaleString()}円
          </Typography>
        </Grid>
      </Grid>
    </>
  );
};
