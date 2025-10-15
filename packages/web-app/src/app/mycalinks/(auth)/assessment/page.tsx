'use client';

import { useState } from 'react';
import { Store } from '@prisma/client';
import { StoreSelectStep } from '@/app/mycalinks/(auth)/assessment/components/StoreSelectStep';
import { TermsAgreementStep } from '@/app/mycalinks/(auth)/assessment/components/TermsAgreementStep';
import { AssessmentMainStep } from '@/app/mycalinks/(auth)/assessment/components/AssessmentMainStep';
import { useGlobalNotify } from '@/app/mycalinks/(auth)/assessment/hooks/useGlobalNotify';
import { useStoresWithDraftTransactions } from '@/app/mycalinks/(auth)/assessment/hooks/useStoresWithDraftTransactions';
import Loader from '@/components/common/Loader';
import { Typography } from '@mui/material';
import { TransactionCompletedScreen } from '@/app/mycalinks/(auth)/assessment/components/TransactionCompletedScreen';

export enum AssessmentStep {
  STORE_SELECT = 'store-select',
  TERMS_AGREEMENT = 'terms-agreement',
  ASSESSMENT_MAIN = 'assessment-main',
}

export default function AssessmentPage() {
  const [currentStep, setCurrentStep] = useState<AssessmentStep>(
    AssessmentStep.STORE_SELECT,
  );
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const { notifyInfo, allTransactions } = useGlobalNotify(selectedStore?.id);
  const { loading: storesLoading } = useStoresWithDraftTransactions();

  // 店舗選択完了ハンドラー
  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store);

    // 選択した店舗の取引情報を取得
    const storeTransaction = allTransactions.find(
      (t) => t.store_id === store.id,
    );

    // 利用規約が既に同意済みの場合は査定画面に直接移動
    if (storeTransaction?.term_accepted_at) {
      setCurrentStep(AssessmentStep.ASSESSMENT_MAIN);
    } else {
      setCurrentStep(AssessmentStep.TERMS_AGREEMENT);
    }
  };

  // 利用規約同意完了ハンドラー
  const handleTermsAccepted = () => {
    setCurrentStep(AssessmentStep.ASSESSMENT_MAIN);
  };

  // 店舗選択画面に戻るハンドラー
  const handleBackToStoreSelect = () => {
    setSelectedStore(null);
    setCurrentStep(AssessmentStep.STORE_SELECT);
  };

  if (storesLoading || notifyInfo.purchaseReception.id === 0) return <Loader />;

  // 全体で取引情報がない場合、またはselectedStoreがあるが該当する取引がない場合
  if (
    allTransactions.length === 0 ||
    (selectedStore &&
      !allTransactions.find((t) => t.store_id === selectedStore.id))
  ) {
    return <TransactionCompletedScreen />;
  }

  switch (currentStep) {
    // 店舗選択
    case AssessmentStep.STORE_SELECT:
      return <StoreSelectStep onStoreSelect={handleStoreSelect} />;

    // 利用規約
    case AssessmentStep.TERMS_AGREEMENT:
      if (!selectedStore) {
        return <Typography>店舗が選択されていません</Typography>;
      }
      return (
        <TermsAgreementStep
          selectedStore={selectedStore}
          onTermsAccepted={handleTermsAccepted}
          onBackToStoreSelect={handleBackToStoreSelect}
        />
      );

    // 査定中・査定完了画面
    case AssessmentStep.ASSESSMENT_MAIN:
      if (!selectedStore) {
        return <Typography>店舗が選択されていません</Typography>;
      }
      return (
        <AssessmentMainStep
          selectedStore={selectedStore}
          onBackToStoreSelect={handleBackToStoreSelect}
        />
      );

    default:
      return <StoreSelectStep onStoreSelect={handleStoreSelect} />;
  }
}
