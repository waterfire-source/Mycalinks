import { TextField } from '@mui/material';
import * as React from 'react';

interface Props {
  selectedReason: string;
  onChange: (reason: string) => void;
}

export const ReasonFilter: React.FC<Props> = ({
  selectedReason,
  onChange,
}: Props) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <TextField
      value={selectedReason}
      onChange={handleChange}
      variant="outlined"
      size="small"
      placeholder="ロス理由"
      sx={{
        width: '20%',
        backgroundColor: 'common.white',
      }}
    />
  );
};
