import SecondaryButton from '@/components/buttons/SecondaryButton';
import { Box, Modal, Stack } from '@mui/material';

type Props = {
  onResume: () => void;
  onComplete: () => void;
  onClose: () => void;
};

export const InventoryModeSelectModal = ({
  onResume,
  onComplete,
  onClose,
}: Props) => {
  return (
    <Modal open={true} onClose={onClose}>
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
          <SecondaryButton onClick={onResume}>再開</SecondaryButton>
          <SecondaryButton onClick={onComplete}>完了</SecondaryButton>
        </Stack>
      </Box>
    </Modal>
  );
};
