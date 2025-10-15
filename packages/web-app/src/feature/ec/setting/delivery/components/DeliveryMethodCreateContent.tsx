import { StoreAPI } from '@/api/frontend/store/api';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';
import { ChangeEvent, Dispatch, SetStateAction } from 'react';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { FlatPostage } from '@/feature/ec/setting/delivery/components/FlatPostage';
import { AreaPostage } from '@/feature/ec/setting/delivery/components/AreaPostage';
import { SizePostage } from '@/feature/ec/setting/delivery/components/SizePostage';
import {
  DeliveryFeeMethodDef,
  IsRegion,
} from '@/feature/ec/setting/delivery/components/DeliveryMethodEditContent';

interface Props {
  deliveryMethod:
    | StoreAPI['createShippingMethod']['request']['body']
    | undefined
    | null;
  setDeliveryMethod: Dispatch<
    SetStateAction<StoreAPI['createShippingMethod']['request']['body']>
  >;
  currentDeliveryFeeMethod: DeliveryFeeMethodDef | null;
  handleChange: (
    e:
      | SelectChangeEvent<string>
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleFeeChange: (fieldName: string) => (value: number) => void;
  isRegionSetting: IsRegion;
  setIsRegionSetting: Dispatch<SetStateAction<IsRegion>>;
}

export const DeliveryMethodCreateContent = ({
  deliveryMethod,
  setDeliveryMethod,
  currentDeliveryFeeMethod,
  handleChange,
  handleFeeChange,
  isRegionSetting,
  setIsRegionSetting,
}: Props) => {
  return (
    <>
      <Grid container spacing={2} sx={{ maxWidth: 500 }} p={3}>
        {/* 配送方法名 */}
        <Grid item xs={4} sx={{ alignSelf: 'center' }}>
          <Typography>配送方法名</Typography>
        </Grid>
        <Grid item xs={8}>
          <TextField
            fullWidth
            name="displayName"
            variant="outlined"
            value={deliveryMethod?.displayName || ''}
            size="small"
            onChange={handleChange}
            InputProps={{
              sx: {
                backgroundColor: 'white',
              },
            }}
          />
        </Grid>

        {/* 表示順 */}
        <Grid item xs={4} sx={{ alignSelf: 'center' }}>
          <Typography>表示順</Typography>
        </Grid>
        <Grid item xs={8}>
          <NumericTextField
            label=""
            value={deliveryMethod?.orderNumber || 1}
            onChange={(value: number) => {
              if (deliveryMethod) {
                setDeliveryMethod({
                  ...deliveryMethod,
                  orderNumber: value < 1 ? 1 : value,
                });
              }
            }}
            min={1}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
              },
            }}
            helperText="小さい数値から優先的に表示されます(最小値は1)"
            FormHelperTextProps={{
              sx: { color: 'grey.800' },
            }}
          />
        </Grid>

        {/* 荷物追跡 */}
        <Grid item xs={4} sx={{ alignSelf: 'center' }}>
          <Typography>荷物追跡</Typography>
        </Grid>
        <Grid item xs={8}>
          <FormControl>
            <RadioGroup
              row
              name="enabledTracking"
              value={
                deliveryMethod
                  ? deliveryMethod.enabledTracking
                    ? 'true'
                    : 'false'
                  : ''
              }
              onChange={handleChange}
            >
              <FormControlLabel value="true" control={<Radio />} label="あり" />
              <FormControlLabel
                value="false"
                control={<Radio />}
                label="なし"
              />
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* 送料設定 */}
        <Grid item xs={4} sx={{ alignSelf: 'center' }}>
          <Typography>送料設定</Typography>
        </Grid>
        <Grid item xs={8}>
          <FormControl fullWidth>
            <Select
              size="small"
              defaultValue=""
              value={currentDeliveryFeeMethod || ''}
              onChange={handleChange}
              sx={{
                backgroundColor: 'white',
              }}
            >
              <MenuItem value="">選択してください</MenuItem>
              <MenuItem value="全国一律">全国一律</MenuItem>
              <MenuItem value="地域別送料">地域別送料</MenuItem>
              <MenuItem value="サイズ別送料">サイズ別送料</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {deliveryMethod?.regions && currentDeliveryFeeMethod === '全国一律' && (
          <FlatPostage
            regions={deliveryMethod.regions}
            handleFeeChange={handleFeeChange}
          />
        )}
        {deliveryMethod?.regions &&
          currentDeliveryFeeMethod === '地域別送料' && (
            <AreaPostage
              regions={deliveryMethod.regions}
              handleFeeChange={handleFeeChange}
              isRegionSetting={isRegionSetting}
              setIsRegionSetting={setIsRegionSetting}
            />
          )}
        {deliveryMethod && currentDeliveryFeeMethod === 'サイズ別送料' && (
          <SizePostage
            deliveryMethod={deliveryMethod}
            setDeliveryMethod={setDeliveryMethod}
          />
        )}

        <Grid item xs={4} sx={{ alignSelf: 'center' }}>
          <Typography>代引き可能</Typography>
        </Grid>
        <Grid item xs={8}>
          <Checkbox
            checked={deliveryMethod?.enabledCashOnDelivery ?? false}
            onChange={handleChange}
            name="enabledCashOnDelivery"
            value={deliveryMethod?.enabledCashOnDelivery}
            sx={{ transform: 'scale(1.4)' }}
          />
        </Grid>
      </Grid>
    </>
  );
};
