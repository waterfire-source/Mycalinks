import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Stack,
  TextField,
} from '@mui/material';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { ConditionChip } from '@/feature/products/components/ConditionChip';
import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';
import {
  ReservationType,
  useFetchReservationReception,
} from '@/feature/booking';
import { ReservationReceptionProductStatus } from '@prisma/client';

interface Props {
  storeId: number;
  selectedReservation: ReservationType | null;
}

export const ReservationProductDetailContent = ({
  storeId,
  selectedReservation,
}: Props) => {
  const { receptions, fetchReservationReception, isLoading } =
    useFetchReservationReception();

  useEffect(() => {
    if (selectedReservation) {
      fetchReservationReception(storeId, selectedReservation.id);
    }
  }, [storeId, selectedReservation]);

  const reservationInfo = useMemo(() => {
    return [
      { label: '予約受付上限', value: selectedReservation?.limit_count },
      {
        label: '予約終了',
        value: dayjs(selectedReservation?.end_at).format('YYYY/MM/DD'),
      },
      {
        label: '1人当たりの予約上限',
        value: selectedReservation?.limit_count_per_user,
      },
      {
        label: '前金',
        value: `${selectedReservation?.deposit_price.toLocaleString()}円`,
      },
      {
        label: '残金（受け取り時支払い金）',
        value: `${selectedReservation?.remaining_price.toLocaleString()}円`,
      },
    ];
  }, [selectedReservation]);

  const reservationCountInfo = useMemo(() => {
    const reservationUser = Array.from(
      new Set(
        receptions
          .filter(
            (r) =>
              r.status === ReservationReceptionProductStatus.DEPOSITED ||
              r.status === ReservationReceptionProductStatus.RECEIVED,
          )
          .map((r) => r.customer_id),
      ),
    );
    const reservationCount = receptions
      .filter(
        (r) =>
          r.status === ReservationReceptionProductStatus.DEPOSITED ||
          r.status === ReservationReceptionProductStatus.RECEIVED,
      )
      .reduce((sum, r) => sum + r.item_count, 0);
    const receivedUser = Array.from(
      new Set(
        receptions
          .filter(
            (r) => r.status === ReservationReceptionProductStatus.RECEIVED,
          )
          .map((r) => r.customer_id),
      ),
    );
    const receivedCount = receptions
      .filter((r) => r.status === ReservationReceptionProductStatus.RECEIVED)
      .reduce((sum, r) => sum + r.item_count, 0);
    return [
      {
        label: '現在の予約人数',
        value: `${reservationUser.length}人`,
      },
      {
        label: '現在の予約数',
        value: reservationCount,
      },
      {
        label: '受け渡し済み人数',
        value: `${receivedUser.length}人`,
      },
      {
        label: '受け渡し済み数',
        value: receivedCount,
      },
    ];
  }, [receptions]);

  let mainContent;

  if (!selectedReservation) {
    mainContent = (
      <Typography variant="body1">予約商品をクリックして詳細を表示</Typography>
    );
  } else {
    mainContent = (
      <>
        <Grid container justifyContent="space-between">
          <Grid
            item
            xs={2}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ItemImage imageUrl={selectedReservation.product.image_url} />
          </Grid>

          <Grid
            item
            xs={9}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'start',
              justifyContent: 'center',
            }}
          >
            <ItemText
              text={selectedReservation.product.displayNameWithMeta ?? '-'}
            />
            <ConditionChip
              condition={
                selectedReservation.product.condition_option.display_name ?? '-'
              }
            />
            <Stack
              direction="row"
              alignItems="center"
              width="100%"
              justifyContent="space-between"
            >
              <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                単価:
                {selectedReservation.product.actual_sell_price!.toLocaleString()}
                円
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                発売日:
                {selectedReservation.product.item.release_date
                  ? dayjs(selectedReservation.product.item.release_date).format(
                      'YYYY/MM/DD',
                    )
                  : '-'}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
        <Stack direction="column" width="100%" mt={2} gap={1}>
          {reservationInfo.map((item) => (
            <Stack
              key={item.label}
              direction="row"
              alignItems="center"
              width="100%"
              justifyContent="space-between"
              sx={{ borderBottom: '1px solid', borderBottomColor: 'grey.200' }}
            >
              <Typography variant="body2">{item.label}</Typography>
              <Typography variant="body2">{item.value}</Typography>
            </Stack>
          ))}
          <Box>
            <Typography variant="body2">備考</Typography>
            <TextField
              value={selectedReservation.description ?? ''}
              variant="outlined"
              size="small"
              fullWidth
              multiline
              rows={4}
              sx={{
                backgroundColor: 'white',
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.23)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.23)',
                  },
                },
                '& .MuiInputBase-root': {
                  overflow: 'auto',
                },
              }}
              InputProps={{
                readOnly: true,
                sx: {
                  color: 'text.primary',
                },
              }}
            />
          </Box>

          {isLoading ? (
            <Box display="flex" mt={2} justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            <>
              {reservationCountInfo.map((item) => (
                <Stack
                  key={item.label}
                  direction="row"
                  alignItems="center"
                  width="100%"
                  justifyContent="space-between"
                  sx={{
                    borderBottom: '1px solid',
                    borderBottomColor: 'grey.200',
                  }}
                >
                  <Typography variant="body2">{item.label}</Typography>
                  <Typography variant="body2">{item.value}</Typography>
                </Stack>
              ))}
            </>
          )}
        </Stack>
      </>
    );
  }
  return (
    <Box
      sx={{
        p: 1,
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {mainContent}
    </Box>
  );
};
