'use client';

import PrimaryButton from '@/components/buttons/PrimaryButton';
import { Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PATH } from '@/constants/paths';
import { useUpdateDefaultStoreSetting } from '@/feature/corporation/hooks/useUpdateDefaultStoreSetting';
import {
  OrderRule,
  RoundRule,
  TaxMode,
  WholesalePriceKeepRule,
  WholesalePriceOrderColumn,
} from '@prisma/client';
import { PriceSetting } from '@/app/auth/setup/corporation/default-setting/components/PriceSetting';
import { WholesalePriceSetting } from '@/app/auth/setup/corporation/default-setting/components/WholesalePriceSetting';
export default function DefaultSettingPage() {
  const { updateDefaultStoreSetting } = useUpdateDefaultStoreSetting();

  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { corporationId } = useParams();
  const [tax, setTax] = useState<TaxMode>(TaxMode.INCLUDE);
  const [round, setRound] = useState(1);
  const [roundType, setRoundType] = useState<RoundRule>(RoundRule.UP);

  // 仕入れ値表示設定
  const [wholesalePriceSetting, setWholesalePriceSetting] =
    useState<WholesalePriceKeepRule>(WholesalePriceKeepRule.individual);
  // 出庫順: newest: 仕入れ時期古い順(先入先出), oldest: 仕入れ時期新しい順(先入後出), highest: 仕入れ値高い順, lowest: 仕入れ値低い順
  const [outboundOrderSetting, setOutboundOrderSetting] = useState<
    'newest' | 'oldest' | 'highest' | 'lowest'
  >('newest');
  const handleClickComplete = async () => {
    // 仕入れ時期の設定がされていればarrived_atを、仕入れ値の設定がされていればunit_priceを使う
    const useWholesalePriceOrderColumn =
      outboundOrderSetting === 'newest' || outboundOrderSetting === 'oldest'
        ? WholesalePriceOrderColumn.arrived_at
        : WholesalePriceOrderColumn.unit_price;
    // 昇順になっていたらasc、降順になっていたらdesc
    const useWholesalePriceOrderRule =
      outboundOrderSetting === 'newest' || outboundOrderSetting === 'highest'
        ? OrderRule.asc
        : OrderRule.desc;
    try {
      setIsLoading(true);
      await updateDefaultStoreSetting({
        corporationId: Number(corporationId),
        taxMode: tax,
        priceAdjustmentRoundRule: roundType,
        priceAdjustmentRoundRank: round,
        useWholesalePriceOrderColumn: useWholesalePriceOrderColumn,
        wholesalePriceKeepRule: wholesalePriceSetting,
        useWholesalePriceOrderRule: useWholesalePriceOrderRule,
      });
      push(PATH.SETUP.corporation.complete);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Stack alignItems="center" justifyContent="start" height="100%" gap={3}>
      <Stack gap={1} alignItems="center">
        <Typography variant="h1">表示金額・仕入れ値の設定</Typography>
        <Typography variant="body1">全ての所属店舗に適用されます</Typography>
      </Stack>
      <Stack gap={3} alignItems="center">
        <Stack width="300px">
          <PriceSetting
            tax={tax}
            setTax={setTax}
            round={round}
            setRound={setRound}
            roundType={roundType}
            setRoundType={setRoundType}
          />
        </Stack>
        <Stack width="300px">
          <WholesalePriceSetting
            wholesalePriceSetting={wholesalePriceSetting}
            setWholesalePriceSetting={setWholesalePriceSetting}
            outboundOrderSetting={outboundOrderSetting}
            setOutboundOrderSetting={setOutboundOrderSetting}
          />
        </Stack>
      </Stack>
      <Stack width="270px">
        <PrimaryButton onClick={handleClickComplete} loading={isLoading}>
          法人アカウント作成を完了する
        </PrimaryButton>
      </Stack>
    </Stack>
  );
}
