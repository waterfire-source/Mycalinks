import { AuthApiRes } from '@/api/frontend/auth/api';
import { palette } from '@/theme/palette';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SxProps,
} from '@mui/material';

interface Props {
  stores: AuthApiRes['launch']['account']['stores'];
  storeId: number | null;
  setStoreId: (value: number | null) => void;
  sx?: SxProps;
}

export const LoginStoreSelect = ({
  stores,
  storeId,
  setStoreId,
  sx,
}: Props) => {
  return (
    <FormControl>
      <InputLabel sx={{ color: palette.text.primary }}>店舗を選択</InputLabel>
      <Select
        sx={{ ...sx }}
        placeholder="店舗を選択"
        value={storeId}
        onChange={(e) => {
          if (e.target.value === '') {
            setStoreId(null);
          } else {
            setStoreId(Number(e.target.value));
          }
        }}
      >
        {stores?.map((store) => (
          <MenuItem key={store.store.id} value={store.store.id}>
            {store.store.display_name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
