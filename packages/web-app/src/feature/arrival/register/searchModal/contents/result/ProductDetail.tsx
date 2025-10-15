import NumericTextField from '@/components/inputFields/NumericTextField';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { Delete } from '@mui/icons-material';
import { Box, Stack, TextField, Typography } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { CustomArrivalProductSearchType } from '@/app/auth/(dashboard)/arrival/register/page';
import { QuantityControlField } from '@/components/inputFields/QuantityControlField';
import { ItemText } from '@/feature/item/components/ItemText';
import { Specialties } from '@/feature/specialty/hooks/useGetSpecialty';
interface Props {
  product: CustomArrivalProductSearchType;
  setProducts: Dispatch<SetStateAction<CustomArrivalProductSearchType[]>>;
  specialties: Specialties;
}

export const ArrivalSearchProductDetail = ({
  product,
  setProducts,
  specialties,
}: Props) => {
  const removeProduct = () => {
    setProducts((prev) => prev.filter((p) => p.customId !== product.customId));
  };

  const handlePriceChange = (newPrice: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.customId === product.customId ? { ...p, arrivalPrice: newPrice } : p,
      ),
    );
  };

  const handleManagementNumberChange = (newValue: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.customId === product.customId
          ? { ...p, management_number: newValue }
          : p,
      ),
    );
  };

  const handleCountChange = (newCount: number) => {
    // 0個以下の値は設定しない
    if (newCount <= 0) return;

    setProducts((prev) =>
      prev.map((p) =>
        p.customId === product.customId ? { ...p, arrivalCount: newCount } : p,
      ),
    );
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      width="100%"
      spacing={1}
      py={1}
      px={1.5}
    >
      {/* 画像 */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <ItemImage imageUrl={product.image_url} />
      </Box>

      {/* 商品名＋状態 */}
      <Stack spacing={0.5} flex={2} minWidth={0}>
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
          }}
        >
          <Typography variant="caption">
            {product.condition_option_display_name}
          </Typography>
        </Box>
      </Stack>

      {/* 仕入れ値 + 管理番号 or 数量 */}
      <Stack flex={2} spacing={1} minWidth={0}>
        <Stack spacing={0.5}>
          <Typography variant="caption">仕入れ値</Typography>
          <NumericTextField
            value={product.arrivalPrice}
            onChange={handlePriceChange}
            suffix="円"
            min={0}
            noSpin
          />
        </Stack>
        <Stack spacing={0.5}>
          {product.management_number !== null ? (
            <>
              <Typography variant="caption">管理番号</Typography>
              <TextField
                value={product.management_number}
                onChange={(e) => handleManagementNumberChange(e.target.value)}
                size="small"
                fullWidth
              />
            </>
          ) : (
            <QuantityControlField
              quantity={product.arrivalCount || 0}
              onQuantityChange={handleCountChange}
              suffix="個"
            />
          )}
        </Stack>
      </Stack>

      {/* 削除ボタン */}
      <Stack
        sx={{
          flex: 0.1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Delete
          sx={{
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
