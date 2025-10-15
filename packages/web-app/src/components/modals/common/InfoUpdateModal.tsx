import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';
import { FaTimes } from 'react-icons/fa';
import { PasswordField } from '@/components/fields/PasswordField';
import PrimaryButton from '@/components/buttons/PrimaryButton';

export enum AutoComplete {
  Off = 'off',
  Tel = 'tel',
  Email = 'email',
  Name = 'name',
  Username = 'username',
  Organization = 'organization',
  StreetAddress = 'street-address',
  PostalCode = 'postal-code',
  CurrentPassword = 'current-password',
  NewPassword = 'new-password',
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  currentValue: string;
  onConfirm: (newValue: string, password: string) => void;
  autoComplete?: AutoComplete;
}

export const InfoUpdateModal: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  currentValue,
  onConfirm,
  autoComplete = AutoComplete.Off,
}) => {
  const [newValue, setNewValue] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<{
    newValue?: string;
    password?: string;
  }>({});

  useEffect(() => {
    setNewValue('');
    setPassword('');
    setError({});
    setShowPassword(false);
  }, [isOpen]);

  const handleConfirm = () => {
    // バリデーション
    const newErrors: typeof error = {};
    if (!newValue) newErrors.newValue = '新しい値を入力してください';
    if (!password) newErrors.password = 'パスワードを入力してください';

    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      return;
    }

    onConfirm(newValue, password);
  };

  const handleClose = () => {
    setNewValue('');
    setPassword('');
    setError({});
    setShowPassword(false);
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '95%',
          maxWidth: '800px',
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            bgcolor: 'grey.700',
            borderRadius: '4px 4px 0 0',
          }}
        >
          <Typography
            variant="h6"
            color="white"
            sx={{ flexGrow: 1, textAlign: 'center' }}
          >
            {title}編集
          </Typography>
          <Button
            onClick={handleClose}
            sx={{ color: 'white', minWidth: 'auto', p: 0 }}
          >
            <FaTimes size={20} />
          </Button>
        </Box>

        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <Typography sx={{ mb: 1, width: '240px' }}>
              現在の{title}
            </Typography>
            <TextField
              fullWidth
              value={currentValue}
              disabled
              size="small"
              autoComplete="off"
              inputProps={{
                autoComplete: 'new-password',
                form: {
                  autoComplete: 'off',
                },
              }}
            />
          </Box>

          <Box
            sx={{
              mb: 3,
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <form
              autoComplete="off"
              style={{ width: '100%', display: 'flex', alignItems: 'center' }}
            >
              <Typography sx={{ mb: 1, width: '260px' }}>
                新しい{title}
              </Typography>
              <TextField
                fullWidth
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                error={!!error.newValue}
                helperText={error.newValue}
                size="small"
                inputProps={{
                  autoComplete: autoComplete,
                }}
              />
            </form>
          </Box>

          <Box
            sx={{
              mb: 3,
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ mb: 1, width: '240px' }}>パスワード</Typography>
            <PasswordField
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!error.password}
              helperText={error.password}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 4 }}>
            <PrimaryButton
              onClick={handleConfirm}
              sx={{ maxWidth: '300px', width: '90%', margin: '0 auto' }}
            >
              変更
            </PrimaryButton>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};
