'use client';

import React, { useEffect, useState } from 'react';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { Box, Stack } from '@mui/material';
import { PsaRegisterTable } from '@/feature/appraisal/components/tables/PsaRegisterTable';
import { useParams } from 'next/navigation';
import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
import { MycaPosApiClient } from 'api-generator/client';
import { getAppraisalApi } from '@api-defs/appraisal/def';
import z from 'zod';
import { Categories, useCategory } from '@/feature/category/hooks/useCategory';
import { AppraisalFeeTable } from '@/feature/appraisal/components/tables/AppraisalFeeTable';

// APIで取得するレスポンスの型定義
type AppraisalResponse = z.infer<typeof getAppraisalApi.response>;
type AppraisalItem = AppraisalResponse['appraisals'][number];

export type CardConditions =
  Categories['itemCategories'][0]['condition_options'];

const PsaRegisterPage: React.FC = () => {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const { fetchCategoryList, category } = useCategory();

  const [appraisalDate, setAppraisalDate] = useState<string>('');
  const [localAppraisal, setLocalAppraisal] = useState<AppraisalItem | null>(
    null,
  );
  const [isLoadingAppraisal, setIsLoadingAppraisal] = useState(false);

  const params = useParams<{ PSAID: string }>();
  const PSAID = params.PSAID;
  const apiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });

  const cardConditions: CardConditions =
    category?.itemCategories.find((i) => i.handle === 'CARD')
      ?.condition_options ?? [];

  const parseDate = (value: string | null | undefined): Date | null => {
    return value ? new Date(value) : null;
  };

  // 鑑定先を取得する
  const fetchAppraisal = async () => {
    if (!PSAID || !store.id) return;

    setIsLoadingAppraisal(true);
    try {
      const res = await apiClient.appraisal.getAppraisal({
        storeId: store.id,
        id: Number(PSAID),
      });

      // APIから取得した日付フィールドを Date 型に変換し、定義に合わせる
      const converted = res.appraisals.map((appraisal) => ({
        ...appraisal,
        shipping_date: parseDate(appraisal.shipping_date),
        created_at: parseDate(appraisal.created_at),
        updated_at: parseDate(appraisal.updated_at),
        products: appraisal.products.map((product) => ({
          ...product,
        })),
      }));

      const appraisal = converted[0];

      if (appraisal) {
        setLocalAppraisal(appraisal);
        setAppraisalDate(
          appraisal.shipping_date
            ? new Date(appraisal.shipping_date).toLocaleDateString()
            : '',
        );
      }
    } catch (e) {
      setAlertState({
        message: '鑑定情報の取得に失敗しました。',
        severity: 'error',
      });
      console.error('鑑定情報の取得に失敗しました。', e);
    } finally {
      setIsLoadingAppraisal(false);
    }
  };

  useEffect(() => {
    fetchCategoryList();
  }, []);

  // コンポーネント初回レンダリング時に鑑定情報を取得
  useEffect(() => {
    fetchAppraisal();
  }, [PSAID, store.id]);

  return (
    <ContainerLayout title={`査定結果入力 (${appraisalDate} 提出分)`}>
      {localAppraisal && (
        <Stack sx={{ height: '100%' }} spacing={2}>
          <Box sx={{ minHeight: 0 }}>
            <AppraisalFeeTable appraisal={localAppraisal} />
          </Box>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <PsaRegisterTable
              appraisal={localAppraisal}
              cardConditions={cardConditions}
              isLoading={isLoadingAppraisal}
            />
          </Box>
        </Stack>
      )}
    </ContainerLayout>
  );
};

export default PsaRegisterPage;
