import NumericTextField from '@/components/inputFields/NumericTextField';
import { RegionSettingDef } from '@/feature/ec/setting/delivery/components/DeliveryMethodEditContent';
import { Grid, InputAdornment, Typography } from '@mui/material';

interface Props {
  regions: RegionSettingDef['regionRate'];
  handleFeeChange: (fieldName: string) => (value: number) => void;
}

export const FlatPostage = ({ regions, handleFeeChange }: Props) => {
  return (
    <>
      <Grid item xs={4} sx={{ alignSelf: 'center' }}>
        {/* 送料 */}
        <Typography>送料</Typography>
      </Grid>
      <Grid item xs={8}>
        <NumericTextField
          fullWidth
          name=""
          value={regions?.[0].fee}
          onChange={handleFeeChange('全国一律')}
          variant="outlined"
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Typography sx={{ color: 'text.primary' }}>円</Typography>
              </InputAdornment>
            ),
          }}
          sx={{
            backgroundColor: 'white',
          }}
        />
      </Grid>
    </>
  );
};
