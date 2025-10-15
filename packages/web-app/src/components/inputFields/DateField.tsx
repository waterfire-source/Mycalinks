import { TextField, SxProps } from '@mui/material';
import dayjs from 'dayjs';
interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  sx?: SxProps;
}
export const DateField = ({ label, value, onChange, sx }: Props) => {
  return (
    <TextField
      label={label}
      type="date"
      size="small"
      value={value}
      onChange={(e) => onChange(dayjs(e.target.value).format('YYYY/MM/DD'))}
      sx={{ minWidth: 120, backgroundColor: 'common.white', ...sx }}
      InputLabelProps={{
        shrink: true,
        sx: {
          color: 'common.black',
          fontSize: '0.8rem',
        },
      }}
      InputProps={{
        sx: {
          height: '35px',
          fontSize: '0.6rem',
        },
      }}
    />
  );
};
