import { TransferInfo } from '@/app/auth/(dashboard)/stock/specialPriceStock/component/AddSpecialPriceStockModal/AddSpecialPriceStockModal';
import { SelectedData } from '@/app/auth/(dashboard)/stock/specialPriceStock/component/AddSpecialPriceStockModal/AddSpecialPriceStockModalContent';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { QuantityControlField } from '@/components/inputFields/QuantityControlField';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { Box, Checkbox, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

interface Props {
  selectedRows: SelectedData | undefined;
  transferInfo: TransferInfo | undefined;
  setTransferInfo: React.Dispatch<
    React.SetStateAction<TransferInfo | undefined>
  >;
}

const formatValue = (value: string): number => {
  // 全角数字を半角に変換
  value = value.replace(/[０-９]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0xfee0),
  );

  // 半角数字以外を削除
  value = value.replace(/[^0-9]/g, '');

  // 数字に変換し、空の場合は0を返す
  return value ? Number(value) : 0;
};

export const SpecialPriceStockDetailContent = ({
  selectedRows,
  transferInfo,
  setTransferInfo,
}: Props) => {
  const [ratio, setRatio] = useState<string | undefined>();
  const handleChange = (field: keyof TransferInfo, value: string | number) => {
    setTransferInfo((prevInfo) => ({
      ...prevInfo,
      [field]: typeof value === 'string' ? formatValue(value) : value,
    }));
  };

  useEffect(() => {
    if (transferInfo?.sellPrice) {
      const inputPrice = transferInfo?.sellPrice;
      const nowPrice = selectedRows?.price;

      const percentage =
        inputPrice !== undefined &&
        nowPrice !== undefined &&
        nowPrice !== null &&
        nowPrice !== 0
          ? ((inputPrice / nowPrice) * 100).toFixed(2) + '%'
          : undefined;
      setRatio(percentage);
    }
  }, [transferInfo?.sellPrice, selectedRows?.price]);
  return (
    <Box ml={2} mr={2}>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Typography>特価にする在庫</Typography>
      </Stack>
      <Stack direction="row" spacing={2}>
        <Box>
          <ItemImage imageUrl={selectedRows?.ImageUrl ?? null} height={100} />
        </Box>
        <Box
          sx={{
            height: '100px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            overflow: 'hidden',
          }}
        >
          <ItemText text={selectedRows?.productName ?? '-'} wrap />
          <Typography>{selectedRows?.condition}</Typography>
        </Box>
      </Stack>
      <Stack gap={2} pt={1}>
        <Stack direction="column" alignItems="flex-start">
          <Typography>特価価格</Typography>
          <NumericTextField
            size="small"
            type="text"
            required
            value={transferInfo?.sellPrice}
            onChange={(e) => handleChange('sellPrice', e)}
            noSpin
            sx={{ width: '100%' }}
            InputProps={{
              endAdornment: <Typography>円</Typography>,
            }}
          />
          <Stack direction="row" spacing={2}>
            <Typography>
              通常販売価格
              {selectedRows?.price !== undefined && selectedRows?.price !== null
                ? selectedRows.price.toLocaleString()
                : '0'}
              の{ratio?.replace('%', '') ?? '0'}%
            </Typography>
          </Stack>
        </Stack>
        <Box>
          <QuantityControlField
            maxQuantity={selectedRows?.maxCount}
            quantity={transferInfo?.itemCount ?? 0}
            onQuantityChange={(e) => handleChange('itemCount', e)}
            suffix="点"
          />
        </Box>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mt: 2 }} alignItems="center">
        <Checkbox
          onChange={(event) => {
            if (event.target.checked) {
              setTransferInfo((prevInfo) => ({
                ...prevInfo,
                specificAutoSellPriceAdjustment: ratio,
              }));
            } else {
              //解除
              setTransferInfo((prevInfo) => ({
                ...prevInfo,
                specificAutoSellPriceAdjustment: undefined,
              }));
            }
          }}
          sx={{
            color: 'black',
            padding: 0,
            margin: 0,
            '&.Mui-checked': {
              color: 'primary.main',
            },
          }}
        />
        <Typography>価格更新後も%関係を維持する</Typography>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mt: 2 }} alignItems="center">
        <Checkbox
          onChange={(event) => {
            if (event.target.checked) {
              setTransferInfo((prevInfo) => ({
                ...prevInfo,
                forceNoPriceLabel: true,
              }));
            } else {
              //解除
              setTransferInfo((prevInfo) => ({
                ...prevInfo,
                forceNoPriceLabel: false,
              }));
            }
          }}
          sx={{
            color: 'black',
            padding: 0,
            margin: 0,
            '&.Mui-checked': {
              color: 'primary.main',
            },
          }}
        />
        <Typography>全ての特価在庫に対して価格なしラベルを使用する</Typography>
      </Stack>
    </Box>
  );
};
