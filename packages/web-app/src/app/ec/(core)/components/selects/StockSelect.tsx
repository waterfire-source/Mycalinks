import { Select, MenuItem, Typography, Stack } from '@mui/material';

type Props = {
  maxStock: number;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

/**
 * 在庫数選択コンポーネント
 * @param maxStock - 在庫数の上限
 * @param disabled - 非活性フラグ
 */
export const StockSelect = ({ maxStock, value, onChange, disabled }: Props) => {
  return (
    <Stack direction="row" sx={{ height: '100%' }}>
      <Select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        sx={{
          width: '100%',
          height: 'auto',
          borderRadius: '4px 0 0 4px',
          '& fieldset': {
            borderColor: 'grey.500',
          },
        }}
      >
        {Array.from({ length: maxStock }, (_, i) => (
          <MenuItem key={i + 1} value={i + 1}>
            {i + 1}
          </MenuItem>
        ))}
      </Select>
      <Typography
        fontWeight="bold"
        sx={{
          width: '100%',
          height: 'auto',
          whiteSpace: 'nowrap',
          bgcolor: disabled ? 'grey.300' : 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid',
          borderColor: 'grey.500',
          borderRadius: '0 4px 4px 0',
          borderLeft: 'none',
          px: 1,
          color: disabled ? 'grey.500' : 'inherit',
        }}
      >
        在庫{maxStock}
      </Typography>
    </Stack>
  );
};
