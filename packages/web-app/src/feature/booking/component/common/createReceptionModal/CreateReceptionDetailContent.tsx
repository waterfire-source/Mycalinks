import { Box, Grid, Stack, Typography } from '@mui/material';

import { ReservationType } from '@/feature/booking';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { ConditionChip } from '@/feature/products/components/ConditionChip';
import dayjs from 'dayjs';
import { QuantityControlField } from '@/components/inputFields/QuantityControlField';
import { Delete } from '@mui/icons-material';

interface Props {
  selectedReservations: (ReservationType & {
    itemCount: number;
  })[];
  handleUpdateItemCount: (
    newCount: number,
    reservation: ReservationType,
  ) => void;
  handleRemoveProduct: (reservation: ReservationType) => void;
}

export const CreateReceptionDetailContent = ({
  selectedReservations,
  handleUpdateItemCount,
  handleRemoveProduct,
}: Props) => {
  return (
    <Box
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          mt={1}
          pb={1}
          alignItems="center"
          sx={{
            borderBottom: '1px solid',
            borderBottomColor: 'grey.200',
          }}
        >
          <Typography variant="body1">
            合計
            <Typography variant="body1" component="span">
              {selectedReservations.reduce(
                (total, reservation) => total + reservation.itemCount,
                0,
              )}
              点 ({selectedReservations?.length ?? 0}
              商品)
            </Typography>
          </Typography>
          <Typography variant="body1">
            前金合計
            <Typography variant="body1" component="span">
              {selectedReservations
                .reduce(
                  (total, reservation) =>
                    total + reservation.deposit_price * reservation.itemCount,
                  0,
                )
                .toLocaleString()}
              円
            </Typography>
          </Typography>
        </Stack>

        <Box
          sx={{
            width: '100%',
          }}
        >
          {selectedReservations?.map((reservation) => (
            <Grid
              container
              justifyContent="space-between"
              key={reservation.id}
              width="100%"
              sx={{
                borderBottom: '1px solid',
                borderBottomColor: 'grey.200',
                py: 1,
              }}
            >
              <Grid
                item
                xs={2}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ItemImage imageUrl={reservation.product.image_url} />
              </Grid>

              <Grid
                item
                xs={6}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'start',
                  justifyContent: 'center',
                }}
              >
                <ItemText
                  text={reservation.product.displayNameWithMeta ?? '-'}
                />
                <ConditionChip
                  condition={reservation.product.condition_option.display_name}
                />
                <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                  前金:
                  {reservation.deposit_price.toLocaleString()}円
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                  発売日:
                  {reservation.product.item.release_date
                    ? dayjs(reservation.product.item.release_date).format(
                        'YYYY/MM/DD',
                      )
                    : '-'}
                </Typography>
              </Grid>

              <Grid
                item
                xs={4}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Stack direction="row" alignItems="center" pl="12px">
                  <QuantityControlField
                    quantity={reservation.itemCount}
                    maxQuantity={reservation.limit_count_per_user}
                    onQuantityChange={(newCount) => {
                      handleUpdateItemCount(newCount, reservation);
                    }}
                  />
                </Stack>
                <Typography sx={{ fontSize: '12px' }}>
                  上限数{reservation.limit_count_per_user}
                </Typography>
                <Delete
                  sx={{
                    alignSelf: 'center',
                    width: '30px',
                    cursor: 'pointer',
                    color: 'grey.700',
                    marginTop: 1,
                  }}
                  onClick={() => handleRemoveProduct(reservation)}
                />
              </Grid>
            </Grid>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
