import { BackendCustomerAPI } from '@/app/api/store/[store_id]/customer/api';
import { calculateAge } from '@/feature/customer/utils';
import { PurchaseReceptionFormData } from '@/feature/purchaseReception/components/modals/NewPurchaseModalContainer';
import { useCallback, useState } from 'react';

interface props {
  customer?:
    | BackendCustomerAPI[0]['response']['200']
    | BackendCustomerAPI[1]['response']['200'][0];
  isPersonalInformationChecked: boolean;
  isIdentityVerificationChecked: boolean;
}

export const useValidation = ({
  customer,
  isPersonalInformationChecked,
  isIdentityVerificationChecked,
}: props) => {
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<PurchaseReceptionFormData>({
    id_kind: '',
    id_number: '',
    parental_consent_image_url: '',
    description: '',
    consent: false,
    parental_contact: '',
  });
  const [isUserSideValidationComplete, setIsUserSideValidationComplete] =
    useState(false);
  // 未成年チェックボックスの管理
  const [isMinor, setIsMinor] = useState(false);
  const [age, setAge] = useState<number | null>(null);

  const runValidation = useCallback((): boolean => {
    const newErrors: Record<string, boolean> = {};
    if (!isPersonalInformationChecked) {
      if (!customer?.full_name) newErrors.name = true;
      if (!customer?.full_name_ruby) newErrors.furigana = true;
      if (!customer?.birthday) newErrors.birthDate = true;
      if (!customer?.zip_code) newErrors.postalCode = true;
      if (!customer?.address) newErrors.address = true;
    }
    if (!isIdentityVerificationChecked) {
      if (
        !formData?.id_kind ||
        formData.id_kind.trim() === '' ||
        formData.id_kind === 'Unsubmitted'
      ) {
        newErrors.id_kind = true;
      }
    }

    if (isMinor) {
      if (!formData?.consent) newErrors.consent = true;
      if (!formData?.parental_contact) newErrors.parental_contact = true;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [customer, formData, isMinor, isPersonalInformationChecked]);

  const controlAge = useCallback((): void => {
    if (customer?.birthday) {
      const calculatedAge = calculateAge(customer);
      if (calculatedAge !== null) {
        setAge(calculatedAge);
        setIsMinor(calculatedAge < 18);
      } else {
        setAge(null);
        setIsMinor(false);
      }
    } else {
      setAge(null);
      setIsMinor(false);
    }
  }, [customer]);

  return {
    formData,
    setFormData,
    runValidation,
    errors,
    setErrors,
    controlAge,
    age,
    isUserSideValidationComplete,
    setIsUserSideValidationComplete,
    isMinor,
    setIsMinor,
  };
};
