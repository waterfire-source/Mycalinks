import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import TertiaryButtonWithIcon from '@/components/buttons/TertiaryButtonWithIcon';
import { Box, Modal, TextField, Typography } from '@mui/material';
import { FaTimes } from 'react-icons/fa';

interface Props {
  open: boolean;
  onClose: () => void;
  onPrimaryButtonClick: () => void;
  value: string;
  setValue: (value: string) => void;
  loading?: boolean;
}

export const TemporaryHoldModal = ({
  open,
  onClose,
  onPrimaryButtonClick,
  value,
  setValue,
  loading = false,
}: Props) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'white',
          borderRadius: 2,
          boxShadow: 24,
          pt: 1,
          pr: 2,
          pl: 2,
          pb: 2,
        }}
      >
        <FaTimes
          size={20}
          onClick={onClose}
          style={{
            position: 'absolute',
            right: '5px',
            color: 'black',
            backgroundColor: 'white',
            cursor: 'pointer',
            borderRadius: '50%',
            padding: '5px',
          }}
        />

        {/* タイトル */}
        <Typography variant="h1" fontWeight="bold" color="primary.main" mt={2}>
          一時保留
        </Typography>

        {/* 内容 */}
        <Typography mt={2}>メモ</Typography>
        <TextField
          fullWidth
          multiline
          minRows={6}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        {/* ボタン */}
        <Box display="flex" justifyContent="flex-end" mt={2} gap={2}>
          <TertiaryButtonWithIcon onClick={onClose}>
            キャンセル
          </TertiaryButtonWithIcon>
          <PrimaryButtonWithIcon
            onClick={onPrimaryButtonClick}
            loading={loading}
          >
            一時保留
          </PrimaryButtonWithIcon>
        </Box>
      </Box>
    </Modal>
  );
};
