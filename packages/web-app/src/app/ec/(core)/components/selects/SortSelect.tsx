import {
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import {
  ORDER_KINDS,
  OrderKind,
  ORDER_KIND_VALUE,
} from '@/app/ec/(core)/constants/orderKind';

type Props = {
  value?: OrderKind['value'];
  onChange: (event: SelectChangeEvent) => void;
};

/**
 * 商品の並び替えを行うセレクトボックスコンポーネント
 * @param value - 現在選択されている値（未指定の場合は価格が安い順）
 * @param onChange - 値が変更された時のハンドラー
 */
export const SortSelect = ({
  value = ORDER_KIND_VALUE.PRICE_ASC,
  onChange,
}: Props) => {
  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <Select
        value={value}
        onChange={onChange}
        displayEmpty
        sx={{
          height: '36px',
          fontSize: '1rem',
          fontWeight: 'bold',
          bgcolor: 'white',
        }}
      >
        {ORDER_KINDS.map((orderKind) => (
          <MenuItem
            key={orderKind.value}
            value={orderKind.value}
            sx={{ fontSize: '1rem' }}
          >
            {orderKind.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
