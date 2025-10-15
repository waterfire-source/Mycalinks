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
  registers: AuthApiRes['launch']['account']['stores'][0]['store']['registers'];
  registerId: number | null;
  setRegisterId: (value: number | null) => void;
  disabled?: boolean;
  sx?: SxProps;
}

export const OTHER_REGISTER_ID = -1;

export const LoginRegisterSelect = ({
  registers,
  registerId,
  setRegisterId,
  disabled,
  sx,
}: Props) => {
  return (
    <FormControl>
      <InputLabel sx={{ color: palette.text.primary }}>レジを選択</InputLabel>
      <Select
        sx={{ ...sx }}
        value={registerId}
        placeholder="レジを選択"
        disabled={disabled}
        onChange={(e) => {
          if (e.target.value === '') {
            setRegisterId(null);
          } else {
            setRegisterId(Number(e.target.value));
          }
        }}
      >
        {registers?.map((register) => (
          <MenuItem key={register.id} value={register.id}>
            {register.display_name}
          </MenuItem>
        ))}
        <MenuItem value={OTHER_REGISTER_ID}>その他の端末</MenuItem>
      </Select>
    </FormControl>
  );
};
