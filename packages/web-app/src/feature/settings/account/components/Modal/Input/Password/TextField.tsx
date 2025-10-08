import { TextField, IconButton, InputAdornment } from '@mui/material';

import { Typography } from '@mui/material';

import { Stack } from '@mui/material';

import { useController } from 'react-hook-form';

import { PasswordFormType } from '@/feature/settings/account/components/Modal/Input/Password/form-schema';
import { useFormContext } from 'react-hook-form';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export const PasswordTextField = ({
  name,
  label,
}: {
  name: 'currentPassword' | 'newPassword' | 'confirmPassword';
  label: string;
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<PasswordFormType>();

  const { field } = useController({ name, control });
  const errorMessage = errors[name]?.message;

  const [showPassword, setShowPassword] = useState(false);

  return (
    <Stack direction="row" gap={2} alignItems="center">
      <Typography width="150px">{label}</Typography>
      <TextField
        {...field}
        size="small"
        type={showPassword ? 'text' : 'password'}
        sx={{ minWidth: '100px' }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      {errorMessage && <Typography color="error">{errorMessage}</Typography>}
    </Stack>
  );
};
