import { BackendTransactionAPI } from '@/app/api/store/[store_id]/transaction/api';
import TertiaryButton from '@/components/buttons/TertiaryButton';
import TagLabel from '@/components/common/TagLabel';
import { Box, Divider, Typography } from '@mui/material';
import dayjs from 'dayjs';

interface TransactionItemProps {
  transaction: BackendTransactionAPI[5]['response']['200']['transactions'][0];
  onDetailClick: () => void;
}

export function TransactionItem({
  transaction,
  onDetailClick,
}: TransactionItemProps) {
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 1,
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <TagLabel
            backgroundColor={
              transaction.transaction_kind === 'sell'
                ? 'secondary.main'
                : 'primary.main'
            }
            color="white"
            width="40px"
            height="40px"
            fontSize="0.875rem"
            borderRadius="50%"
          >
            {transaction.transaction_kind === 'sell' ? '販' : '買'}
          </TagLabel>
          <Box>
            <Typography variant="body2">取引ID: {transaction.id}</Typography>
            <Typography
              variant="body2"
              sx={{
                color:
                  transaction.transaction_kind === 'sell'
                    ? 'secondary.main'
                    : 'primary.main',
                fontWeight: 'bold',
              }}
            >
              ¥{transaction.total_price.toLocaleString()}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="body2">
            支払方法:{' '}
            {transaction.payment_method === 'cash'
              ? '現金'
              : 'クレジットカード'}
          </Typography>
          <Typography variant="body2">
            {dayjs(transaction.finished_at).format('YYYY/MM/DD HH:mm:ss')}
          </Typography>
        </Box>
        <TertiaryButton variant="outlined" size="small" onClick={onDetailClick}>
          詳細
        </TertiaryButton>
      </Box>
      <Divider sx={{ width: '100%' }} />
    </>
  );
}
