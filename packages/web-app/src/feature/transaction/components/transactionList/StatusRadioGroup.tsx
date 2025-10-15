import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { TransactionStatus } from '@prisma/client';

export const StatusRadioGroup = ({
  status,
  handleStatusChange,
}: {
  status: TransactionStatus | '';
  handleStatusChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">ステータス</FormLabel>
      <RadioGroup
        row
        aria-label="status"
        name="status"
        value={status}
        onChange={handleStatusChange}
      >
        <FormControlLabel value="" control={<Radio />} label="指定なし" />
        <FormControlLabel value="completed" control={<Radio />} label="完了" />
        <FormControlLabel value="draft" control={<Radio />} label="未完了" />
        <FormControlLabel
          value="canceled"
          control={<Radio />}
          label="キャンセル"
        />
      </RadioGroup>
    </FormControl>
  );
};
