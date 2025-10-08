'use client';

import React, { useState } from 'react';
import { Box, Stack } from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';

import { useEditBundleModal } from '@/feature/stock/bundle/components/EditBundleModal/hooks/useEditBundleModal';
import { useBundleForm } from '@/feature/stock/bundle/register/BundleSetting/hooks/useBundleForm';
import BundleSetTable from '@/feature/stock/bundle/components/EditBundleModal/components/BundleSetTable';
import { DetailCard } from '@/components/cards/DetailCard';
import { BundleSetProductType } from '@/feature/stock/bundle/components/TabTable';
import { BundleFormDataType } from '@/feature/stock/bundle/register/BundleSetting/BundleSetting';
import { useEditBundleByForm } from '@/feature/stock/bundle/hooks/useEditBundleByForm';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';
import { useSetForm } from '@/feature/stock/set/register/SetSetting/hooks/useSetForm';
import { SetFormDataType } from '@/feature/stock/set/register/SetSetting/SetSetting';
import { useEditSetByForm } from '@/feature/stock/bundle/hooks/useEditSetByForm';
import { SetForm } from '@/feature/stock/bundle/components/EditBundleModal/components/SetForm';
import { BundleForm } from '@/feature/stock/bundle/components/EditBundleModal/components/BundleForm';

dayjs.locale('ja');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Tokyo');

interface EditBundleModalProps {
  open: boolean;
  storeID: number;
  bundle: BundleSetProductType;
  onClose: () => void;
  onDismantle: () => Promise<void>;
  isDismantleLoading: boolean;
  setFetchTableDataTrigger: React.Dispatch<React.SetStateAction<number>>;
}

