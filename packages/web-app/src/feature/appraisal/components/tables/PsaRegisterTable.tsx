import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';
import { useSession } from 'next-auth/react';
import { useAlert } from '@/contexts/AlertContext';
import { MycaPosApiClient } from 'api-generator/client';
import { getAppraisalApi } from 'api-generator';
import z from 'zod';
import { useGetSpecialty } from '@/feature/specialty/hooks/useGetSpecialty';
import { useStore } from '@/contexts/StoreContext';
import { CardConditions } from '@/app/auth/(dashboard)/appraisal/[PSAID]/page';
import { PsaRegisterTableContent } from '@/feature/appraisal/components/tables/PsaRegisterTableContent';
import { CustomError } from '@/api/implement';

// APIで取得するレスポンスの型定義
type AppraisalResponse = z.infer<typeof getAppraisalApi.response>;
type AppraisalItem = AppraisalResponse['appraisals'][number];

interface PsaRegisterTableProps {
  appraisal: AppraisalItem;
  cardConditions: CardConditions;
  isLoading: boolean;
}

interface UserInput {
  sell_price?: number;
  condition_option_id?: number;
  appraisal_number?: string;
  specialty_id?: number;
  appraisal_fee?: number;
  check?: boolean;
}

export const PsaRegisterTable: React.FC<PsaRegisterTableProps> = ({
  appraisal,
  cardConditions,
  isLoading: isFetching,
}) => {
  const router = useRouter();
  const { setAlertState } = useAlert();
  const { data: session } = useSession();
  const { specialties, fetchSpecialty } = useGetSpecialty();
  const { store } = useStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const staffAccountId = session?.user?.id;
  const apiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });

  const [userInputs, setUserInputs] = useState<{
    [appraisalId: number]: UserInput;
  }>({});

  useEffect(() => {
    fetchSpecialty({ kind: 'APPRAISAL' });
  }, [store.id]);

  useEffect(() => {
    const initialUserInputs: { [productId: number]: UserInput } = {};
    appraisal.products.forEach((product) => {
      initialUserInputs[product.id] = {
        sell_price: product.sell_price ?? undefined,
        condition_option_id:
          product.condition_option_id ?? cardConditions[0]?.id,
        appraisal_number: '',
        specialty_id: undefined,
        appraisal_fee: product.appraisal_fee ?? 0,
        check: true,
      };
    });

    setUserInputs(initialUserInputs);
  }, [appraisal.products]);

  const handleInputChange = useCallback(
    (productId: number, field: keyof UserInput, value: any) => {
      setUserInputs((prevInputs) => ({
        ...prevInputs,
        [productId]: {
          ...prevInputs[productId],
          [field]: value,
        },
      }));
    },
    [],
  );

  // 全ての入力が有効かをチェック
  const isAllInputsValid = useMemo(() => {
    return appraisal.products.length > 0;
  }, [appraisal.products]);

  const handleSubmit = async () => {
    if (!appraisal || !staffAccountId || !isAllInputsValid) return;
    //鑑定結果が無しの時に、それなりの設定をする
    setIsSubmitting(true);
    try {
      const appraisalRes = await apiClient.appraisal.getAppraisal({
        storeId: store.id,
        id: appraisal.id,
      });

      const checkedCount = Object.values(userInputs).filter(
        (input) => input.check === true,
      ).length;

      //型がうまくいかないので無理やり
      const currentAppraisal = appraisalRes
        .appraisals[0] as (typeof appraisalRes.appraisals)[0] & {
        shipping_fee?: number;
        insurance_fee?: number;
        handling_fee?: number;
        other_fee?: number;
      };

      const feeSum =
        (currentAppraisal.shipping_fee ?? 0) +
        (currentAppraisal.insurance_fee ?? 0) +
        (currentAppraisal.handling_fee ?? 0) +
        (currentAppraisal.other_fee ?? 0);

      if (appraisalRes instanceof CustomError) throw appraisalRes;

      await apiClient.appraisal.inputAppraisalResult({
        storeId: appraisal.store_id,
        appraisalId: appraisal.id,
        requestBody: {
          products: appraisal.products.map((product) => {
            const currentPlusFee = userInputs[product.id].check
              ? feeSum / checkedCount
              : 0;

            const actualAppraisalFee =
              (userInputs[product.id]?.appraisal_fee ?? 0) + currentPlusFee;

            return {
              id: product.id,
              appraisal_number:
                userInputs[product.id]?.appraisal_number || undefined,
              sell_price: userInputs[product.id]?.sell_price,
              condition_option_id:
                userInputs[product.id]?.condition_option_id ??
                cardConditions[0]?.id,
              specialty_id: userInputs[product.id]?.specialty_id || null,
              appraisal_fee: Math.round(actualAppraisalFee),
            };
          }),
        },
      });

      setAlertState({
        message: '鑑定結果登録が完了しました。',
        severity: 'success',
      });
      router.push(PATH.APPRAISAL.root);
    } catch (e) {
      setAlertState({
        message: '鑑定結果登録に失敗しました',
        severity: 'error',
      });
      console.error('鑑定結果登録に失敗しました:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PsaRegisterTableContent
      appraisal={appraisal}
      cardConditions={cardConditions}
      isFetching={isFetching}
      isSubmitting={isSubmitting}
      userInputs={userInputs}
      specialties={specialties}
      onInputChange={handleInputChange}
      onSubmit={handleSubmit}
      isAllInputsValid={isAllInputsValid}
    />
  );
};
