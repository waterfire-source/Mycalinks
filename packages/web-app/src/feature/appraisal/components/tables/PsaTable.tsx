'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/contexts/StoreContext';
import { PATH } from '@/constants/paths';
import { z } from 'zod';
import { useAlert } from '@/contexts/AlertContext';
import { getAppraisalApi } from '@api-defs/appraisal/def';
import { PsaTableContent } from '@/feature/appraisal/components/tables/PsaTableContent';
import { AppraisalDetailModal } from '@/feature/appraisal/components/modals/AppraisalDetailModal';
import { useAppraisal } from '@/feature/appraisal/hooks/useAppraisal';

// 型定義
export type AppraisalResponse = z.infer<typeof getAppraisalApi.response>;
export type AppraisalItem = AppraisalResponse['appraisals'][number];

export const PsaTable = () => {
  const { getAppraisal } = useAppraisal();
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const router = useRouter();

  const [appraisals, setAppraisals] = useState<AppraisalItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAppraisal, setSelectedAppraisal] = useState<
    AppraisalItem | undefined
  >(undefined);

  // 鑑定情報を取得する
  const fetchAppraisal = async () => {
    setIsLoading(true);
    try {
      const appraisal = await getAppraisal({});
      if (!appraisal) return;

      setAppraisals(appraisal.appraisals);
    } catch (e) {
      setAlertState({
        message: '鑑定情報の取得に失敗しました。',
        severity: 'error',
      });

      setAppraisals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onCloseModal = () => {
    setSelectedAppraisal(undefined);
    fetchAppraisal();
  };

  const handleInputResult = (rowId: number) => {
    router.push(PATH.APPRAISAL.input(rowId));
  };

  const handleRowClick = (appraisalId: number) => {
    const target = appraisals.find((a) => a.id === appraisalId);
    if (!target)
      return setAlertState({
        message: '指定された鑑定が存在しません',
        severity: 'error',
      });

    setSelectedAppraisal(target);
  };

  // 初回レンダリング時のデータを取得する
  useEffect(() => {
    fetchAppraisal();
  }, [store.id]);

  return (
    <>
      <PsaTableContent
        appraisals={appraisals}
        isLoading={isLoading}
        handleInputResult={handleInputResult}
        onRowClick={handleRowClick}
      />
      <AppraisalDetailModal
        selectedAppraisal={selectedAppraisal}
        onClose={onCloseModal}
      />
    </>
  );
};