export const EditBundleModal: React.FC<EditBundleModalProps> = ({
  open,
  onClose: handleClose,
  storeID,
  bundle,
  onDismantle: handleDismantle,
  isDismantleLoading,
  setFetchTableDataTrigger,
}) => {
  // ロード管理
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { updateBundleByForm } = useEditBundleByForm();
  const { updateSetByForm } = useEditSetByForm();
  const { push } = useRouter();
  const { bundledProducts } = useEditBundleModal({
    storeID,
    bundle,
    setIsLoading,
  });

  // バンドルフォームの状態を一括管理
  const {
    bundleFormData,
    isFormDisabled: isBundleFormDisabled,
    imageUrl: bundleImageUrl,
    setImageUrl: setBundleImageUrl,
    handleExpiredAtToggle: handleBundleExpiredAtToggle,
    isExpiredAtEnabled: isBundleExpiredAtEnabled,
    expiredAtDayjs: bundleExpiredAtDayjs,
    handleExpiredAtChange: handleBundleExpiredAtChange,
    isStartAtEnabled: isBundleStartAtEnabled,
    startAtDayjs: bundleStartAtDayjs,
    handleStartAtChange: handleBundleStartAtChange,
    handleStartAtToggle: handleBundleStartAtToggle,
    handleBundleNameInputChange,
    handleGenreSelectChange,
    handleSellPriceInputChange,
    handleBundleStockNumberChange,
  } = useBundleForm(bundledProducts, bundle);

  // セットのフォームの状態を一括管理
  const {
    setFormData,
    isFormDisabled: isSetFormDisabled,
    imageUrl: setDealImageUrl,
    setImageUrl: setSetDealImageUrl,
    handleExpiredAtToggle: handleSetDealExpiredAtToggle,
    isExpiredAtEnabled: isSetDealExpiredAtEnabled,
    expiredAtDayjs: setDealExpiredAtDayjs,
    handleExpiredAtChange: handleSetDealExpiredAtChange,
    isStartAtEnabled: isSetDealStartAtEnabled,
    startAtDayjs: setDealStartAtDayjs,
    handleStartAtChange: handleSetDealStartAtChange,
    handleStartAtToggle: handleSetDealStartAtToggle,
    handleSetNameChange,
    handleDiscountUnitSelectChange,
    handleDiscountInputChange,
    setStartAtDayjs: setSetStartAtDayjs,
    setExpiredAtDayjs: setSetExpiredAtDayjs,
  } = useSetForm(bundledProducts, bundle);

  // バンドルフォーム保存処理
  const handleBundleSave = async (
    formData: BundleFormDataType | SetFormDataType,
  ) => {
    try {
      switch (bundle.productType) {
        case 'bundle':
          await updateBundleByForm(formData as BundleFormDataType, bundle);
          break;
        case 'set':
          await updateSetByForm(formData as SetFormDataType, bundle);
          break;
      }
    } catch (e) {
      console.error(e);
    }
  };
  // セットフォーム保存処理
  const handleSetSave = async (formData: SetFormDataType) => {
    try {
      await updateSetByForm(formData, bundle);
    } catch (e) {
      console.error(e);
    }
  };

  // フォーム送信時
  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      if (bundle.productType === 'bundle') {
        await handleBundleSave(bundleFormData);
      } else {
        await handleSetSave(setFormData);
      }
      handleClose();
    } catch (e) {
      console.error(e);
    }
    setFetchTableDataTrigger((prev) => prev + 1);
    setIsLoading(false);
  };

  return (
    <CustomModalWithIcon
      open={open}
      onClose={handleClose}
      title={bundle.productType === 'bundle' ? 'バンドル詳細' : 'セット詳細'}
      width="90%"
      height="90%"
      actionButtonText="編集内容を保存"
      onActionButtonClick={handleSubmit}
      cancelButtonText="編集内容を破棄"
      secondActionButtonText={
        bundle.productType === 'bundle' ? 'バンドル解除' : 'セット解体'
      }
      onSecondActionButtonClick={handleDismantle}
      isSecondActionButtonLoading={isDismantleLoading}
      loading={isLoading}
      isAble={
        bundle.productType === 'bundle'
          ? !isBundleFormDisabled
          : !isSetFormDisabled
      }
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
        }}
      >
        <Box
          sx={{
            width: '35%',
            height: '100%',
            display: 'flex',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {bundle.productType === 'set' ? (
              <SetForm
                set={bundle}
                handleSubmit={handleSubmit}
                imageUrl={setDealImageUrl}
                setImageUrl={setSetDealImageUrl}
                formData={setFormData}
                handleExpiredAtToggle={handleSetDealExpiredAtToggle}
                isExpiredAtEnabled={isSetDealExpiredAtEnabled}
                expiredAtDayjs={setDealExpiredAtDayjs}
                handleExpiredAtChange={handleSetDealExpiredAtChange}
                isStartAtEnabled={isSetDealStartAtEnabled}
                startAtDayjs={setDealStartAtDayjs}
                handleStartAtChange={handleSetDealStartAtChange}
                handleStartAtToggle={handleSetDealStartAtToggle}
                handleSetNameInputChange={handleSetNameChange}
                handleDiscountUnitSelectChange={handleDiscountUnitSelectChange}
                handleDiscountInputChange={handleDiscountInputChange}
                setStartAtDayjs={setSetStartAtDayjs}
                setExpiredAtDayjs={setSetExpiredAtDayjs}
              />
            ) : (
              <BundleForm
                bundle={bundle}
                handleSubmit={handleSubmit}
                imageUrl={bundleImageUrl}
                setImageUrl={setBundleImageUrl}
                formData={bundleFormData}
                handleBundleNameInputChange={handleBundleNameInputChange}
                handleGenreSelectChange={handleGenreSelectChange}
                handleSellPriceInputChange={handleSellPriceInputChange}
                handleBundleStockNumberChange={handleBundleStockNumberChange}
                handleExpiredAtToggle={handleBundleExpiredAtToggle}
                isExpiredAtEnabled={isBundleExpiredAtEnabled}
                expiredAtDayjs={bundleExpiredAtDayjs}
                handleExpiredAtChange={handleBundleExpiredAtChange}
                isStartAtEnabled={isBundleStartAtEnabled}
                startAtDayjs={bundleStartAtDayjs}
                handleStartAtChange={handleBundleStartAtChange}
                handleStartAtToggle={handleBundleStartAtToggle}
              />
            )}
          </Box>
        </Box>
        <Box
          sx={{
            width: '65%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* ProductList部分 */}
          <Box
            sx={{
              width: '100%',
              flex: 1,
              overflowY: 'auto',
              borderTop: (theme) => `7px solid ${theme.palette.primary.main}`,
            }}
          >
            <DetailCard
              titleHidden={true}
              content={
                <BundleSetTable
                  products={bundledProducts}
                  isLoading={isLoading}
                />
              }
              contentSx={{
                padding: 0,
              }}
              bottomContent={
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="space-between"
                  width="100%"
                >
                  <SecondaryButton
                    disabled={
                      bundle.bundleStockNumber !== bundle.initStockNumber
                    }
                    onClick={() => {
                      if (bundle.productType === 'bundle') {
                        push(PATH.STOCK.bundle.edit(bundle.id));
                      } else {
                        push(PATH.STOCK.set.edit(bundle.id));
                      }
                    }}
                  >
                    {bundle.productType === 'bundle'
                      ? 'バンドル内容を編集'
                      : 'セット内容を編集'}
                  </SecondaryButton>
                  <PrimaryButton
                    onClick={() => {
                      if (bundle.productType === 'bundle') {
                        push(
                          `${PATH.STOCK.bundle.register}?id=${bundle.id}`,
                        );
                      } else {
                        push(`${PATH.STOCK.set.register}?id=${bundle.id}`);
                      }
                    }}
                  >
                    内容をコピーして新規作成
                  </PrimaryButton>
                </Stack>
              }
            />
          </Box>
        </Box>
      </Box>
    </CustomModalWithIcon>
  );
};
