'use client';

import React, { useEffect, useState } from 'react';

import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useBundleForm } from '@/feature/stock/bundle/register/BundleSetting/hooks/useBundleForm';
import { TopBottomLayoutComponent } from '@/components/layouts/TopBottomLayoutComponent';
import { TopContent } from '@/feature/stock/bundle/register/BundleSetting/components/TopContent';
import { BundleForm } from '@/feature/stock/bundle/components/BundleForm';
import { useRouter } from 'next/navigation';
import { CountableProductType } from '@/feature/stock/bundle/components/ProductCountSearchTable';
import { ItemAPIRes } from '@/api/frontend/item/api';
import { PATH } from '@/constants/paths';
import { useConfirmationModal } from '@/contexts/ConfirmationModalContext';

dayjs.locale('ja');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Tokyo');

export interface BundleFormDataType {
  bundleName: string | null;
  sellPrice: number | null;
  bundleStockNumber: number | null;
  genreID: number | null;
  expiredAt?: Date;
  startAt?: Date;
  imageUrl?: string;
}

interface BundleSettingProps {
  selectedProducts: CountableProductType[];
  defaultBundleItem: ItemAPIRes['get']['items'][0] | undefined;
  onQuantityChange: (id: number, newQuantity: number) => void;
  onRemoveProduct: (productID: number) => void;
  onSave: (formData: BundleFormDataType) => Promise<void>;
  isEdit?: boolean;
}

export const BundleSetting: React.FC<BundleSettingProps> = ({
  selectedProducts,
  onQuantityChange: handleQuantityChange,
  onRemoveProduct: handleRemoveProduct,
  onSave: handleSave,
  defaultBundleItem,
  isEdit,
}) => {
  // ロード管理
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // フォームの状態を一括管理
  const {
    bundleFormData,
    setBundleFormData,
    expiredAtDayjs,
    setExpiredAtDayjs,
    isExpiredAtEnabled,
    imageUrl,
    setImageUrl,
    handleExpiredAtToggle,
    handleBundleNameInputChange,
    handleGenreSelectChange,
    handleSellPriceInputChange,
    handleBundleStockNumberChange,
    handleExpiredAtChange,
    isFormDisabled,
    isStartAtEnabled,
    startAtDayjs,
    handleStartAtChange,
    handleStartAtToggle,
    isDirty,
  } = useBundleForm(selectedProducts);
  // バンドルの初期値を設定
  useEffect(() => {
    if (defaultBundleItem) {
      setBundleFormData({
        bundleName: defaultBundleItem.display_name,
        sellPrice: defaultBundleItem.sell_price,
        bundleStockNumber: defaultBundleItem.init_stock_number,
        genreID: defaultBundleItem.genre_id,
        startAt: defaultBundleItem.start_at ?? undefined,
        expiredAt: defaultBundleItem.expire_at ?? undefined,
        imageUrl: defaultBundleItem.image_url ?? undefined,
      });
      setImageUrl(defaultBundleItem.image_url ?? null);
    }
  }, [defaultBundleItem, setBundleFormData, setImageUrl]);
  // フォーム送信時
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setModalVisible(false);
    try {
      await handleSave(bundleFormData);
      if (isEdit) {
        // 編集の場合はフォームをリセットしない
        return;
      }
      // 成功時新規作成の場合はフォームをリセット
      setBundleFormData({
        bundleName: null,
        sellPrice: null,
        bundleStockNumber: null,
        genreID: null,
        expiredAt: undefined,
        startAt: dayjs().tz().startOf('day').toDate(),
        imageUrl: undefined,
      });
      setExpiredAtDayjs(undefined);
      setImageUrl(null);
      router.push(PATH.STOCK.bundle.root);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const router = useRouter();

  // 画面遷移確認モーダル表示の制御
  const { setModalVisible } = useConfirmationModal();
  useEffect(() => {
    setModalVisible(selectedProducts.length > 0 || isDirty);
  }, [isDirty, selectedProducts, setModalVisible]);

  return (
    <TopBottomLayoutComponent
      title={'1バンドル内の登録商品'}
      topContent={
        <TopContent
          selectedProducts={selectedProducts}
          handleQuantityChange={handleQuantityChange}
          handleRemoveProduct={handleRemoveProduct}
        />
      }
      bottomContent={
        <BundleForm
          handleSubmit={handleSubmit}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          formData={bundleFormData}
          handleBundleNameInputChange={handleBundleNameInputChange}
          handleGenreSelectChange={handleGenreSelectChange}
          handleSellPriceInputChange={handleSellPriceInputChange}
          handleBundleStockNumberChange={handleBundleStockNumberChange}
          handleExpiredAtToggle={handleExpiredAtToggle}
          isExpiredAtEnabled={isExpiredAtEnabled}
          expiredAtDayjs={expiredAtDayjs}
          handleExpiredAtChange={handleExpiredAtChange}
          isStartAtEnabled={isStartAtEnabled}
          startAtDayjs={startAtDayjs}
          handleStartAtChange={handleStartAtChange}
          handleStartAtToggle={handleStartAtToggle}
        />
      }
      loading={isLoading}
      actionButtonText={isEdit ? 'バンドル編集' : '新規バンドル作成'}
      onActionButtonClick={(e) => handleSubmit(e as React.FormEvent)}
      isAble={!isFormDisabled}
      cancelButtonText={
        isEdit ? 'バンドル編集をやめる' : 'バンドル作成をやめる'
      }
      onCancelClick={() => router.push(PATH.STOCK.bundle.root)}
    />
  );
};
