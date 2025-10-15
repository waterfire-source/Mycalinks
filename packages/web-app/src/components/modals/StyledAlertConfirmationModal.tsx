import React from 'react';
import { Box, Stack } from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { CustomModalWithHeader } from '@/components/modals/CustomModalWithHeader';
import { DangerousIcon } from '@/components/common/DangerousIcon';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel?: () => void;
  message: React.ReactNode;
  confirmButtonText: string;
  cancelButtonText: string;
  title: string;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const StyledAlertConfirmationModalContent: React.FC<{
  message: React.ReactNode;
  confirmButtonText: string;
  cancelButtonText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  children?: React.ReactNode;
}> = ({
  message,
  confirmButtonText,
  cancelButtonText,
  onConfirm,
  onCancel,
  isLoading = false,
  children,
}) => {
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <DangerousIcon
          width={200}
          height={200}
          style={{
            width: '40%',
            height: '40%',
            marginBottom: 16,
          }}
        />
        {message}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '10px',
            mt: 2,
          }}
        >
          {children}
          <Stack direction="row" gap={1}>
            <SecondaryButton
              variant="contained"
              onClick={onCancel}
              sx={{
                bgcolor: 'grey.500',
                color: 'white',
                width: '100px',
              }}
            >
              {cancelButtonText}
            </SecondaryButton>
            <PrimaryButton
              variant="contained"
              color="error"
              onClick={onConfirm}
              disabled={isLoading}
              aria-disabled={isLoading}
            >
              {confirmButtonText}
            </PrimaryButton>
          </Stack>
        </Box>
      </Box>
    </>
  );
};

export const StyledAlertConfirmationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  message,
  confirmButtonText,
  cancelButtonText,
  title,
  isLoading = false,
  children,
}) => {
  return (
    <CustomModalWithHeader
      open={isOpen}
      onClose={onClose}
      title={title}
      sx={{ minWidth: '500px' }}
    >
      <StyledAlertConfirmationModalContent
        message={message}
        confirmButtonText={confirmButtonText}
        cancelButtonText={cancelButtonText}
        onConfirm={onConfirm}
        onCancel={onCancel ? onCancel : onClose}
        isLoading={isLoading}
      >
        {children}
      </StyledAlertConfirmationModalContent>
    </CustomModalWithHeader>
  );
};
