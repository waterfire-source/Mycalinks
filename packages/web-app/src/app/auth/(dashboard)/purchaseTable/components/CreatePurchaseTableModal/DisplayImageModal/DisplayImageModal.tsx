import { Box, Modal } from '@mui/material';
import Image from 'next/image';
import { FaTimes } from 'react-icons/fa';
interface Props {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
}

export const DisplayImageModal = ({ open, onClose, imageUrl }: Props) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800,
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

        {/* 画像表示 */}
        <Box display="flex" justifyContent="center" mt={3}>
          <Box
            sx={{
              width: '100%',
              height: '500px',
              '& img': {
                width: '100%',
                height: '500px',
                objectFit: 'contain',
                borderRadius: '8px',
              },
            }}
          >
            <Image
              src={imageUrl}
              alt="画像"
              width={0}
              height={0}
              sizes="100vw"
            />
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};
