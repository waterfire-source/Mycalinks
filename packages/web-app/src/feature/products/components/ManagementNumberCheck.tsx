import { Checkbox, FormControlLabel } from '@mui/material';

interface Props {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ManagementNumberCheck = ({ checked, onChange }: Props) => {
  return (
    <FormControlLabel
      control={<Checkbox checked={checked} onChange={onChange} />}
      label="管理番号を入力する"
    />
  );
};
