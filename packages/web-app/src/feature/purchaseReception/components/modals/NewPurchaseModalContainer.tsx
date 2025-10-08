import React, { useState, useEffect } from 'react';
import { NewPurchaseModal } from '@/feature/purchaseReception/components/modals/NewPurchaseModal';
import { useStore } from '@/contexts/StoreContext';
import { BackendCustomerAPI } from '@/app/api/store/[store_id]/customer/api';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useValidation } from '@/feature/purchaseReception/hooks/useValidation';
import { BackendTransactionAPI } from '@/app/api/store/[store_id]/transaction/api';

interface NewPurchaseModalContainerProps {
  open: boolean;
  onClose: () => void;
  onFormSubmit: ({
    id_kind,
    id_number,
    parental_consent_image_url,
    description,
    parental_contact,
  }: PurchaseReceptionFormData) => Promise<void>;
  onFormSubmitLoading?: boolean;
  customer:
    | BackendCustomerAPI[0]['response']['200']
    | BackendCustomerAPI[1]['response']['200'][0]
    | undefined;
  // onBarcodeScan: () => void;
  fetchCustomerByMycaID: (
    storeID: number,
    mycaID?: number,
    mycaBarCode?: string,
  ) => Promise<void>;
  fetchCustomerByCustomerID?: (
    storeID: number,
    customerID: number,
    includesTransactionStats?: true,
  ) => Promise<void>;
  otherTitle?: string;
  otherActionButtonText?: string;
  otherAction?: ({
    id_kind,
    id_number,
    parental_consent_image_url,
    parental_contact,
  }: PurchaseReceptionFormData) => Promise<void>;
  otherActionLoading?: boolean;
  isUnsubmitted?: boolean;
  isUnSubmittedPersonalInfo?: boolean;
  transaction?: BackendTransactionAPI[5]['response']['200']['transactions'][0];
}

export interface PurchaseReceptionFormData {
  id_kind: string;
  id_number?: string;
  parental_consent_image_url: string; //買取承諾書承諾書
  description: string;
  consent: boolean;
  parental_contact: string;
}

//会員情報読み取りモーダル
export const NewPurchaseModalContainer: React.FC<
  NewPurchaseModalContainerProps
