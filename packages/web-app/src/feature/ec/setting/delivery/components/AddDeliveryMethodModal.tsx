import { createClientAPI, CustomError } from '@/api/implement';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { Grid, SelectChangeEvent } from '@mui/material';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
import {
  DeliveryFeeMethodDef,
  WeightDef,
  RegionNameArray,
  IsRegion,
} from '@/feature/ec/setting/delivery/components/DeliveryMethodEditContent';
import { DeliveryMethodCreateContent } from '@/feature/ec/setting/delivery/components/DeliveryMethodCreateContent';
import { StoreAPI } from '@/api/frontend/store/api';
import { shippingConstants } from '@/constants/shipping';
// 全角数字を半角数字に変換する関数
const convertFullWidthNumbers = (str: string): string => {
  return str.replace(/[０-９]/g, (char) => {
    return String.fromCharCode(char.charCodeAt(0) - 0xfee0);
  });
};

interface Props {
  open: boolean;
  onClose: () => void;
  fetchDeliveryMethods: (storeID: number, includesFeeDefs?: boolean) => void;
}

const defaultDeliveryMethod = {
  displayName: '',
  enabledTracking: false,
  regions: [
    {
      regionHandle: '全国一律',
      fee: 0,
    },
  ],
  weights: undefined,
  enabledCashOnDelivery: false,
  orderNumber: 1,
};

const title = '新規配送方法追加';

