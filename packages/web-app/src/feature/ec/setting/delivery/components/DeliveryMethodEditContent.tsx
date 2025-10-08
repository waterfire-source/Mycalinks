import { StoreAPI } from '@/api/frontend/store/api';
import {
  Box,
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
import { shippingConstants } from '@/constants/shipping';
import { FlatPostage } from '@/feature/ec/setting/delivery/components/FlatPostage';
import { AreaPostage } from '@/feature/ec/setting/delivery/components/AreaPostage';
import { SizePostage } from '@/feature/ec/setting/delivery/components/SizePostage';

const prefectureArea = [...shippingConstants.prefectureAreaDef] as const;
// 都道府県名の抽出
type PrefectureName = (typeof prefectureArea)[number]['name'];

// 地域名を抽出するロジックは長くなりそうなので手打ち．変更できればしたい
export const RegionNameArray = [
  '北海道エリア一律',
  '東北エリア一律',
  '関東エリア一律',
  '信越エリア一律',
  '北陸エリア一律',
  '東海エリア一律',
  '近畿エリア一律',
  '中国エリア一律',
  '四国エリア一律',
  '九州エリア一律',
  '沖縄エリア一律',
] as const;

// 地域名の型
export type RegionName = (typeof RegionNameArray)[number];

export const RegionPrefectureMap = RegionNameArray.reduce(
  (acc, regionName) => {
    acc[regionName] = prefectureArea.filter((prefecture) =>
      prefecture.belongsTo.includes(regionName),
    );
    return acc;
  },
  {} as Record<RegionName, typeof prefectureArea>,
);

// 送料設定の型
export interface RegionSettingDef {
  flatRate: {
    regionHandle: '全国一律';
    fee: number;
  }[];
  regionRate: {
    regionHandle: RegionName | PrefectureName;
    fee: number;
  }[];
}
export type WeightDef = {
  displayName: string;
  weightGte: number;
  weightLte: number;
  regions: RegionSettingDef['regionRate'];
}[];

// 配送料金設定方法
export type DeliveryFeeMethodDef = '全国一律' | '地域別送料' | 'サイズ別送料';

export type IsRegion = {
  [key in RegionName]: boolean;
};

// デフォルトの送料設定
export const defaultRegionSetting: RegionSettingDef = {
  flatRate: [
    {
      regionHandle: '全国一律',
      fee: 0,
    },
  ],
  regionRate: RegionNameArray.map((regionName) => ({
    regionHandle: regionName,
    fee: 0,
  })),
};

// デフォルトのウェイト設定
export const defaultWeightsSetting: WeightDef = [
  {
    displayName: '',
    weightGte: 0,
    weightLte: 0,
    regions: defaultRegionSetting.regionRate,
  },
];

interface Props {
  deliveryMethod: StoreAPI['updateShippingMethod']['request']['body'] | null;
  setDeliveryMethod: Dispatch<
    SetStateAction<StoreAPI['updateShippingMethod']['request']['body'] | null>
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

export const DeliveryMethodEditContent = ({
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
      {deliveryMethod ? (
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
                <FormControlLabel
                  value="true"
                  control={<Radio />}
                  label="あり"
                />
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
                sx={{ backgroundColor: 'white' }}
              >
                <MenuItem value="">選択してください</MenuItem>
                <MenuItem value="全国一律">全国一律</MenuItem>
                <MenuItem value="地域別送料">地域別送料</MenuItem>
                <MenuItem value="サイズ別送料">サイズ別送料</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {deliveryMethod &&
            currentDeliveryFeeMethod === '全国一律' &&
            deliveryMethod.regions && (
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
      ) : (
        <Box
          sx={{
            mt: 2,
            p: 2,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography variant="body1">
            発送方法をクリックして詳細を表示
          </Typography>
        </Box>
      )}
    </>
  );
};
