import NumericTextField from '@/components/inputFields/NumericTextField';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { Delete } from '@mui/icons-material';
import { Box, Stack, TextField, Typography } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { ConsignmentProductSearchType } from '@/feature/consign/components/register/searchModal/type';
import { QuantityControlField } from '@/components/inputFields/QuantityControlField';
import { ItemText } from '@/feature/item/components/ItemText';

interface Props {
  product: ConsignmentProductSearchType;
  setProducts: Dispatch<SetStateAction<ConsignmentProductSearchType[]>>;
}

export const ConsignmentSearchProductDetail = ({
  product,
  setProducts,
}: Props) => {
  const removeProduct = () => {
    setProducts((prev) => prev.filter((p) => p.customId !== product.customId));
  };
  console.log(product);

  const handleManagementNumberChange = (newValue: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.customId === product.customId
          ? { ...p, management_number: newValue }
          : p,
      ),
    );
  };

  const handlePriceChange = (newPrice: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.customId === product.customId
          ? { ...p, consignmentPrice: newPrice }
          : p,
      ),
    );
  };

  const handleCountChange = (newCount: number) => {
    // 0個以下の値は設定しない
    if (newCount <= 0) return;

    setProducts((prev) =>
      prev.map((p) =>
        p.customId === product.customId
          ? { ...p, consignmentCount: newCount }
          : p,
      ),
    );
  };

  return (
    <Stack
      direction="row"
      width="100%"
      alignItems="center"
      spacing={0.5}
      py={1}
    >
      <Box width="80px">
        <ItemImage imageUrl={product.image_url} />
      </Box>
      <Stack spacing={0.5} flex={1} flexDirection="column">
        <ItemText
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          text={product.displayNameWithMeta}
        />
        <Box
          sx={{
            display: 'inline-flex',
            backgroundColor: 'primary.main',
            color: 'text.secondary',
            p: '2px 4px',
            borderRadius: 1,
            width: 'fit-content',
            overflow: 'hidden',
          }}
        >
          <Typography variant="caption">
            {product.condition_option_display_name || '状態不明'}
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" width="100%" flex={1}>
        <Stack spacing={0.5} justifyContent="center" alignItems="center">
          <Stack spacing={0.5}>
            <Typography variant="caption">委託価格</Typography>
            <NumericTextField
              value={product.consignmentPrice}
              onChange={(val) => handlePriceChange(val)}
              suffix="円"
              min={0}
              noSpin
            />
          </Stack>
          {product.management_number !== null ? (
            <Stack spacing={0.5} width="100%">
              <Typography variant="caption">管理番号</Typography>
              <TextField
                value={product.management_number}
                fullWidth
                inputProps={{ style: { padding: '8px' } }}
                onChange={(e) => handleManagementNumberChange(e.target.value)}
              />
            </Stack>
          ) : (
            <Stack width="100%">
              <QuantityControlField
                quantity={product.consignmentCount ?? 0}
                onQuantityChange={(e) => handleCountChange(e)}
                textFieldProps={{
                  InputProps: {
                    endAdornment: <Typography variant="body2">点</Typography>,
                  },
                }}
              />
            </Stack>
          )}
        </Stack>
        <Delete
          sx={{
            alignSelf: 'center',
            width: '40px',
            fontSize: '24px',
            color: 'grey.700',
            cursor: 'pointer',
          }}
          onClick={removeProduct}
        />
      </Stack>
    </Stack>
  );
};