export const AddDeliveryMethodModal = ({
  open,
  onClose,
  fetchDeliveryMethods,
}: Props) => {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const clientAPI = createClientAPI();

  const [deliveryMethod, setDeliveryMethod] = useState<
    StoreAPI['createShippingMethod']['request']['body']
  >(defaultDeliveryMethod);

  // 選択されている配送料金設定方法
  const [currentDeliveryFeeMethod, setCurrentDeliveryFeeMethod] =
    useState<DeliveryFeeMethodDef | null>(null);

  // サイズ別配送方法は設定が大変なので，消えないよう保存
  const [weightsSetting, setWeightsSetting] = useState<WeightDef | null>([]); // 選択した配送方法のサイズ別送料を記憶しておく
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // 地域別の時の各エリアの状態
  const [isRegionSetting, setIsRegionSetting] = useState<IsRegion>(
    RegionNameArray.reduce(
      (acc, regionName) => ({
        ...acc,
        [regionName]: true,
      }),
      {} as IsRegion,
    ),
  );
  // 地域別の時の各エリアの状態の変更を記憶
  const prevIsRegionSettingRef = useRef<IsRegion>(isRegionSetting);

  // ,サイズ別送料が追加されたとき,記憶
  useEffect(() => {
    if (deliveryMethod?.weights) {
      setWeightsSetting(deliveryMethod.weights ?? null);
    }
  }, [deliveryMethod?.weights]);

  // 送料設定方法が変えられた時のデフォルト値
  useEffect(() => {
    if (!deliveryMethod) return;

    if (currentDeliveryFeeMethod === '全国一律') {
      if (
        deliveryMethod.regions &&
        deliveryMethod.regions?.[0].regionHandle === '全国一律'
      )
        return;
      setDeliveryMethod({
        ...deliveryMethod,
        regions: [
          {
            regionHandle: '全国一律',
            fee: 0,
          },
        ],
        weights: undefined,
      });
    }
    if (currentDeliveryFeeMethod === '地域別送料') {
      if (
        deliveryMethod.regions &&
        deliveryMethod.regions?.[0].regionHandle !== '全国一律'
      )
        return;
      setDeliveryMethod({
        ...deliveryMethod,
        regions: RegionNameArray.map((regionName) => ({
          regionHandle: regionName,
          fee: 0,
        })),
        weights: undefined,
      });
    }
    if (currentDeliveryFeeMethod === 'サイズ別送料') {
      if (deliveryMethod.weights && deliveryMethod.weights?.length !== 0)
        return;
      setDeliveryMethod({
        ...deliveryMethod,
        regions: undefined,
        weights: weightsSetting || undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDeliveryFeeMethod]);

  // isRegionSettingが変更されたときに，地域別送料の地域を変更
  useEffect(() => {
    if (currentDeliveryFeeMethod !== '地域別送料') return;
    if (!deliveryMethod) return;

    const prev = prevIsRegionSettingRef.current;
    const next = isRegionSetting;

    let newRegions = [...(deliveryMethod.regions ?? [])];

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

    setDeliveryMethod({
      ...deliveryMethod,
      regions: newRegions,
    });

    // 前回の isRegionSetting を保存
    prevIsRegionSettingRef.current = isRegionSetting;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRegionSetting]);

  // number型の処理（送料用）は別で定義
  const handleChange = (
    e:
      | SelectChangeEvent<string>
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (!deliveryMethod) return;
    if (e.target.name === 'displayName') {
      setDeliveryMethod({
        ...deliveryMethod,
        displayName: e.target.value,
      });
      return;
    }
    if (e.target.name === 'orderNumber') {
      const halfWidthValue = convertFullWidthNumbers(e.target.value);
      const value = Number(halfWidthValue);
      setDeliveryMethod({
        ...deliveryMethod,
        orderNumber: isNaN(value) || value < 1 ? 1 : value,
      });
      return;
    }
    if (e.target.name === 'enabledTracking') {
      setDeliveryMethod({
        ...deliveryMethod,
        enabledTracking: e.target.value === 'true',
      });
      return;
    }
    if (e.target.name === 'enabledCashOnDelivery') {
      setDeliveryMethod({
        ...deliveryMethod,
        enabledCashOnDelivery: !deliveryMethod.enabledCashOnDelivery,
      });
      return;
    }
    setCurrentDeliveryFeeMethod(e.target.value as DeliveryFeeMethodDef);
  };

  // 送料変更用
  // サイズ別はサイズ別配送料コンポーネント（SizePostage.tsx）で設定される
  const handleFeeChange = (fieldName: string) => (value: number) => {
    if (!deliveryMethod) return;

    if (currentDeliveryFeeMethod === '全国一律') {
      setDeliveryMethod({
        ...deliveryMethod,
        regions: [
          {
            regionHandle: '全国一律',
            fee: value,
          },
        ],
        weights: undefined,
      });
    } else if (currentDeliveryFeeMethod === '地域別送料') {
      setDeliveryMethod({
        ...deliveryMethod,
        regions: [
          ...deliveryMethod.regions!.map((region) =>
            region.regionHandle === fieldName
              ? { ...region, fee: value }
              : region,
          ),
        ],
        weights: undefined,
      });
    }
  };

  const checkWeightsSetting = () => {
    if (!deliveryMethod) return;
    if (currentDeliveryFeeMethod === 'サイズ別送料' && deliveryMethod.weights) {
      for (let i = 0; i < deliveryMethod.weights.length; i++) {
        const weight = deliveryMethod.weights[i];
        if (
          // サイズの指定範囲が不正なとき
          weight.weightGte >= weight.weightLte ||
          weight.weightGte < 0 ||
          weight.weightLte <= 0
        ) {
          setAlertState({
            message: `${weight.displayName}のサイズ設定が不正です`,
            severity: 'error',
          });
          return false;
        }
        for (let j = i + 1; j < deliveryMethod.weights.length; j++) {
          // 他のサイズとかぶっていないか。他のサイズの上限下限の範囲に入っているとき
          const comparedWeight = deliveryMethod.weights[j];
          if (
            (weight.weightGte - comparedWeight.weightLte) *
              (weight.weightGte - comparedWeight.weightGte) <=
              0 ||
            (weight.weightLte - comparedWeight.weightLte) *
              (weight.weightLte - comparedWeight.weightGte) <=
              0
          ) {
            setAlertState({
              message: `${weight.displayName}と${comparedWeight.displayName}のサイズ範囲が重複しています`,
              severity: 'error',
            });
            return false;
          }
        }
      }
    }
    return true;
  };

  // 変更を保存
  const handleAddDeliveryMethod = async () => {
    console.log('deliveryMethod', deliveryMethod);
    if (!deliveryMethod) return;
    if (
      deliveryMethod.displayName === '' ||
      (deliveryMethod.regions?.length === 0 &&
        deliveryMethod.weights?.length === 0)
    ) {
      setAlertState({
        message: '全ての項目を入力してください',
        severity: 'error',
      });
      return;
    }
    if (!checkWeightsSetting()) return;

    setIsCreating(true);
    try {
      const res = await clientAPI.store.createShippingMethod({
        storeId: store.id,
        body: deliveryMethod,
      });

      if (res instanceof CustomError) {
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }

      setAlertState({
        message: '配送方法を変更しました',
        severity: 'success',
      });

      setCurrentDeliveryFeeMethod(null);
      setDeliveryMethod(defaultDeliveryMethod);
      setWeightsSetting(null);
      fetchDeliveryMethods(store.id, true);
      onClose();
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <CustomModalWithIcon
      open={open}
      onClose={onClose}
      title={title}
      width="80%"
      height="85%"
      actionButtonText="新規登録"
      onActionButtonClick={handleAddDeliveryMethod}
      cancelButtonText="編集内容を破棄"
      loading={isCreating}
    >
      <Grid container spacing={2} sx={{ maxWidth: 500 }} p={3}>
        <DeliveryMethodCreateContent
          deliveryMethod={deliveryMethod}
          setDeliveryMethod={setDeliveryMethod}
          currentDeliveryFeeMethod={currentDeliveryFeeMethod}
          handleFeeChange={handleFeeChange}
          handleChange={handleChange}
          isRegionSetting={isRegionSetting}
          setIsRegionSetting={setIsRegionSetting}
        />
      </Grid>
    </CustomModalWithIcon>
  );
};
