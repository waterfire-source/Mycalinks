import { StoreAPI } from '@/api/frontend/store/api';
import { createClientAPI, CustomError } from '@/api/implement';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { DetailCard } from '@/components/cards/DetailCard';
import { shippingConstants } from '@/constants/shipping';
// 全角数字を半角数字に変換する関数
const convertFullWidthNumbers = (str: string): string => {
  return str.replace(/[０-９]/g, (char) => {
    return String.fromCharCode(char.charCodeAt(0) - 0xfee0);
  });
};
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { DeleteDeliveryMethodModal } from '@/feature/ec/setting/delivery/components/DeleteDeliveryMethodModal';
import {
  DeliveryFeeMethodDef,
  DeliveryMethodEditContent,
  IsRegion,
  RegionNameArray,
  WeightDef,
} from '@/feature/ec/setting/delivery/components/DeliveryMethodEditContent';
import { SelectChangeEvent, Stack } from '@mui/material';
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';

interface Props {
  selectedDeliveryMethod:
    | StoreAPI['updateShippingMethod']['request']['body']
    | null;
  setSelectedDeliveryMethod: Dispatch<
    SetStateAction<StoreAPI['updateShippingMethod']['request']['body'] | null>
  >;
  fetchDeliveryMethods: (storeID: number, includesFeeDefs?: boolean) => void;
}

