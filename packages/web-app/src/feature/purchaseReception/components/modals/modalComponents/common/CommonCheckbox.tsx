import { Checkbox, FormControlLabel } from '@mui/material';

export const CommonCheckbox = ({
  checked,
  onChange,
  label,
  disabled = false,
  value = '',
}: {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  label: string;
  disabled?: boolean;
  value?: string | number;
}) => {
  const checkbox = (
    <Checkbox
      name="consent"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      value={value}
      sx={{ color: 'grey.400' }}
    />
  );

  return label ? (
    <FormControlLabel
      control={checkbox}
      label={label}
      sx={{
        margin: 0,
        justifyContent: 'center',
        width: '100%',
      }}
    />
  ) : (
    checkbox
  );
};
