import React, { useState } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { CustomModalWithHeader } from '@/components/modals/CustomModalWithHeader';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { NoSpinTextField } from '@/components/common/NoSpinTextField';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (discount: number, mode: '%' | '円') => void;
  type: 'purchase' | 'sale';
}

export const DiscountModal: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  type,
}) => {
  const [mode, setMode] = useState<'%' | '円'>('%');
  const [customDiscount, setCustomDiscount] = useState('');
  const [selectedDiscount, setSelectedDiscount] = useState('');

  const handleDiscountClick = (discount: string) => {
    if (selectedDiscount === discount) {
      setSelectedDiscount('');
    } else {
      setSelectedDiscount(discount);
    }
  };

  const handleCustomDiscountChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;
    if (!/^\d*\.?\d*$/.test(value)) return;

    const numValue = parseFloat(value);
    // 販売の場合は100%を超えないようにする

    if (mode === '%' && type === 'sale' && numValue > 100) return;
    if (mode === '円' && numValue > 1000000) return;

    setCustomDiscount(value);
  };

  const handleConfirmClick = () => {
    const discount = selectedDiscount
      ? parseFloat(selectedDiscount.replace(/[,円%]/g, ''))
      : parseFloat(customDiscount) || 0;
    onConfirm(discount, mode);
    setSelectedDiscount('');
    setCustomDiscount('');
  };

  const renderPercentageOptions = () => (
    <Box
      sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2 }}
    >
      {[
        '10%',
        '15%',
        '20%',
        '25%',
        '30%',
        '40%',
        '50%',
        '60%',
        '70%',
        '80%',
      ].map((value) => (
        <SecondaryButtonWithIcon
          key={value}
          onClick={() => handleDiscountClick(value)}
          selected={selectedDiscount === value}
          sx={{
            width: '100px',
            height: '100px',
          }}
        >
          {value}
        </SecondaryButtonWithIcon>
      ))}
    </Box>
  );

  const renderAmountOptions = () => (
    <Box
      sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2 }}
    >
      {[
        '10円',
        '50円',
        '100円',
        '200円',
        '300円',
        '500円',
        '1,000円',
        '3,000円',
        '5,000円',
        '10,000円',
      ].map((value) => (
        <SecondaryButtonWithIcon
          key={value}
          onClick={() => handleDiscountClick(value)}
          selected={selectedDiscount === value}
          sx={{
            width: '100px',
            height: '100px',
            padding: 0,
          }}
        >
          {value}
        </SecondaryButtonWithIcon>
      ))}
    </Box>
  );

  return (
    <CustomModalWithHeader
      open={open}
      onClose={onClose}
      title={
        type === 'purchase'
          ? '適用する割増を選択してください'
          : '適用する割引を選択してください'
      }
      width="auto"
      height="auto"
    >
      <Stack gap={4}>
        <Stack flexDirection="row" gap={2}>
          <SecondaryButtonWithIcon
            onClick={() => setMode('%')}
            selected={mode === '%'}
            sx={{
              width: '100px',
              height: '40px',
            }}
          >
            <strong>%</strong>
          </SecondaryButtonWithIcon>
          <SecondaryButtonWithIcon
            onClick={() => setMode('円')}
            selected={mode === '円'}
            sx={{
              width: '100px',
              height: '40px',
            }}
          >
            <strong>円</strong>
          </SecondaryButtonWithIcon>
        </Stack>

        {mode === '%' ? renderPercentageOptions() : renderAmountOptions()}

        <Stack
          flexDirection="row"
          width="100%"
          gap={2}
          height="40px"
          justifyContent="center"
        >
          <NoSpinTextField
            type="number"
            value={customDiscount}
            onChange={handleCustomDiscountChange}
            placeholder="カスタム"
            InputProps={{
              endAdornment: <Typography>{mode}</Typography>,
            }}
            size="small"
          />
          <SecondaryButtonWithIcon onClick={handleConfirmClick}>
            適用
          </SecondaryButtonWithIcon>
        </Stack>
      </Stack>
    </CustomModalWithHeader>
  );
};
