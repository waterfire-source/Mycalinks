import { Box, Typography } from '@mui/material';
import { IdentityVerificationForm } from '@/feature/purchaseReception/components/modals/modalComponents/IdentityVerificationForm';
import { RequiredField } from '@/feature/purchaseReception/components/modals/modalComponents/RequiredField';
import { BackendCustomerAPI } from '@/app/api/store/[store_id]/customer/api';
import { PurchaseReceptionFormData } from '@/feature/purchaseReception/components/modals/NewPurchaseModalContainer';
import { SetStateAction, useMemo } from 'react';
import { calculateAge } from '@/feature/customer/utils';

interface props {
  customer:
    | BackendCustomerAPI[0]['response']['200']
    | BackendCustomerAPI[1]['response']['200'][0]
    | undefined;
  selected: string | null; // 本人確認書類の選択値
  onSelectionChange: (
    event: React.MouseEvent<HTMLElement>,
    newSelected: string | null,
  ) => void; // 本人確認書類の変更処理
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void; //フォームデータ更新処理
  formData: PurchaseReceptionFormData; //フォームデータ
  setFormData: React.Dispatch<SetStateAction<PurchaseReceptionFormData>>;
  isUnsubmitted?: boolean;
  isPersonalInformationChecked: boolean;
  isIdentityVerificationChecked: boolean;
  setIsIdentityVerificationChecked: React.Dispatch<SetStateAction<boolean>>;
}

export const FormField = ({
  customer,
  selected,
  onSelectionChange,
  handleInputChange,
  formData,
  setFormData,
  isUnsubmitted,
  isPersonalInformationChecked,
  isIdentityVerificationChecked,
  setIsIdentityVerificationChecked,
}: props) => {
  //Date型の変換
  const formatDate = (date: Date | string): string => {
    if (!date) return ''; // nullやundefinedの場合は空文字を返す

    // Date型でない場合は変換
    const validDate = date instanceof Date ? date : new Date(date);

    if (isNaN(validDate.getTime())) {
      return ''; // 無効な日付の場合
    }

    const year = validDate.getFullYear();
    const month = String(validDate.getMonth() + 1).padStart(2, '0'); // 月は0始まり
    const day = String(validDate.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  // 顧客の来店回数
  const customerVisitCount = useMemo(() => {
    if (customer && 'transactionStats' in customer) {
      return (customer as { transactionStats: { numberOfVisits: number } })
        .transactionStats.numberOfVisits;
    }
    return undefined;
  }, [customer]);

  return (
    <>
      {/* 会員情報 */}
      <Box>
        {[
          { label: '氏名', value: customer?.full_name || '' },
          {
            label: 'フリガナ',
            value: customer?.full_name_ruby || '',
          },
          {
            label: '生年月日',
            value: customer?.birthday
              ? `${formatDate(customer.birthday)} (${calculateAge(customer)}歳)`
              : '',
          },
          { label: '郵便番号', value: customer?.zip_code || '' },
          { label: '住所', value: customer?.address || '' },
          { label: '電話番号', value: customer?.phone_number || '' },
          { label: '性別', value: customer?.gender || '' },
          { label: '職業', value: customer?.career || '' },
        ].map((field, index) => (
          <Box key={index}>
            <RequiredField
              label={field.label}
              value={field.value}
              error={!field.value && !isPersonalInformationChecked}
              helperText={
                !field.value && !isPersonalInformationChecked
                  ? `${field.label}情報が不足しています`
                  : ''
              }
              additions={
                customerVisitCount
                  ? field.label === '氏名' && (
                      <Typography
                        ml={1}
                        variant="body2"
                        sx={{ whiteSpace: 'nowrap', fontSize: '14px' }}
                      >
                        {/* 何回目の受付かなので今までの取引の数+1 */}
                        {`(${customerVisitCount + 1}回目)`}
                      </Typography>
                    )
                  : undefined
              }
            />
          </Box>
        ))}
      </Box>
      <IdentityVerificationForm
        selected={selected}
        onSelectionChange={onSelectionChange}
        isIdentityVerificationChecked={isIdentityVerificationChecked}
        setIsIdentityVerificationChecked={setIsIdentityVerificationChecked}
        handleInputChange={handleInputChange}
        formData={formData}
        setFormData={setFormData}
        isUnsubmitted={isUnsubmitted}
      />
    </>
  );
};
