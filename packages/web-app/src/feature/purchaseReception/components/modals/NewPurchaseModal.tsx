import React, { SetStateAction, useEffect, useRef } from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { BackendCustomerAPI } from '@/app/api/store/[store_id]/customer/api';
import { PurchaseReceptionFormData } from '@/feature/purchaseReception/components/modals/NewPurchaseModalContainer';
import { Store } from '@prisma/client';
import { CustomerSearchField } from '@/feature/customer/components/CustomerSearchField';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { MinorField } from '@/feature/purchaseReception/components/modals/modalComponents/minor/MinorField';
import { FormField } from '@/feature/purchaseReception/components/modals/modalComponents/FormField';
import { CreateNoAccountQR } from '@/feature/purchaseReception/components/buttons/CreateNoAccountQR';

interface NewPurchaseModalProps {
  open: boolean; //モーダルの状態
  onClose: () => void; // モーダルを閉じる関数
  onFormSubmit: () => Promise<void>; // フォームを送信する処理
  selected: string | null; // 本人確認書類の選択値
  onSelectionChange: (
    event: React.MouseEvent<HTMLElement>,
    newSelected: string | null,
  ) => void; // 本人確認書類の変更処理
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void; //フォームデータ更新処理
  handleConsentChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => void; // 「保護者同意」のチェックボックスの変更処理
  customer:
    | BackendCustomerAPI[0]['response']['200']
    | BackendCustomerAPI[1]['response']['200'][0]
    | undefined;
  formData: PurchaseReceptionFormData; //フォームデータ
  errors?: Record<string, boolean>; // 各フォームのバリデーション状況
  isFormSubmitting: boolean;
  fetchCustomerByMycaID: (
    storeID: number,
    mycaID?: number,
    mycaBarCode?: string,
  ) => Promise<void>; // IDのフェッチ処理
  store: Store; // ストア情報
  isUserSideValidationComplete: boolean; // 全バリデーションの完了チェック
  handleFileChange: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => Promise<void>; // 保護者承諾書画像のアップロード処理を行う関数
  isMinor: boolean;
  setIsMinor: (value: boolean) => void;
  setFormData: React.Dispatch<SetStateAction<PurchaseReceptionFormData>>;
  otherTitle?: string;
  otherActionButtonText?: string;
  otherAction?: () => Promise<void>;
  otherActionLoading?: boolean;
  isUnsubmitted?: boolean;
  isUnSubmittedPersonalInfo?: boolean;
  isPersonalInformationChecked: boolean;
  handlePersonalInformationChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => void;
  isIdentityVerificationChecked: boolean;
  setIsIdentityVerificationChecked: React.Dispatch<SetStateAction<boolean>>;
}

export const NewPurchaseModal: React.FC<NewPurchaseModalProps> = ({
  open,
  onClose,
  onFormSubmit,
  selected,
  onSelectionChange,
  handleInputChange,
  handleConsentChange,
  customer,
  formData,
  isFormSubmitting,
  fetchCustomerByMycaID,
  store,
  isUserSideValidationComplete,
  handleFileChange,
  isMinor,
  setIsMinor,
  errors,
  setFormData,
  otherTitle,
  otherActionButtonText,
  otherAction,
  otherActionLoading,
  isUnsubmitted,
  isUnSubmittedPersonalInfo,
  isPersonalInformationChecked,
  handlePersonalInformationChange,
  isIdentityVerificationChecked,
  setIsIdentityVerificationChecked,
}) => {
  const membershipNumberRef = useRef<HTMLInputElement | null>(null);
  const theme = useTheme();
  const isIpadSize = useMediaQuery(theme.breakpoints.down('lg'));

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (membershipNumberRef.current) {
          membershipNumberRef.current.focus();
        }
      }, 0);
    }
  }, [open]);

  return (
    <CustomModalWithIcon
      open={open}
      onClose={onClose}
      title={otherTitle ? otherTitle : '新規買取受付'}
      width="90%"
      height="95%"
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
      onActionButtonClick={otherAction ? otherAction : onFormSubmit}
      actionButtonText={
        otherActionButtonText ? otherActionButtonText : '買取番号を発行する'
      }
      loading={isFormSubmitting || otherActionLoading}
      titleIcon={<ReceiptLongIcon />}
      isAble={isUserSideValidationComplete} //バリデーション検証結果を渡す
    >
      <Box component="form" sx={{ px: 5 }}>
        {!isUnSubmittedPersonalInfo && !customer && (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <FormControlLabel
              control={
                <Checkbox
                  name="personalInformation"
                  checked={isPersonalInformationChecked}
                  onChange={handlePersonalInformationChange}
                  sx={{
                    color: 'grey.400',
                  }}
                />
              }
              label="査定完了後に個人情報の提出を求める"
            />
          </Box>
        )}
        <Stack
          direction="row"
          gap="16px"
          py={1}
          alignItems="center"
          justifyContent="space-between"
        >
          {/* TODO カスタマー検索ボタンの修正 */}
          <CustomerSearchField
            store={store}
            fetchCustomerByMycaID={fetchCustomerByMycaID}
            isShowInputField
            ref={membershipNumberRef}
            disabled={isPersonalInformationChecked}
          />
          {customer && !customer.is_active && (
            <CreateNoAccountQR text="QR再発行" />
          )}
        </Stack>
        <Grid container spacing={2}>
          {/* 左側の入力フォーム */}
          <Grid
            item
            sm={isIpadSize ? 8 : 7}
            sx={{ mt: 0.5, pr: isIpadSize ? 9 : 16 }}
          >
            <FormField
              customer={customer}
              selected={selected}
              onSelectionChange={onSelectionChange}
              handleInputChange={handleInputChange}
              formData={formData}
              setFormData={setFormData}
              isUnsubmitted={isUnsubmitted}
              isPersonalInformationChecked={isPersonalInformationChecked}
              isIdentityVerificationChecked={isIdentityVerificationChecked}
              setIsIdentityVerificationChecked={
                setIsIdentityVerificationChecked
              }
            />
          </Grid>

          {/* 右側の入力フォーム */}
          <Grid
            item
            sm={isIpadSize ? 4 : 5}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <MinorField
              isMinor={isMinor}
              setIsMinor={setIsMinor}
              formData={formData}
              setFormData={setFormData}
              handleConsentChange={handleConsentChange}
              handleFileChange={handleFileChange}
              errors={errors}
              isIpadSize={isIpadSize}
            />
          </Grid>
        </Grid>
      </Box>
    </CustomModalWithIcon>
  );
};
