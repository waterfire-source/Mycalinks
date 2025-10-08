import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Stack,
} from '@mui/material';
import { NotifyInfo } from '@/app/mycalinks/(auth)/assessment/hooks/useGlobalNotify';
import { BackendAllTransactionAPI } from '@/app/api/store/all/transaction/api';
import { TransactionItemCard } from '@/app/mycalinks/(auth)/assessment/components/TransactionItemCard';
import { ModifiedTransactionCart } from '@/app/mycalinks/(auth)/assessment/types/assessment';

interface Props {
  notifyInfo: NotifyInfo;
  transactionInfo: BackendAllTransactionAPI[1]['response'][200] | null;
  onQuantityChange: (item: ModifiedTransactionCart) => void;
  onConfirmAssessment: () => void;
}

/**
 * 査定完了画面コンポーネント
 */
export const AssessmentCompletedScreen = ({
  notifyInfo,
  transactionInfo,
  onQuantityChange,
  onConfirmAssessment,
}: Props) => {
  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        sx={{
          width: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pt: 2,
        }}
      >
        <Typography
          sx={{
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '20px',
          }}
        >
          {transactionInfo?.store__display_name}
        </Typography>
        <Typography
          sx={{
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '40px!important',
            color: 'primary.main',
          }}
        >
          査定完了
        </Typography>
        <Typography
          sx={{
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '12px!important',
            color: 'primary.main',
          }}
        >
          査定内容をご確認の上
          <br />
          レジまでお越しください
        </Typography>

        <Box
          sx={{
            width: '100%',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography
            sx={{
              fontWeight: 'bold',
              fontSize: '20px !important',
              textAlign: 'center',
            }}
          >
            買取番号{' '}
            <Box
              component="span"
              sx={{
                display: 'block',
                fontWeight: 'bold',
                fontSize: '40px !important',
                textAlign: 'center',
              }}
            >
              {notifyInfo.purchaseReception?.receptionNumber}
            </Box>
          </Typography>

          <Paper
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 0.5,
              px: 2,
              backgroundColor: '#f5f5f5',
            }}
          >
            <Typography fontWeight="bold" fontSize="14px!important">
              査定内容
            </Typography>
            <Typography fontWeight="bold" fontSize="14px!important">
              合計査定額{' '}
              <Box component="span" sx={{ fontSize: '18px !important', ml: 1 }}>
                ¥{transactionInfo?.total_price?.toLocaleString() || '-'}
              </Box>
            </Typography>
          </Paper>

          {/* 査定商品一覧 */}
          <Box
            sx={{
              maxHeight: 250,
              overflowY: 'auto',
            }}
          >
            <Stack spacing={1} mt={1}>
              {transactionInfo?.transaction_carts.map((item, i) => (
                <TransactionItemCard
                  key={i}
                  item={item}
                  onQuantityChange={onQuantityChange}
                />
              ))}
            </Stack>
          </Box>

          {/* 確定ボタン */}
          <Box display="flex" justifyContent="center" mt={4}>
            <Button
              variant="contained"
              color="primary"
              onClick={onConfirmAssessment}
              sx={{ px: 5, py: 1.5, borderRadius: 2 }}
            >
              査定に同意して買取を確定する
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};