> = ({
  open,
  onClose,
  onFormSubmit,
  onFormSubmitLoading,
  customer,
  fetchCustomerByMycaID,
  fetchCustomerByCustomerID,
  otherTitle,
  otherActionButtonText,
  otherAction,
  otherActionLoading,
  isUnsubmitted,
  isUnSubmittedPersonalInfo,
  transaction,
}) => {
  const [selected, setSelected] = useState<string | null>(null);

  const { store } = useStore();
  const { setAlertState } = useAlert();

  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  // 個人情報確認の同意チェックボックスの状態を管理
  const [isPersonalInformationChecked, setIsPersonalInformationChecked] =
    useState(false);

  // 身分証明書確認の同意チェックボックスの状態を管理
  const [isIdentityVerificationChecked, setIsIdentityVerificationChecked] =
    useState(false);

  const {
    formData,
    setFormData,
    runValidation,
    errors,
    setErrors,
    isUserSideValidationComplete,
    setIsUserSideValidationComplete,
    controlAge,
    isMinor,
    setIsMinor,
  } = useValidation({
    customer,
    isPersonalInformationChecked,
    isIdentityVerificationChecked,
  });

  useEffect(() => {
    controlAge();
  }, [controlAge]);

  useEffect(() => {
    const fetchCustomer = async () => {
      if (fetchCustomerByCustomerID && customer?.id && store?.id) {
        try {
          await fetchCustomerByCustomerID(store.id, customer.id, true);
        } catch (error) {
          console.error('顧客情報の取得に失敗しました。');
          setAlertState({
            message: '顧客情報の取得に失敗しました。',
            severity: 'error',
          });
        }
      }
    };
    fetchCustomer();
  }, [customer?.id, fetchCustomerByCustomerID, store?.id, setAlertState]);

  useEffect(() => {
    const isValid = runValidation();
    setIsUserSideValidationComplete(isValid);
  }, [formData, selected, runValidation, setIsUserSideValidationComplete]);

  useEffect(() => {
    if (transaction) {
      setFormData({
        id_kind: transaction.id_kind ?? '',
        id_number: transaction.id_number ?? '',
        parental_consent_image_url:
          transaction.parental_consent_image_url ?? '',
        description: transaction.description ?? '',
        consent:
          transaction.parental_contact &&
          !isNaN(Number(transaction.parental_contact))
            ? true
            : isMinor,
        parental_contact: transaction.parental_contact ?? '',
      });
      setSelected(transaction.id_kind);
    }
  }, [transaction]);

  const handleSelectionChange = (
    event: React.MouseEvent<HTMLElement>,
    newSelected: string | null,
  ) => {
    setSelected(newSelected);

    if (newSelected !== null) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        id_kind: newSelected,
      }));
    }
  };

  const onFormSubmitWithLoading = async () => {
    setIsFormSubmitting(true);
    onFormSubmit(formData);
    setIsFormSubmitting(false);
  };

  const onOtherActionWithLoading = async () => {
    setIsFormSubmitting(true);
    try {
      if (otherAction) {
        await otherAction(formData);
      }
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.files && event.target.files[0]) {
      const clientApi = createClientAPI();
      const res = await clientApi.functions.uploadImage({
        store_id: store?.id,
        body: {
          kind: 'transaction',
          file: event.target.files[0],
        },
      });

      if (res instanceof CustomError) {
        setAlertState({ message: res.message, severity: 'error' });
        return;
      }

      setFormData((prevFormData) => ({
        ...prevFormData,
        parental_consent_image_url: res.imageUrl,
      }));

      console.info('保護者承諾書をアップロードしました', res.imageUrl);
      setAlertState({
        message: '保護者承諾書をアップロードしました',
        severity: 'success',
      });
      const isValid = runValidation();
      setIsUserSideValidationComplete(isValid);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleConsentChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    setFormData({
      ...formData,
      consent: checked,
    });
  };

  const handleModalClose = () => {
    // フォームリセット
    setFormData({
      id_kind: '',
      id_number: '',
      parental_consent_image_url: '',
      description: '',
      consent: false,
      parental_contact: '',
    });
    setSelected(null);
    setErrors({});
    setIsUserSideValidationComplete(false);
    onClose();
    setIsMinor(false);
    setIsPersonalInformationChecked(false);
  };

  const handlePersonalInformationChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    setIsPersonalInformationChecked(checked);
  };

  return (
    <>
      <NewPurchaseModal
        open={open}
        onClose={handleModalClose}
        onFormSubmit={onFormSubmitWithLoading}
        selected={selected}
        onSelectionChange={handleSelectionChange}
        customer={customer}
        formData={formData}
        handleInputChange={handleInputChange}
        handleConsentChange={handleConsentChange}
        // onBarcodeScan={onBarcodeScan}
        isFormSubmitting={isFormSubmitting || onFormSubmitLoading || false}
        fetchCustomerByMycaID={fetchCustomerByMycaID}
        store={store}
        isUserSideValidationComplete={isUserSideValidationComplete}
        handleFileChange={handleFileChange}
        isMinor={isMinor}
        setIsMinor={setIsMinor}
        errors={errors}
        setFormData={setFormData}
        otherTitle={otherTitle}
        otherActionButtonText={otherActionButtonText}
        otherAction={otherAction ? onOtherActionWithLoading : undefined}
        otherActionLoading={otherActionLoading}
        isUnsubmitted={isUnsubmitted}
        isUnSubmittedPersonalInfo={isUnSubmittedPersonalInfo}
        isPersonalInformationChecked={isPersonalInformationChecked}
        handlePersonalInformationChange={handlePersonalInformationChange}
        isIdentityVerificationChecked={isIdentityVerificationChecked}
        setIsIdentityVerificationChecked={setIsIdentityVerificationChecked}
      />
    </>
  );
};
