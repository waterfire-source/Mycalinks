import { CustomerData } from '@/app/auth/(dashboard)/customers/page';
import { Box, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';

interface Props {
  customer: CustomerData;
}

export const CustomerBasicInformation = ({ customer }: Props) => {
  return (
    <Box>
      <Typography>基本情報</Typography>
      <Box ml={2}>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
          sx={{
            mt: 2,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            flex={1}
            sx={{ borderBottom: '1px solid', borderColor: 'grey.300' }}
          >
            <Typography>会員番号</Typography>
            <Typography>
              {customer.myca_user_id ? (
                customer.id
              ) : (
                <Typography color="primary">非会員</Typography>
              )}
            </Typography>
          </Stack>
          <Stack flex={1}></Stack>
        </Stack>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
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
            <Typography>氏名</Typography>
            <Typography>{customer.full_name}</Typography>
          </Stack>
          <Stack
            direction="row"
            flex={1}
            justifyContent="space-between"
            sx={{ borderBottom: '1px solid', borderColor: 'grey.300' }}
          >
            <Typography>フリガナ</Typography>
            <Typography>{customer.full_name_ruby}</Typography>
          </Stack>
        </Stack>
        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
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
            <Typography>生年月日</Typography>
            <Typography>
              {customer.birthday
                ? `${dayjs(customer.birthday).format('YYYY/MM/DD')}`
                : ''}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            flex={1}
            justifyContent="space-between"
            sx={{ borderBottom: '1px solid', borderColor: 'grey.300' }}
          >
            <Typography>電話番号</Typography>
            <Typography>
              {customer.phone_number
                ? customer.phone_number.replace(
                    /(\d{3})(\d{4})(\d{4})/,
                    '$1-$2-$3',
                  )
                : ''}
            </Typography>
          </Stack>
        </Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{
            borderBottom: '1px solid',
            borderColor: 'grey.300',
            mt: 2,
          }}
        >
          <Typography>住所</Typography>
          <Typography>
            {customer.prefecture} {customer.city} {customer.address2}{' '}
            {customer.building}
          </Typography>
        </Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{
            borderBottom: '1px solid',
            borderColor: 'grey.300',
            mt: 2,
          }}
        >
          <Typography>所持ポイント</Typography>
          <Typography>{customer.owned_point.toLocaleString()}pt</Typography>
        </Stack>
      </Box>
    </Box>
  );
};
