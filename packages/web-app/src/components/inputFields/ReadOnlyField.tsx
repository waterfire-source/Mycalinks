import React from 'react';
import { TextField, SxProps, Theme } from '@mui/material';

interface ReadOnlyFieldProps {
  label: string;
  value: number;
  sx?: SxProps<Theme>;
  onClick?: () => void;
}

const formatNumber = (num: number) => {
  return num.toLocaleString();
};

const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({
  label,
  value,
  sx,
  onClick,
}) => {
  return (
    <TextField
      label={label}
      value={formatNumber(value)} // defaultValue を value に変更
      InputProps={{
        readOnly: true,
      }}
      InputLabelProps={{
        sx: {
          color: 'text.primary',
        },
      }}
      sx={{
        width: '200px',
        color: 'text.primary',
        backgroundColor: 'common.white',
        '& .MuiInputBase-input': {
          color: 'text.primary',
        },
        '& .MuiInput-underline:before': {
          borderBottomColor: 'grey.700',
        },
        '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
          borderBottomColor: 'grey.700',
        },
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: 'grey.700',
          },
          '&:hover fieldset': {
            borderColor: 'grey.700',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'grey.700',
          },
        },
        ...sx,
      }}
      onClick={onClick}
    />
  );
};

export default ReadOnlyField;
