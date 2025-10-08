import React from 'react';
import {
  TextField,
  TextFieldProps,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface Props extends Omit<TextFieldProps, 'type'> {
  showPassword: boolean;
  onTogglePassword: () => void;
  autoCompleteType?: 'current-password' | 'new-password';
}

export const PasswordField: React.FC<Props> = ({
  showPassword,
  onTogglePassword,
  autoCompleteType = 'current-password',
  ...textFieldProps
}) => {
  return (
    <TextField
      {...textFieldProps}
      type={showPassword ? 'text' : 'password'}
      size="small"
      autoComplete={autoCompleteType}
      InputProps={{
        ...textFieldProps.InputProps,
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={onTogglePassword}
              edge="end"
              aria-label="toggle password visibility"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};
