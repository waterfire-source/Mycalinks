'use client';
import { Box, Typography, Card, CardContent, Stack } from '@mui/material';
import Image from 'next/image';
import { ReservationsType } from '@/app/mycalinks/(core)/components/ReservationView/useReservationView';
import { HeaderWithBackButton } from '@/app/mycalinks/(core)/components/StoreMenu/HeaderWithBackButton';
import { PosCustomerInfo } from '@/app/mycalinks/(core)/types/customer';
import dayjs from 'dayjs';

interface Props {
  onBack: () => void;
  reservations?: ReservationsType[];
  reservationId?: number;
  posCustomerStoresInfos?: PosCustomerInfo['store'][];
}

export const ReservationViewDetail = ({
  onBack,
  reservations,
  reservationId,
  posCustomerStoresInfos,
}: Props) => {
  const selectedReservation = reservations?.find(
    (reservation) => reservation.id === reservationId,
  );
  const selectedStore = posCustomerStoresInfos?.find(
    (posCustomerStoreInfo) =>
      posCustomerStoreInfo?.id === selectedReservation?.reservation.store_id,
  );
  // 前金
  const depositPrice = Number(
    selectedReservation?.reservation.deposit_price ?? 0,
  );
  // 残金
  const remainingPrice = Number(
    selectedReservation?.reservation.remaining_price ?? 0,
  );
  // 商品単価
  const unitPrice = Number(depositPrice + remainingPrice);
  // 合計残金
  const totalRemainingPrice = Number(
    (selectedReservation?.item_count ?? 0) *
      (selectedReservation?.reservation.remaining_price ?? 0),
  );
  const formattedDate = (date: string) => {
    return dayjs(date).format('YYYY年MM月DD日');
  };

  return (
    <>
      {/* header */}
      <HeaderWithBackButton
        onBack={onBack}
        title={selectedStore?.display_name || '-'}
      />

      {/* contents */}
      <Box>
        {/* 予約詳細 */}
        <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Image
                src={
                  selectedReservation?.reservation.product.image_url ||
                  '/images/ec/noimage.png'
                }
                alt="商品画像"
                width={48}
                height={65}
                style={{ borderRadius: 8, marginRight: 16 }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                  {selectedReservation?.reservation.product.displayNameWithMeta}
                </Typography>
                <Stack
                  spacing={1}
                  direction="row"
                  alignItems="center"
                  justifyContent={'space-between'}
                >
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    発売日{' '}
                    {/* {selectedReservation?.reservation.product.item.release_date} */}
                    {formattedDate(
                      selectedReservation?.reservation.product.item
                        .release_date || '',
                    )}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: 'primary.main', fontWeight: 500 }}
                  >
                    {selectedReservation?.item_count}点
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* 予約詳細金額類 */}
        <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography
              variant="body1"
              textAlign="center"
              sx={{ mb: 2, fontWeight: 'bold' }}
            >
              予約番号 {selectedReservation?.id}
            </Typography>

            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
            >
              <Typography variant="body1">商品単価</Typography>
              <Typography variant="body1">
                ¥{unitPrice.toLocaleString()}
              </Typography>
            </Box>

            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
            >
              <Typography variant="body1">前金</Typography>
              <Typography variant="body1">
                ¥{depositPrice.toLocaleString()}
              </Typography>
            </Box>

            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
            >
              <Typography variant="body1">予約数量</Typography>
              <Typography variant="body1">
                {selectedReservation?.item_count}
              </Typography>
            </Box>

            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
            >
              <Typography variant="body1">合計前金</Typography>
              <Typography variant="body1">
                ¥
                {Number(
                  (selectedReservation?.reservation.deposit_price || 0) *
                    (selectedReservation?.item_count || 0),
                ).toLocaleString()}
              </Typography>
            </Box>

            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
            >
              <Typography variant="body1">残金</Typography>
              <Typography variant="body1">
                ¥{remainingPrice.toLocaleString()}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1">合計残金</Typography>
              <Typography variant="body1">
                ¥{totalRemainingPrice.toLocaleString()}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* 備考欄 */}
        <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 700 }}>
              備考
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {selectedReservation?.reservation.description}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};
