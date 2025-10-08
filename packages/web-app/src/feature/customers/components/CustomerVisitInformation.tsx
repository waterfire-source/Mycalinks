import { CustomerData } from '@/app/auth/(dashboard)/customers/page';
import {
  TotalAmount,
  TransactionCounts,
} from '@/feature/customers/components/CustomerDetailPaper';
import { Box, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';

interface Props {
  customer: CustomerData;
  transactionCounts: TransactionCounts;
  totalAmount: TotalAmount;
}

export const CustomerVisitInformation = ({
  customer,
  transactionCounts,
  totalAmount,
}: Props) => {
  return (
    <Box mt={2}>
      <Typography>来店情報</Typography>
      <Box ml={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{ borderBottom: '1px solid', borderColor: 'grey.300', mt: 2 }}
        >
          <Typography>最終来店日時</Typography>
          <Typography>
            {customer.lastUsedDate
              ? dayjs(customer.lastUsedDate).format('YYYY/MM/DD HH:mm')
              : ''}
          </Typography>
        </Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{ borderBottom: '1px solid', borderColor: 'grey.300', mt: 2 }}
        >
          <Typography>通算来店回数</Typography>
          <Typography>{transactionCounts.visit}</Typography>
        </Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          spacing={2}
          sx={{
            mt: 2,
          }}
        >
          <Stack
            direction="row"
            flex={1}
            justifyContent="space-between"
            sx={{ borderBottom: '1px solid', borderColor: 'grey.300' }}
          >
            <Typography>販売回数</Typography>
            <Typography>{transactionCounts.sell}</Typography>
          </Stack>
          <Stack
            direction="row"
            flex={1}
            justifyContent="space-between"
            sx={{ borderBottom: '1px solid', borderColor: 'grey.300' }}
          >
            <Typography>買取回数</Typography>
            <Typography>{transactionCounts.buy}</Typography>
          </Stack>
        </Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          spacing={2}
          sx={{
            mt: 2,
          }}
        >
          <Stack
            direction="row"
            flex={1}
            justifyContent="space-between"
            sx={{ borderBottom: '1px solid', borderColor: 'grey.300' }}
          >
            <Typography>総販売額</Typography>
            <Typography>
              {totalAmount.sell
                ? `${totalAmount.sell.toLocaleString()}円`
                : '0円'}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            flex={1}
            justifyContent="space-between"
            sx={{ borderBottom: '1px solid', borderColor: 'grey.300' }}
          >
            <Typography>総買取額</Typography>
            <Typography>
              {totalAmount.buy
                ? `${totalAmount.buy.toLocaleString()}円`
                : '0円'}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};
