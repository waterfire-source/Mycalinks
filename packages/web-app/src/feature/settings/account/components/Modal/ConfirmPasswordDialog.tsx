import { CancelButton } from '@/components/buttons/CancelButton';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { SimpleDialog } from '@/components/dialogs/SimpleDialog';
import { palette } from '@/theme/palette';
import { TextField, Typography } from '@mui/material';
import { Stack } from '@mui/material';
import { BaseSyntheticEvent } from 'react';
import { get, useFormContext } from 'react-hook-form';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useState } from 'react';
import { InputAdornment, IconButton } from '@mui/material';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e?: BaseSyntheticEvent) => Promise<void>;
}

export const ConfirmPasswordDialog = ({ isOpen, onClose, onSubmit }: Props) => {
  const [showPassword, setShowPassword] = useState(false);
  const handleClick = async () => {
    await onSubmit();
  };
  const { setValue, watch, formState } = useFormContext();
  const errorMessage = get(formState.errors, 'currentPassword');

  return (
    <SimpleDialog height="200px" isOpen={isOpen} onClose={onClose}>
      <Stack p={3} gap={2}>
        <Typography sx={{ color: palette.primary.main }}>
          編集内容を保存
        </Typography>
        <Stack direction="row" gap={2} alignItems="center">
          <Typography>パスワード</Typography>
          <TextField
            size="small"
            type={showPassword ? 'text' : 'password'}
            value={watch('currentPassword')}
            onChange={(e) => setValue('currentPassword', e.target.value)}
            sx={{ width: `calc(100% - 100px)` }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((v) => !v)}
                    edge="end"
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {errorMessage && (
            <Typography color="error">{errorMessage.message}</Typography>
          )}
        </Stack>
        <Stack direction="row" justifyContent="flex-end" gap={2}>
          <CancelButton onClick={onClose}>キャンセル</CancelButton>
          <PrimaryButton onClick={handleClick}>保存</PrimaryButton>
        </Stack>
      </Stack>
    </SimpleDialog>
  );
};
