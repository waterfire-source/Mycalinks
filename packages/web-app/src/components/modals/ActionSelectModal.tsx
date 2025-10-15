import SecondaryButton from '@/components/buttons/SecondaryButton';
import { Box, Modal, Stack, CircularProgress, Typography } from '@mui/material';

type Props = {
  isOpen: boolean;
  option1?: {
    label: string;
    onClick: () => void;
  };
  option2?: {
    label: string;
    onClick: () => void;
  };
  option3?: {
    label: string;
    onClick: () => void;
  };
  onClose: () => void;
  loading?: boolean;
};

export const ActionSelectModal = ({
  isOpen,
  option1,
  option2,
  option3,
  onClose,
  loading = false,
}: Props) => {
  const options = [option1, option2, option3].filter(Boolean);

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 200,
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 2,
          p: 2,
        }}
      >
        <Stack spacing={2}>
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 3,
              }}
            >
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body2" color="black">
                処理中...
              </Typography>
            </Box>
          ) : (
            options.map((option, index) => (
              <SecondaryButton key={index} onClick={option!.onClick}>
                {option!.label}
              </SecondaryButton>
            ))
          )}
        </Stack>
      </Box>
    </Modal>
  );
};
