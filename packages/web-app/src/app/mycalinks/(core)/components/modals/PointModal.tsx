import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { PosCustomerInfo } from '@/app/mycalinks/(core)/types/customer';
interface Props {
  open: boolean;
  onClose: () => void;
  posCustomerInfo: PosCustomerInfo[];
}

export function PointModal({ open, onClose, posCustomerInfo }: Props) {
  const totalPoint = posCustomerInfo.reduce(
    (acc, curr) => acc + (curr.owned_point ?? 0),
    0,
  );
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px!important',
          textAlign: 'center',
          py: 1,
        }}
      >
        所有ポイント内訳
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
      <DialogContent>
        {/* 合計ポイント */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          borderBottom="1px solid silver"
          py={2}
        >
          <Typography fontSize="18px!important">所有ポイント合計</Typography>
          <Typography fontSize="20px!important" fontWeight="bold">
            {totalPoint}
            <Typography component="span" fontSize="14px!important">
              PT
            </Typography>
          </Typography>
        </Box>

        {/* 店舗別ポイント内訳 */}
        <Stack spacing={2} mt={2}>
          {posCustomerInfo.map((customerInfo) => (
            <Box
              key={customerInfo.id}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box
                component="img"
                src={customerInfo.store?.receipt_logo_url ?? ''}
                alt="store-logo"
                sx={{ width: 20, height: 20 }}
              />
              <Typography fontSize="16px!important" flex={1} ml={1}>
                {customerInfo.store?.display_name}
              </Typography>
              <Typography fontSize="18px!important">
                {customerInfo.owned_point}
                <Typography component="span" fontSize="12px!important">
                  PT
                </Typography>
              </Typography>
            </Box>
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