export const DeliverySettingsDetail = ({
  selectedDeliveryMethod,
  setSelectedDeliveryMethod,
  fetchDeliveryMethods,
}: Props) => {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const clientAPI = createClientAPI();

  const [isDeleteDeliveryMethodModalOpen, setIsDeleteDeliveryMethodModalOpen] =
    useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // 選択されている配送料金設定方法
  const [currentDeliveryFeeMethod, setCurrentDeliveryFeeMethod] =
    useState<DeliveryFeeMethodDef | null>(null);

  // サイズ別配送方法は設定が大変なので，消えないよう保存
  const [weightsSetting, setWeightsSetting] = useState<WeightDef | null>([]); // 選択した配送方法のサイズ別送料を記憶しておく

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

  // 配送方法の設定方法をチェック
  const checkDeliveryMethodSetting = (
    deliveryMethod: StoreAPI['updateShippingMethod']['request']['body'],
  ) => {
    if (deliveryMethod.weights?.length) {
      return 'サイズ別送料';
    } else if (deliveryMethod.regions?.[0].regionHandle === '全国一律') {
      return '全国一律';
    } else {
      return '地域別送料';
    }
  };

  // 配送方法が選択されたときに，サイズ別送料設定の記憶・送料設定の更新
  useEffect(() => {
    if (!selectedDeliveryMethod) {
      setCurrentDeliveryFeeMethod(null);
      return;
    }
    setWeightsSetting(selectedDeliveryMethod?.weights ?? null);
    setCurrentDeliveryFeeMethod(
      checkDeliveryMethodSetting(selectedDeliveryMethod) === 'サイズ別送料'
        ? 'サイズ別送料'
        : checkDeliveryMethodSetting(selectedDeliveryMethod) === '全国一律'
        ? '全国一律'
        : '地域別送料',
    );

    // 地域別送料の時は，地域別の各エリアの状態を設定
    if (checkDeliveryMethodSetting(selectedDeliveryMethod) === '地域別送料') {
      setIsRegionSetting(
        RegionNameArray.reduce(
          (acc, regionName) => ({
            ...acc,
            [regionName]: selectedDeliveryMethod.regions?.some(
              (region) => region.regionHandle === regionName,
            ),
          }),
          {} as IsRegion,
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeliveryMethod?.id]);

  // ,サイズ別送料が追加されたとき,記憶
  useEffect(() => {
    if (selectedDeliveryMethod?.weights) {
      setWeightsSetting(selectedDeliveryMethod.weights);
    }
  }, [selectedDeliveryMethod?.weights]);

  // 送料設定方法が変えられた時のデフォルト値
  useEffect(() => {
    if (!selectedDeliveryMethod) return;

    if (currentDeliveryFeeMethod === '全国一律') {
      if (checkDeliveryMethodSetting(selectedDeliveryMethod) === '全国一律')
        return;
      setSelectedDeliveryMethod({
        ...selectedDeliveryMethod,
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
      if (checkDeliveryMethodSetting(selectedDeliveryMethod) === '地域別送料')
        return;
      setSelectedDeliveryMethod({
        ...selectedDeliveryMethod,
        regions: RegionNameArray.map((regionName) => ({
          regionHandle: regionName,
          fee: 0,
        })),
        weights: undefined,
      });
      setIsRegionSetting(defaultIsRegionSetting);
    }
    if (currentDeliveryFeeMethod === 'サイズ別送料') {
      if (checkDeliveryMethodSetting(selectedDeliveryMethod) === 'サイズ別送料')
        return;
      setSelectedDeliveryMethod({
        ...selectedDeliveryMethod,
        regions: undefined,
        weights: weightsSetting || undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDeliveryFeeMethod]);

  // isRegionSettingが変更されたときに，地域別送料の地域を変更
  useEffect(() => {
    if (currentDeliveryFeeMethod !== '地域別送料') return;
    if (!selectedDeliveryMethod) return;

    const prev = prevIsRegionSettingRef.current;
    const next = isRegionSetting;

    let newRegions = [...(selectedDeliveryMethod.regions ?? [])];

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

    setSelectedDeliveryMethod({
      ...selectedDeliveryMethod,
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
    if (!selectedDeliveryMethod) return;
    if (e.target.name === 'displayName') {
      setSelectedDeliveryMethod({
        ...selectedDeliveryMethod,
        displayName: e.target.value,
      });
      return;
    }
    if (e.target.name === 'orderNumber') {
      const halfWidthValue = convertFullWidthNumbers(e.target.value);
      const value = Number(halfWidthValue);
      setSelectedDeliveryMethod({
        ...selectedDeliveryMethod,
        orderNumber: isNaN(value) || value < 1 ? 1 : value,
      });
      return;
    }
    if (e.target.name === 'enabledTracking') {
      setSelectedDeliveryMethod({
        ...selectedDeliveryMethod,
        enabledTracking: e.target.value === 'true',
      });
      return;
    }
    if (e.target.name === 'enabledCashOnDelivery') {
      setSelectedDeliveryMethod({
        ...selectedDeliveryMethod,
        enabledCashOnDelivery: !selectedDeliveryMethod.enabledCashOnDelivery,
      });
      return;
    }
    setCurrentDeliveryFeeMethod(e.target.value as DeliveryFeeMethodDef);
  };

  // 送料変更用
  // サイズ別はサイズ別配送料コンポーネント（SizePostage.tsx）で設定される
  const handleFeeChange = (fieldName: string) => (value: number) => {
    if (!selectedDeliveryMethod) return;

    if (currentDeliveryFeeMethod === '全国一律') {
      setSelectedDeliveryMethod({
        ...selectedDeliveryMethod,
        regions: [
          {
            regionHandle: '全国一律',
            fee: value,
          },
        ],
        weights: undefined,
      });
    } else if (currentDeliveryFeeMethod === '地域別送料') {
      setSelectedDeliveryMethod({
        ...selectedDeliveryMethod,
        regions: [
          ...selectedDeliveryMethod.regions!.map((region) =>
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
    if (!selectedDeliveryMethod) return;
    if (
      currentDeliveryFeeMethod === 'サイズ別送料' &&
      selectedDeliveryMethod.weights
    ) {
      for (let i = 0; i < selectedDeliveryMethod.weights.length; i++) {
        const weight = selectedDeliveryMethod.weights[i];
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
        for (let j = i + 1; j < selectedDeliveryMethod.weights.length; j++) {
          // 他のサイズとかぶっていないか。他のサイズの上限下限の範囲に入っているとき
          const comparedWeight = selectedDeliveryMethod.weights[j];
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
  const handleUpdateDeliveryMethod = async () => {
    if (!selectedDeliveryMethod) return;
    if (
      selectedDeliveryMethod.displayName === '' ||
      (selectedDeliveryMethod.regions?.length === 0 &&
        selectedDeliveryMethod.weights?.length === 0)
    ) {
      setAlertState({
        message: '全ての項目を入力してください',
        severity: 'error',
      });
      return;
    }
    if (!checkWeightsSetting()) return;

    setIsUpdating(true);
    try {
      const res = await clientAPI.store.updateShippingMethod({
        storeId: store.id,
        body: selectedDeliveryMethod,
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

      fetchDeliveryMethods(store.id, true);
      setCurrentDeliveryFeeMethod(null);
      setSelectedDeliveryMethod(null);
      setWeightsSetting(null);
      setIsRegionSetting(defaultIsRegionSetting);
      prevIsRegionSettingRef.current = defaultIsRegionSetting;
    } finally {
      setIsUpdating(false);
    }
  };

  const content = (
    <DeliveryMethodEditContent
      deliveryMethod={selectedDeliveryMethod}
      setDeliveryMethod={setSelectedDeliveryMethod}
      currentDeliveryFeeMethod={currentDeliveryFeeMethod}
      handleFeeChange={handleFeeChange}
      handleChange={handleChange}
      isRegionSetting={isRegionSetting}
      setIsRegionSetting={setIsRegionSetting}
    />
  );

  const bottomContent = (
    <Stack
      sx={{ flex: 1, justifyContent: 'space-between', flexDirection: 'row' }}
    >
      <SecondaryButton
        onClick={() => setIsDeleteDeliveryMethodModalOpen(true)}
        disabled={!selectedDeliveryMethod}
      >
        削除
      </SecondaryButton>
      <PrimaryButton
        onClick={handleUpdateDeliveryMethod}
        sx={{ marginLeft: 'auto' }}
        loading={isUpdating}
        disabled={isUpdating}
      >
        変更を保存
      </PrimaryButton>
    </Stack>
  );

  return (
    <>
      <DetailCard
        title="配送方法詳細"
        content={content}
        bottomContent={bottomContent}
      />
      <DeleteDeliveryMethodModal
        open={isDeleteDeliveryMethodModalOpen}
        onClose={() => setIsDeleteDeliveryMethodModalOpen(false)}
        deliveryMethodId={selectedDeliveryMethod?.id}
        setSelectedDeliveryMethod={setSelectedDeliveryMethod}
        fetchDeliveryMethods={fetchDeliveryMethods}
      />
    </>
  );
};
