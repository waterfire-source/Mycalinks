'use client';

import React, { useEffect, useState } from 'react';

import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { CountableProductType } from '@/feature/stock/bundle/components/ProductCountSearchTable';
import { TopBottomLayoutComponent } from '@/components/layouts/TopBottomLayoutComponent';
import { TopContent } from '@/feature/stock/bundle/register/BundleSetting/components/TopContent';
import { SetForm } from '@/feature/stock/bundle/components/SetForm';
import { useRouter } from 'next/navigation';
import { useSetForm } from '@/feature/stock/set/register/SetSetting/hooks/useSetForm';
import { BundleSetProductType } from '@/feature/stock/bundle/components/TabTable';
import { PATH } from '@/constants/paths';
import { useConfirmationModal } from '@/contexts/ConfirmationModalContext';

dayjs.locale('ja');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Tokyo');

export interface SetFormDataType {
  imageUrl?: string;
  setName: string | undefined;
  discount: number | null;
  discountUnit: string;
  startAt?: Date;
  expiredAt?: Date;
}

interface SetSettingProps {
  selectedProducts: CountableProductType[];
  tableHeight: string;
  defaultSet: BundleSetProductType | undefined;
  onQuantityChange: (id: number, newQuantity: number) => void;
  onRemoveProduct: (productID: number) => void;
  onSave: (formData: SetFormDataType) => Promise<void>;
  isEdit?: boolean;
}

export const SetSetting: React.FC<SetSettingProps> = ({
  selectedProducts,
  onQuantityChange: handleQuantityChange,
  onRemoveProduct: handleRemoveProduct,
  onSave: handleSave,
  defaultSet,
  isEdit,
}) => {
  const router = useRouter();
  const handleNavigation = (path: string) => {
    router.push(path);
  };
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    setFormData,
    setSetFormData,
    expiredAtDayjs,
    setExpiredAtDayjs,
    isExpiredAtEnabled,
    imageUrl,
    setImageUrl,
    isFormDisabled,
    handleExpiredAtToggle,
    handleStartAtToggle,
    startAtDayjs,
    isStartAtEnabled,
    handleSetNameChange,
    handleExpiredAtChange,
    handleStartAtChange,
    handleDiscountUnitSelectChange,
    handleDiscountInputChange,
    isDirty,
  } = useSetForm(selectedProducts, defaultSet);

  // フォーム送信時
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setModalVisible(false);
    try {
      await handleSave(setFormData);
      if (isEdit) {
        // 編集の場合はフォームをリセットしない
        return;
      }

      // 成功時新規作成の場合はフォームをリセット
      setSetFormData({
        imageUrl: '',
        setName: undefined,
        discount: null,
        discountUnit: 'JPY',
        expiredAt: undefined,
        startAt: dayjs().tz().startOf('day').toDate(),
      });
      setExpiredAtDayjs(undefined);
      handleNavigation(PATH.STOCK.bundle.root);
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  // 画面遷移確認モーダル表示の制御
  const { setModalVisible } = useConfirmationModal();
  useEffect(() => {
    setModalVisible(selectedProducts.length > 0 || isDirty);
  }, [isDirty, selectedProducts, setModalVisible]);

  return (
    <TopBottomLayoutComponent
      title={'1セット内の登録商品'}
      topContent={
        <TopContent
          selectedProducts={selectedProducts}
          handleQuantityChange={handleQuantityChange}
          handleRemoveProduct={handleRemoveProduct}
        />
      }
      bottomContent={
        <SetForm
          handleSubmit={handleSubmit}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          formData={setFormData}
          handleSetNameInputChange={handleSetNameChange}
          handleExpiredAtToggle={handleExpiredAtToggle}
          isExpiredAtEnabled={isExpiredAtEnabled}
          expiredAtDayjs={expiredAtDayjs}
          handleExpiredAtChange={handleExpiredAtChange}
          isStartAtEnabled={isStartAtEnabled}
          startAtDayjs={startAtDayjs}
          handleStartAtChange={handleStartAtChange}
          handleStartAtToggle={handleStartAtToggle}
          handleDiscountUnitSelectChange={handleDiscountUnitSelectChange}
          handleDiscountInputChange={handleDiscountInputChange}
        />
      }
      loading={isLoading}
      actionButtonText={isEdit ? 'セット編集' : '新規セット作成'}
      onActionButtonClick={(e) => handleSubmit(e as React.FormEvent)}
      isAble={!isFormDisabled}
      cancelButtonText={isEdit ? 'セット編集をやめる' : 'セット作成をやめる'}
      onCancelClick={() => handleNavigation(PATH.STOCK.bundle.root)}
    />
  );
};
