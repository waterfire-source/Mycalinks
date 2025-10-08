import PrimaryButton from '@/components/buttons/PrimaryButton';
import {
  Box,
  Breakpoint,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';
import SecondaryButton from '@/components/buttons/SecondaryButton';

type ConfirmationDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  title: string;
  message?: string;
  content?: React.ReactNode;
  confirmButtonText?: string;
  confirmButtonLoading?: boolean;
  confirmButtonDisable?: boolean;
  cancelButtonText?: string;
  secondActionButtonText?: string;
  secondActionButtonDisable?: boolean;
  secondActionButtonLoading?: boolean;
  onSecondActionButtonClick?: () => void;
  isLoading?: boolean;
  width?: number | string;
  maxWidth?: Breakpoint;
  isCancelButtonVisible?: boolean;
};

export const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  onCancel,
  title,
  message,
  content,
  confirmButtonText,
  confirmButtonLoading = false,
  confirmButtonDisable = false,
  cancelButtonText = 'キャンセル',
  secondActionButtonText,
  onSecondActionButtonClick,
  secondActionButtonDisable,
  secondActionButtonLoading = false,
  isLoading = false,
  width,
  maxWidth,
  isCancelButtonVisible = true,
}: ConfirmationDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth ?? 'sm'}
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '8px',
          overflow: 'visible',
          width: width ?? undefined,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
        }}
      >
        <span
          style={{ fontSize: '1.2rem', color: '#b82a2a', fontWeight: 'bold' }}
        >
          {title}
        </span>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{ p: 3, pt: 3, display: 'flex', flexDirection: 'column' }}
      >
        <Typography variant="body1">
          {message?.split('\\n').map((line, idx) => (
            <React.Fragment key={idx}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </Typography>
        {content && <Box sx={{ mt: 2, alignSelf: 'center' }}>{content}</Box>}
      </DialogContent>
      <DialogActions
        sx={{
          padding: '16px 24px',
          display: 'flex',
          justifyContent: secondActionButtonText ? 'space-between' : 'flex-end',
        }}
      >
        {secondActionButtonText && (
          <SecondaryButton
            onClick={onSecondActionButtonClick}
            disabled={secondActionButtonDisable}
            loading={secondActionButtonLoading}
          >
            {secondActionButtonText}
          </SecondaryButton>
        )}
        <Stack flexDirection="row" gap={1}>
          {isCancelButtonVisible && (
            <Button
              variant="text"
              onClick={onCancel ?? onClose}
              sx={{ color: '#b82a2a' }}
            >
              {cancelButtonText}
            </Button>
          )}
          {confirmButtonText && (
            <PrimaryButton
              onClick={onConfirm}
              loading={isLoading || confirmButtonLoading}
              disabled={confirmButtonDisable}
            >
              {confirmButtonText}
            </PrimaryButton>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
