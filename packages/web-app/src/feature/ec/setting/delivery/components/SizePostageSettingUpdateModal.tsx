import { StoreAPI } from '@/api/frontend/store/api';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { shippingConstants } from '@/constants/shipping';
import { useAlert } from '@/contexts/AlertContext';
import { AreaPostage } from '@/feature/ec/setting/delivery/components/AreaPostage';
import {
  defaultWeightsSetting,
  DeliveryFeeMethodDef,
  IsRegion,
  RegionNameArray,
  WeightDef,
} from '@/feature/ec/setting/delivery/components/DeliveryMethodEditContent';
import { FlatPostage } from '@/feature/ec/setting/delivery/components/FlatPostage';
import theme from '@/theme';
import {
  Box,
  FormControl,
  Grid,
  InputAdornment,
  Link,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  deliveryMethod:
    | StoreAPI['updateShippingMethod']['request']['body']
    | StoreAPI['createShippingMethod']['request']['body'];
  setDeliveryMethod:
    | Dispatch<StoreAPI['createShippingMethod']['request']['body']>
    | Dispatch<StoreAPI['updateShippingMethod']['request']['body']>;
  currentWeightIndex: number | null;
}

export const SizePostageSettingUpdateModal = ({
  open,
  onClose,
  deliveryMethod,
  setDeliveryMethod,
  currentWeightIndex,
}: Props) => {
  const { setAlertState } = useAlert();
  const title =
    currentWeightIndex !== null ? 'サイズ別送料設定' : '新規サイズ別送料設定';
  const actionButtonText =
    currentWeightIndex !== null ? '保存する' : '新規送料設定';
  const cancelButtonText =
    currentWeightIndex !== null ? '編集をキャンセル' : '新規送料設定をやめる';
  const secondActionButtonText =
    currentWeightIndex !== null ? '削除' : undefined;

  const [currentWeightSetting, setCurrentWeightSetting] = useState<
    WeightDef[0]
  >(defaultWeightsSetting[0]);

  // 地域別の時の各エリアの状態とそのデフォルト値(すべて地域別)
  const defaultIsRegionSetting = RegionNameArray.reduce(
    (acc, regionName) => ({
      ...acc,
      [regionName]: true,
    }),
    {} as IsRegion,
  );
  const [isRegionSetting, setIsRegionSetting] = useState<IsRegion>(
    defaultIsRegionSetting,
  );

  // 地域別の時の各エリアの状態の変更を記憶
  const prevIsRegionSettingRef = useRef<IsRegion>(isRegionSetting);

  const [currentDeliveryFeeMethod, setCurrentDeliveryFeeMethod] =
    useState<DeliveryFeeMethodDef | null>(null);

  // 送料設定方法が変更されたときのデフォルト値
  useEffect(() => {
    if (currentDeliveryFeeMethod === '全国一律') {
      if (
        currentWeightSetting.regions &&
        currentWeightSetting.regions[0].regionHandle === '全国一律'
      )
        return;
      setCurrentWeightSetting({
        ...currentWeightSetting,
        regions: [
          {
            regionHandle: '全国一律',
            fee: 0,
          },
        ],
      });
    }
    if (currentDeliveryFeeMethod === '地域別送料') {
      if (
        currentWeightSetting.regions &&
        currentWeightSetting.regions[0].regionHandle !== '全国一律'
      )
        return;
      setCurrentWeightSetting({
        ...currentWeightSetting,
        regions: RegionNameArray.map((regionName) => ({
          regionHandle: regionName,
          fee: 0,
        })),
      });
      setIsRegionSetting(defaultIsRegionSetting);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDeliveryFeeMethod]);

  // deliveryMethod および currentWeightIndex（変更すべきweightsの要素） が変更されたときの処理
  useEffect(() => {
    if (currentWeightIndex === null) {
      setCurrentWeightSetting(defaultWeightsSetting[0]);
      return;
    }

    if (
      currentWeightIndex !== null &&
      deliveryMethod.weights?.[currentWeightIndex]
    ) {
      setCurrentWeightSetting(deliveryMethod.weights[currentWeightIndex]);
      if (deliveryMethod.weights[currentWeightIndex].regions) {
        setCurrentDeliveryFeeMethod(
          deliveryMethod.weights[currentWeightIndex].regions[0].regionHandle ===
            '全国一律'
            ? '全国一律'
            : '地域別送料',
        );
      }
    }

    // 地域別送料の時は，地域別の各エリアの状態を設定
    if (
      currentWeightIndex !== null &&
      deliveryMethod.weights?.[currentWeightIndex].regions?.[0].regionHandle !==
        '全国一律'
    ) {
      setIsRegionSetting(
        RegionNameArray.reduce(
          (acc, regionName) => ({
            ...acc,
            [regionName]: deliveryMethod.weights?.[
              currentWeightIndex
            ].regions?.some((region) => region.regionHandle === regionName),
          }),
          {} as IsRegion,
        ),
      );
    }
  }, [currentWeightIndex, deliveryMethod]);

  // isRegionSettingが変更されたときに，地域別送料の地域を変更
  useEffect(() => {
    if (currentDeliveryFeeMethod !== '地域別送料') return;

    const prev = prevIsRegionSettingRef.current;
    const next = isRegionSetting;

    let newRegions = [...(currentWeightSetting.regions ?? [])];

    for (const regionName of RegionNameArray) {
      const prevValue = prev[regionName];
      const nextValue = next[regionName];

      if (prevValue === nextValue) continue;

      const belongingPrefectures = shippingConstants.prefectureAreaDef
        .filter((prefecture) => prefecture.belongsTo.includes(regionName))
        .map((prefecture) => prefecture.name);

      if (prevValue && !nextValue) {
        // 一律 → 県別
        newRegions = newRegions.filter(
          (region) => region.regionHandle !== regionName,
        );
        for (const prefecture of belongingPrefectures) {
          if (
            !newRegions.some((region) => region.regionHandle === prefecture)
          ) {
            newRegions.push({ regionHandle: prefecture, fee: 0 });
          }
        }
      } else if (!prevValue && nextValue) {
        // 県別 → 一律
        newRegions = newRegions.filter(
          (region) => !belongingPrefectures.includes(region.regionHandle),
        );
        if (!newRegions.some((region) => region.regionHandle === regionName)) {
          newRegions.push({ regionHandle: regionName, fee: 0 });
        }
      }
    }

    setCurrentWeightSetting({
      ...currentWeightSetting,
      regions: newRegions,
    });

    // 前回の isRegionSetting を保存
    prevIsRegionSettingRef.current = isRegionSetting;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRegionSetting]);

  // 保存ボタンが押されたときの処理
  const handleConfirm = () => {
    if (currentWeightSetting.displayName === '') {
      setAlertState({
        message: 'サイズ名を入力してください',
        severity: 'error',
      });
      return;
    }
    // currentWeightIndexがnullでないときdeliveryMethod.weightsは存在するが，エラー回避のため
    const updatedWeights =
      currentWeightIndex !== null && deliveryMethod.weights
        ? deliveryMethod.weights.map((weight, index) =>
            index === currentWeightIndex ? currentWeightSetting : weight,
          )
        : [...(deliveryMethod.weights ?? []), currentWeightSetting];

    // 型エラー回避のための条件分岐
    if ('id' in deliveryMethod) {
      // updateShippingMethod の型（id がある）
      (
        setDeliveryMethod as Dispatch<
          SetStateAction<StoreAPI['updateShippingMethod']['request']['body']>
        >
      )({
        ...deliveryMethod,
        regions: undefined,
        weights: updatedWeights,
      });
    } else {
      // createShippingMethod の型（id はない）
      (
        setDeliveryMethod as Dispatch<
          SetStateAction<StoreAPI['createShippingMethod']['request']['body']>
        >
      )({
        ...deliveryMethod,
        regions: undefined,
        weights: updatedWeights,
      });
    }
    setCurrentWeightSetting(defaultWeightsSetting[0]);
    onClose();
  };

  const handleDelete = () => {
    if (currentWeightIndex === null || !deliveryMethod.weights) return;
    const updatedWeights = deliveryMethod.weights.filter(
      (_, index) => index !== currentWeightIndex,
    );
    if ('id' in deliveryMethod) {
      (
        setDeliveryMethod as Dispatch<
          SetStateAction<StoreAPI['updateShippingMethod']['request']['body']>
        >
      )({
        ...deliveryMethod,
        regions: undefined,
        weights: updatedWeights,
      });
    } else {
      (
        setDeliveryMethod as Dispatch<
          SetStateAction<StoreAPI['createShippingMethod']['request']['body']>
        >
      )({
        ...deliveryMethod,
        regions: undefined,
        weights: updatedWeights,
      });
    }
    setCurrentWeightSetting(defaultWeightsSetting[0]);
    onClose();
  };

  return (
    <CustomModalWithIcon
      open={open}
      onClose={onClose}
      title={title}
      helpArchivesNumber={2697}
      width="80%"
      height="85%"
      actionButtonText={actionButtonText}
      onActionButtonClick={handleConfirm}
      cancelButtonText={cancelButtonText}
      secondActionButtonText={secondActionButtonText}
      onSecondActionButtonClick={handleDelete}
    >
      <Box sx={{ display: 'flex', p: 3, gap: 6 }}>
        <Grid container xs={5} spacing={2} sx={{ maxWidth: 500, p: 4 }}>
          <Grid item xs={4} sx={{ alignSelf: 'center' }}>
            <Typography>サイズ名</Typography>
          </Grid>
          <Grid item xs={8} sx={{ alignSelf: 'center' }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              value={currentWeightSetting.displayName}
              onChange={(e) =>
                setCurrentWeightSetting({
                  ...currentWeightSetting,
                  displayName: e.target.value,
                })
              }
              InputProps={{
                sx: {
                  backgroundColor: 'white',
                },
              }}
            />
          </Grid>

          <Grid item xs={4} sx={{ alignSelf: 'center' }}>
            <Typography>対応可能量</Typography>
          </Grid>
          <Grid item xs={8} sx={{ alignSelf: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <NumericTextField
                size="small"
                variant="outlined"
                value={currentWeightSetting.weightGte}
                onChange={(e) =>
                  setCurrentWeightSetting({
                    ...currentWeightSetting,
                    weightGte: e,
                  })
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography sx={{ color: 'text.primary' }}>pt</Typography>
                    </InputAdornment>
                  ),
                  sx: { backgroundColor: 'white' },
                }}
              />
              <Typography>~</Typography>
              <NumericTextField
                size="small"
                variant="outlined"
                value={currentWeightSetting.weightLte}
                onChange={(e) =>
                  setCurrentWeightSetting({
                    ...currentWeightSetting,
                    weightLte: e,
                  })
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography sx={{ color: 'text.primary' }}>pt</Typography>
                    </InputAdornment>
                  ),
                  sx: { backgroundColor: 'white' },
                }}
              />
            </Box>
          </Grid>

          {/* 送料設定 */}
          <Grid item xs={4} sx={{ alignSelf: 'center' }}>
            <Typography>送料設定</Typography>
          </Grid>
          <Grid item xs={8} sx={{ alignSelf: 'center' }}>
            <FormControl fullWidth>
              <Select
                size="small"
                defaultValue=""
                value={currentDeliveryFeeMethod || ''}
                onChange={(e) =>
                  setCurrentDeliveryFeeMethod(
                    e.target.value as DeliveryFeeMethodDef,
                  )
                }
                sx={{
                  backgroundColor: 'white',
                }}
              >
                <MenuItem value="">選択してください</MenuItem>
                <MenuItem value="全国一律">全国一律</MenuItem>
                <MenuItem value="地域別送料">地域別送料</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {currentDeliveryFeeMethod === '全国一律' && (
            <FlatPostage
              regions={currentWeightSetting.regions}
              handleFeeChange={() => (e) => {
                setCurrentWeightSetting({
                  ...currentWeightSetting,
                  regions: [
                    {
                      regionHandle: '全国一律',
                      fee: e,
                    },
                  ],
                });
              }}
            />
          )}
          {currentDeliveryFeeMethod === '地域別送料' && (
            <AreaPostage
              regions={currentWeightSetting.regions}
              handleFeeChange={(fieldName) => (value) => {
                setCurrentWeightSetting({
                  ...currentWeightSetting,
                  regions: [
                    ...currentWeightSetting.regions!.map((region) =>
                      region.regionHandle === fieldName
                        ? { ...region, fee: value }
                        : region,
                    ),
                  ],
                });
              }}
              isRegionSetting={isRegionSetting}
              setIsRegionSetting={setIsRegionSetting}
            />
          )}
        </Grid>
        <Grid xs={7} sx={{ p: 4 }}>
          <Typography>対応可能量について</Typography>
          <Typography sx={{ mt: 1 }}>
            Mycalinks
            Mallではシングルカードのサイズを1pt、平均的なBOX（14cm×14cm×4cm）のサイズを200ptとして、
            各商品のサイズに応じたポイントを設定しております。配送方法ごとに対応可能なポイントの範囲を
            設定することで、注文商品の種類、個数に応じて適切な配送方法をお客様に提示することができます。
          </Typography>
          <Typography sx={{ mt: 2 }}>
            参考ポイント設定は
            <Link
              color={theme.palette.text.primary}
              sx={{ ml: 0.5 }}
              href="https://pos.mycalinks.info/archives/4294"
              target="_blank"
              rel="noopener"
            >
              こちら
            </Link>
          </Typography>
        </Grid>
      </Box>
    </CustomModalWithIcon>
  );
};
