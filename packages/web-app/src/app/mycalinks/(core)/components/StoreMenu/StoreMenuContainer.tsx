import { Box, Typography, Grid } from '@mui/material';
import { Event, ShoppingBag } from '@mui/icons-material';
import { StoreMenuButton } from '@/app/mycalinks/(core)/components/StoreMenu/StoreMenuButton';
import { ViewTypes } from '@/app/mycalinks/(core)/types/MembershipCardContent';

interface Props {
  onMenuClick: (viewType: ViewTypes) => void;
}
export const StoreMenuContainer = ({ onMenuClick }: Props) => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        店舗メニュー
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <StoreMenuButton
            label="予約確認"
            onClick={() => onMenuClick(ViewTypes.RESERVATION_LIST)}
            icon={Event}
          />
        </Grid>
        <Grid item xs={3}>
          <StoreMenuButton
            label="買取情報"
            onClick={() => onMenuClick(ViewTypes.PURCHASE_INFO)}
            icon={ShoppingBag}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
