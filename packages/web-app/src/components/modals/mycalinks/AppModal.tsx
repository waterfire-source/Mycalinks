import {
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actionButtonText: string;
  onActionButtonClick: () => void;
}
export const AppModal = ({
  open,
  onClose,
  title,
  children,
  actionButtonText,
  onActionButtonClick,
}: Props) => {
  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '15px!important',
            textAlign: 'center',
            py: 1,
          }}
        >
          {title}
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: 'white',
              position: 'absolute',
              right: 3,
              top: 0,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>{children}</DialogContent>

        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button
            variant="contained"
            sx={{ backgroundColor: 'primary.main' }}
            onClick={onActionButtonClick}
          >
            {actionButtonText}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
