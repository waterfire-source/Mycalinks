import { Box, Grid, Typography } from '@mui/material';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { ProductCard } from '@/app/guest/[storeId]/stock/components/ProductCard';
import { ProductItem } from '@/app/guest/[storeId]/stock/components/ProductItem';

import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';

interface Props {
  open: boolean;
  onClose: () => void;
  item: ProductItem | null;
}

export const ProductAddModal = ({ open, onClose, item }: Props) => {
  return (
    <CustomModalWithIcon
      open={open}
      onClose={onClose}
      title=""
      width="70%"
      height="90%"
      onCancelClick={onClose}
      cancelButtonText=""
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              border: '2px solid',
              borderRadius: '8px',
              p: 2,
              boxShadow: 3,
              height: '360px',
              justifyContent: 'center',
            }}
          >
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={6}>
                <ItemImage imageUrl={item?.imageUrl ?? null} height={300} />
              </Grid>
              <Grid item xs={6}>
                <ItemText
                  sx={{
                    whiteSpace: 'normal',
                    fontWeight: 'bold',
                    fontSize: '20px',
                  }}
                  text={item?.displayName ?? '-'}
                />
                <Typography variant="caption" sx={{ whiteSpace: 'normal' }}>
                  ({item?.expansion} {item?.cardnumber} {item?.rarity})
                </Typography>
                <Typography sx={{ whiteSpace: 'normal' }}>
                  封入パック：
                  {item?.packName}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Grid>
        {item?.products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Grid>
    </CustomModalWithIcon>
  );
};
