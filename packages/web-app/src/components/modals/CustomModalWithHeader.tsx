import React from 'react';
import { Modal, Box, Typography, Button, Theme, SxProps } from '@mui/material';
import { FaTimes } from 'react-icons/fa';

interface CustomModalWithHeaderProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number | string;
  height?: number | string;
  sx?: SxProps<Theme>;
  innerSx?: SxProps<Theme>;
  isShowCloseIcon?: boolean;
  dataTestId?: string;
}

export const CustomModalWithHeader: React.FC<CustomModalWithHeaderProps> = ({
  open,
  onClose,
  title,
  children,
  width = 'auto',
  height = 'auto',
  sx,
  innerSx,
  isShowCloseIcon = true,
  dataTestId,
}) => {
  return (
    <Modal open={open} onClose={onClose} data-testid={dataTestId}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: width,
          height: height,
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          ...sx,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px',
            backgroundColor: 'grey.700',
            borderRadius: '4px 4px 0 0',
            color: 'text.secondary',
            position: 'relative',
            height: '60px',
          }}
        >
          <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
            <Typography>{title}</Typography>
          </Box>
          <Button
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: '10px',
              color: 'common.white',
              minWidth: 'auto',
            }}
          >
            {isShowCloseIcon && <FaTimes size={20} />}
          </Button>
        </Box>

        <Box sx={{ flexGrow: 1, p: 4, overflowY: 'auto', ...innerSx }}>
          {children}
        </Box>
      </Box>
    </Modal>
  );
};
