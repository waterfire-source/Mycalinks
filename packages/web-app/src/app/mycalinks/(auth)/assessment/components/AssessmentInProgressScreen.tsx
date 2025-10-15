import { Box, Typography } from '@mui/material';
import { NotifyInfo } from '@/app/mycalinks/(auth)/assessment/hooks/useGlobalNotify';

interface Props {
  notifyInfo: NotifyInfo;
}

/**
 * 査定中画面コンポーネント
 */
export function AssessmentInProgressScreen({ notifyInfo }: Props) {
  return (
    <Box
      sx={{
        width: '100%',
        height: '75vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography
        sx={{
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '20px!important',
        }}
      >
        {notifyInfo?.purchaseReception?.storeName || ''}
      </Typography>
      <Typography
        sx={{
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '40px!important',
        }}
      >
        査定中
      </Typography>
      <Box>
        <Typography sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          お客様の買取番号
        </Typography>
        <Typography
          fontWeight="bold"
          sx={{ fontSize: '150px!important', lineHeight: 1 }}
        >
          {notifyInfo?.purchaseReception?.receptionNumber}
        </Typography>
      </Box>
    </Box>
  );
}
