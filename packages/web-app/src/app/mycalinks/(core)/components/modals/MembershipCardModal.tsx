import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { Barcode, BarcodeFormat } from '@/components/barcode/Barcode';
import Loader from '@/components/common/Loader';

interface Props {
  open: boolean;
  onClose: () => void;
  barcodeValue: string;
  isLoading?: boolean;
}

export function MembershipCardModal({
  open,
  onClose,
  barcodeValue,
  isLoading,
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          position: 'absolute',
          bottom: '15%',
          borderWidth: 5,
          borderColor: 'primary.main',
          borderStyle: 'solid',
          borderRadius: 5,
          overflow: 'hidden',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* 上部の赤バンド */}
        <Box
          sx={{
            backgroundColor: 'primary.main',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            py: 1,
          }}
        >
          <Box width={22} height={1}></Box>
          <Typography color="white" fontWeight="bold" fontSize="16px!important">
            会員証
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon sx={{ color: 'white' }} />
          </IconButton>
        </Box>
        {/* バーコード部分 */}
        {isLoading ? (
          <Loader sx={{ height: '100px' }} />
        ) : (
          <Box sx={{ p: 1 }}>
            {barcodeValue && (
              <Barcode
                charCount={24}
                value={barcodeValue}
                options={{
                  format: BarcodeFormat.CODE128,
                  height: 60,
                  width: 2.2,
                }}
              />
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default MembershipCardModal;
