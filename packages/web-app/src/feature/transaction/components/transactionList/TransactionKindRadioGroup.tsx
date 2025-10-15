import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';

interface TransactionKindRadioGroupProps {
  transactionKind: 'buy' | 'sell' | '';
  handleTransactionKindChange: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  isShowLabel?: boolean;
}

export default function TransactionKindRadioGroup({
  transactionKind,
  handleTransactionKindChange,
  isShowLabel = true,
}: TransactionKindRadioGroupProps) {
  return (
    <FormControl component="fieldset">
      {isShowLabel && (
        <FormLabel component="legend" sx={{ color: 'black' }}>
          取引種類
        </FormLabel>
      )}
      <RadioGroup
        row
        value={transactionKind}
        onChange={handleTransactionKindChange}
      >
        <FormControlLabel value="" control={<Radio />} label="指定なし" />
        <FormControlLabel value="sell" control={<Radio />} label="販売" />
        <FormControlLabel value="buy" control={<Radio />} label="買取" />
      </RadioGroup>
    </FormControl>
  );
}
