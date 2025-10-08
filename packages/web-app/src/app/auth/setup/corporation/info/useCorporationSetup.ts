import { useUpdateCorporation } from '@/feature/corporation/hooks/useUpdateCorporation';
import { useCallback, useEffect, useState } from 'react';
import { useAddressSearch } from '@/feature/stocking/hooks/useAddressSearch';
import { useAlert } from '@/contexts/AlertContext';

export type CorporationSetupFormData = {
  name: string;
  ceoName: string;
  zipCode: string;
  address: string;
  phoneNumber: string;
  kobutsushoKoanIinkai: string;
  kobutsushoNumber: string;
  invoiceNumber: string;
};

export const useCorporationSetup = () => {
  const { updateCorporation } = useUpdateCorporation();
  const { setAlertState } = useAlert();
  const [formData, setFormData] = useState<CorporationSetupFormData>({
    name: '',
    ceoName: '',
    zipCode: '',
    address: '',
    phoneNumber: '',
    kobutsushoKoanIinkai: '',
    kobutsushoNumber: '',
    invoiceNumber: '',
  });

  const handleChange = (
    field: keyof CorporationSetupFormData,
    value: string,
  ) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const { address: addressSearchState, handleAddressSearch } = useAddressSearch(
    formData.zipCode,
  );

  // 郵便番号の住所検索
  const handleClickAddressSearch = useCallback(async () => {
    if (formData.zipCode === '') {
      setAlertState({
        message: '郵便番号を入力してください',
        severity: 'error',
      });
      return;
    }
    await handleAddressSearch();
  }, [formData.zipCode, handleAddressSearch, setAlertState]);
  // 住所検索したら住所を更新する
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      address: `${addressSearchState.prefecture}${addressSearchState.city}${addressSearchState.address2}`,
    }));
  }, [addressSearchState]);

  // 全ての項目が入力されているかをチェックする
  const isValidate = () => {
    return Object.values(formData).every((value) => value !== '');
  };

  const handleUpdateCorporation = async (corporationId: number) => {
    // 全ての項目が入力されているかをチェックする
    if (!isValidate()) {
      setAlertState({
        message: '全ての項目を入力してください',
        severity: 'error',
      });
      throw new Error('全ての項目を入力してください');
    }
    await updateCorporation({
      corporationId,
      name: formData.name,
      ceoName: formData.ceoName,
      headOfficeAddress: formData.address,
      zipCode: formData.zipCode,
      phoneNumber: formData.phoneNumber,
      kobutsushoKoanIinkai: formData.kobutsushoKoanIinkai,
      kobutsushoNumber: formData.kobutsushoNumber,
      invoiceNumber: formData.invoiceNumber,
    });
  };

  return {
    formData,
    setFormData,
    handleChange,
    handleClickAddressSearch,
    handleUpdateCorporation,
  };
};
