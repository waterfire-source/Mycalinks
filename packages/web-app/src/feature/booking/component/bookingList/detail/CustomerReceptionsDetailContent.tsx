import { Box, Checkbox, Grid, Typography } from '@mui/material';
import {
  CustomerReservationReceptionType,
  ReceptionType,
  ReservationStatusLabelMap,
} from '@/feature/booking';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { ConditionChip } from '@/feature/products/components/ConditionChip';
import dayjs from 'dayjs';

interface Props {
  selectedReception: CustomerReservationReceptionType | null;
  selectedReservations: ReceptionType[];
  handleCheckboxClick: (reservation: ReceptionType) => void;
  isAllSelected: boolean;
  handleToggleAll: () => void;
}

export const CustomerReceptionsDetailContent = ({
  selectedReception,
  selectedReservations,
  isAllSelected,
  handleCheckboxClick,
  handleToggleAll,
}: Props) => {
  let mainContent;

  if (!selectedReception) {
    mainContent = (
      <Typography variant="body1">予約をクリックして詳細を表示</Typography>
    );
  } else {
    mainContent = (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        }}
      >
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          sx={{
            borderBottom: '1px solid',
            borderBottomColor: 'grey.200',
            pl: 1,
          }}
        >
          <Grid item xs={11}>
            <Typography variant="body1">
              合計
              <Typography variant="body1" component="span">
                {selectedReception.reservation_reception_products.reduce(
                  (total, product) => total + (product.item_count || 0),
                  0,
                )}
                点 ({selectedReception.reservation_reception_products.length}
                商品)
              </Typography>
            </Typography>
          </Grid>
          <Grid
            item
            xs={1}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Checkbox
              sx={{
                '& .MuiSvgIcon-root': { color: 'primary.main' },
              }}
              checked={isAllSelected}
              onChange={handleToggleAll}
            />
          </Grid>
        </Grid>

        <Box
          sx={{
            width: '100%',
          }}
        >
          {selectedReception.reservation_reception_products.map((product) => (
            <Grid
              container
              justifyContent="space-between"
              key={`${product.reservation_id}-${product.id}`}
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
                <ItemImage imageUrl={product.reservation.product.image_url} />
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
                  text={product.reservation.product.displayNameWithMeta ?? '-'}
                />
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <ConditionChip
                    condition={
                      product.reservation.product.condition_option.display_name
                    }
                  />
                  <Box
                    sx={{
                      backgroundColor: 'grey.200',
                      padding: '2px 12px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 'bold',
                        textAlign: 'center',
                        fontSize: '10px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {ReservationStatusLabelMap[product.reservation.status]}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                  発売日：
                  {product.reservation.product.item.release_date
                    ? dayjs(
                        product.reservation.product.item.release_date,
                      ).format('YYYY/MM/DD')
                    : '-'}
                </Typography>
              </Grid>

              <Grid
                item
                xs={3}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'start',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                  前金：{product.reservation.deposit_price.toLocaleString()}円
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                  残金：{product.reservation.remaining_price.toLocaleString()}円
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                  数量：{product.item_count}
                </Typography>
              </Grid>

              <Grid
                item
                xs={1}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Checkbox
                  sx={{
                    '& .MuiSvgIcon-root': { color: 'primary.main' },
                  }}
                  checked={selectedReservations.some(
                    (item) => item.id === product.id,
                  )}
                  onChange={() => {
                    handleCheckboxClick(product);
                  }}
                />
              </Grid>
            </Grid>
          ))}
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'left',
              width: '80%',
              gap: 1,
            }}
          >
            <Typography sx={{ fontSize: '14px' }}>
              お客様氏名：{selectedReception.full_name}
            </Typography>
            <Typography sx={{ fontSize: '14px' }}>
              フリガナ：{selectedReception.full_name_ruby}
            </Typography>
            <Typography sx={{ fontSize: '14px' }}>
              住所：
              {[
                selectedReception.prefecture,
                selectedReception.city,
                selectedReception.address2,
                selectedReception.building,
              ]
                .filter(Boolean)
                .join('')}
            </Typography>
            <Typography sx={{ fontSize: '14px' }}>
              電話番号：{selectedReception.phone_number}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }
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
      {mainContent}
    </Box>
  );
};
