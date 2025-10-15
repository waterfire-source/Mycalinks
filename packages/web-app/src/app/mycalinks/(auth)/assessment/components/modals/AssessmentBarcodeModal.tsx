import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
} from '@mui/material';
import { BackendAllTransactionAPI } from '@/app/api/store/all/transaction/api';

interface Props {
  open: boolean;
  onClose: () => void;
  transactionInfo: BackendAllTransactionAPI[1]['response'][200] | null;
}
export const AssessmentBarcodeModal = ({
  open,
  onClose,
  transactionInfo,
}: Props) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
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
        買取確認
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            width: '100%',
            backgroundColor: 'white',
            borderRadius: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: '21px!important',
              fontWeight: 'bold',
              lineHeight: 1.5,
              color: 'primary.main',
              textAlign: 'center',
              mt: 3,
            }}
          >
            この画面を表示して
            <br />
            レジまでお越しください
          </Typography>
          <Typography
            sx={{
              fontSize: '18px!important',
              fontWeight: 'bold',
              textAlign: 'center',
              mt: 3,
            }}
          >
            買取番号
            <Box component="span" sx={{ ml: 1 }}>
              {transactionInfo?.reception_number}
            </Box>
          </Typography>
          {/* TODO: ECリリース後に買取査定のバーコードスキャンをリリースする */}
          {/* <Barcode
            value={transactionInfo?.id?.toString() ?? ''}
            applyTransform={true}
            options={{
              format: BarcodeFormat.CODE128,
              height: 60,
              width: 1.7,
            }}
          /> */}
        </Box>
      </DialogContent>
    </Dialog>
  );
};
