import { TextField } from '@mui/material';
import * as React from 'react';

interface Props {
  selectedDisplayName: string;
  onChange: (displayName: string) => void;
}

export const ProductNameFilter: React.FC<Props> = ({
  selectedDisplayName,
  onChange,
}: Props) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <TextField
      value={selectedDisplayName}
      onChange={handleChange}
      variant="outlined"
      size="small"
      placeholder="商品名で絞り込み"
      sx={{
        width: '20%',
        backgroundColor: 'common.white',
      }}
    />
  );
};
