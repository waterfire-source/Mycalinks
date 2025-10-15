import { BackendAccountAPI } from '@/app/api/account/api';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import React from 'react';

interface Props {
  selectedStaff: number | null;
  accounts: BackendAccountAPI[0]['response']['accounts'] | undefined;
  onChange: (staffId: number | null) => void;
}

export const StaffFilter: React.FC<Props> = ({
  selectedStaff,
  accounts,
  onChange,
}: Props) => {
  const handleChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    const parsedValue = value !== '' ? Number(value) : null;
    onChange(parsedValue);
  };

  return (
    <FormControl
      variant="outlined"
      size="small"
      sx={{
        minWidth: '100px',
        width: 'auto',
        backgroundColor: 'common.white',
        '& .MuiInputLabel-root': {
          color: 'text.primary',
          background: 'white',
        },
      }}
    >
      <InputLabel sx={{ color: 'text.primary' }}>担当者</InputLabel>
      <Select value={selectedStaff?.toString() || ''} onChange={handleChange}>
        <MenuItem value="">
          <Typography>指定なし</Typography>
        </MenuItem>
        {accounts?.map((staff) => (
          <MenuItem key={staff.id} value={staff.id.toString()}>
            {staff.display_name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
