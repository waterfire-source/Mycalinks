import {
  IconButton,
  Stack,
  TextFieldProps,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useAlert } from '@/contexts/AlertContext';
import { useState, useEffect } from 'react';
import { NoSpinTextField } from '@/components/common/NoSpinTextField';

type Props = {
  quantity: number;
  maxQuantity?: number;
  minQuantity?: number;
  onQuantityChange: (newQuantity: number) => void;
  textFieldProps?: TextFieldProps;
  containerSx?: SxProps<Theme>;
  suffix?: string;
};

// 枚数を変更するボタン
export const QuantityControlField = ({
  quantity,
  onQuantityChange,
  maxQuantity,
  minQuantity,
  textFieldProps,
  containerSx,
  suffix,
}: Props) => {
  const { setAlertState } = useAlert();
  const [inputValue, setInputValue] = useState(quantity.toString());

  useEffect(() => {
    setInputValue(quantity.toString());
  }, [quantity]);

  // quantity を増やす
  const handleIncrement = () => {
    // max_quantity が存在し、quantity が max_quantity 未満の場合のみ増加
    if (maxQuantity === undefined || quantity < maxQuantity) {
      onQuantityChange(quantity + 1); // 増加時に親に通知
    }
  };

  const handleDecrement = () => {
    onQuantityChange(Math.max(quantity - 1, minQuantity || 0)); // 減少時に親に通知、0未満にならないように
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newInputValue = event.target.value;
    setInputValue(newInputValue);

    if (newInputValue === '') {
      onQuantityChange(0);
      return;
    }

    const newQuantity = Number(newInputValue);

    if (isNaN(newQuantity)) {
      setAlertState({
        message: '数値を入力してください',
        severity: 'error',
      });
      return;
    }

    if (newQuantity < (minQuantity || 0)) {
      onQuantityChange(minQuantity || 0);
      return;
    }

    if (maxQuantity !== undefined && newQuantity > maxQuantity) {
      onQuantityChange(maxQuantity);
      return;
    }

    onQuantityChange(newQuantity);
  };

  const handleInputFocus = () => {
    if (quantity === 0) {
      setInputValue('');
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
    e.stopPropagation();
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      gap="8px"
      sx={{ ...containerSx }}
    >
      <IconButton
        onClick={handleDecrement}
        disabled={quantity === 0}
        sx={{ width: '10%' }}
      >
        <RemoveIcon />
      </IconButton>
      <NoSpinTextField
        type="number"
        size="small"
        inputProps={{
          style: { textAlign: 'center', padding: '8px 0px' },
          max: maxQuantity || undefined,
          min: minQuantity || undefined,
          onWheel: handleWheel,
        }}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        sx={{
          width: '100%',
          ...textFieldProps?.sx,
        }}
        InputProps={{
          endAdornment: <Typography variant="body2">{suffix}</Typography>,
          ...textFieldProps?.InputProps,
        }}
        {...textFieldProps}
      />
      <IconButton
        disabled={maxQuantity !== undefined && quantity >= maxQuantity}
        onClick={handleIncrement}
        sx={{ width: '10%' }}
      >
        <AddIcon />
      </IconButton>
    </Stack>
  );
};
