import React from 'react';
import { Modal, Box, Typography, Button, Card } from '@mui/material';
import Image from 'next/image';

interface AlertConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  confirmButtonText: string;
  cancelButtonText: string;
  title?: string;
  isLoading?: boolean;
}

const ModalContent: React.FC<{
  message: string;
  confirmButtonText: string;
  cancelButtonText: string;
  onConfirm: () => void;
  onClose: () => void;
  isLoading?: boolean;
}> = ({
  message,
  confirmButtonText,
  cancelButtonText,
  onConfirm,
  onClose,
  isLoading = false,
}) => {
  return (
    <>
      <Image
        src="/images/dangerous_icon.png"
        alt="Dangerous icon"
        width={80}
        height={80}
      />
      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        {message}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{ bgcolor: 'grey.500', color: 'white' }}
        >
          {cancelButtonText}
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {confirmButtonText}
        </Button>
      </Box>
    </>
  );
};

const AlertConfirmationModal: React.FC<AlertConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
  confirmButtonText,
  cancelButtonText,
  title,
  isLoading = false,
}) => {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          bgcolor: 'background.paper',
          boxShadow: 24,
          textAlign: 'center',
          borderRadius: 2,
        }}
      >
        {/* タイトルあり */}
        {title ? (
          <Card
            sx={{
              width: '100%',
              height: '100%',
              boxShadow: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 2,
            }}
          >
            <Typography
              align="center"
              sx={{
                color: 'text.secondary',
                backgroundColor: 'grey',
                width: '100%',
                height: '60px',
                borderRadius: '4px 4px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {title}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                p: 4,
              }}
            >
              <ModalContent
                message={message}
                confirmButtonText={confirmButtonText}
                cancelButtonText={cancelButtonText}
                onConfirm={onConfirm}
                onClose={onClose}
                isLoading={isLoading}
              />
            </Box>
          </Card>
        ) : (
          <Box sx={{ p: 4 }}>
            <ModalContent
              message={message}
              confirmButtonText={confirmButtonText}
              cancelButtonText={cancelButtonText}
              onConfirm={onConfirm}
              onClose={onClose}
              isLoading={isLoading}
            />
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default AlertConfirmationModal;
