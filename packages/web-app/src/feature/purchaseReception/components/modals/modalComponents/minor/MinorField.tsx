import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { AgreementFileUploader } from '@/feature/purchaseReception/components/modals/modalComponents/minor/component/AgreementFileUploader';
import { ConsentCheckbox } from '@/feature/purchaseReception/components/modals/modalComponents/minor/component/ConsentCheckbox';
import { useState, useEffect, SetStateAction } from 'react';
import { PurchaseReceptionFormData } from '@/feature/purchaseReception/components/modals/NewPurchaseModalContainer';

interface MinorFieldProps {
  isMinor: boolean;
  setIsMinor: (value: boolean) => void;
  formData: {
    consent: boolean;
    parental_consent_image_url: string;
    parental_contact: string;
  };
  setFormData: React.Dispatch<SetStateAction<PurchaseReceptionFormData>>;
  handleConsentChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => void;
  handleFileChange: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => Promise<void>;
  errors?: Record<string, boolean>;
  isIpadSize: boolean;
}

export const MinorField = ({
  isMinor,
  setIsMinor,
  formData,
  setFormData,
  handleConsentChange,
  handleFileChange,
  errors,
  isIpadSize,
}: MinorFieldProps) => {
  // 保護者連絡先の管理
  const [guardianContact, setGuardianContact] = useState(
    formData.parental_contact,
  );

  // guardianContactの変更をformDataに反映
  useEffect(() => {
    if (isMinor) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        parental_contact: guardianContact,
      }));
    }
  }, [guardianContact, isMinor, setFormData]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* 未成年チェックボックス */}
      <FormControlLabel
        control={
          <Checkbox
            checked={isMinor}
            onChange={(e) => setIsMinor(e.target.checked)}
            sx={{
              color: 'grey.400',
              '&.Mui-checked': { color: '#b82a2a' },
              '&:not(.Mui-checked)': { color: 'rgba(0, 0, 0, 0.38)' },
            }}
            disabled
          />
        }
        label={
          <span style={{ color: isMinor ? 'black' : 'grey.400' }}>未成年</span>
        }
      />

      {/* 保護者連絡先 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography
          variant="body2"
          sx={{
            color: !isMinor ? 'grey.500' : 'text.primary',
          }}
        >
          保護者連絡先
        </Typography>
        <TextField
          value={guardianContact}
          onChange={(e) => setGuardianContact(e.target.value)}
          placeholder="090-XXXX-XXXX"
          disabled={!isMinor} // 成年チェック時は入力不可
          error={errors?.parental_contact}
          sx={{
            height: '35px',
            flex: 1,
            '& .MuiInputBase-root': {
              height: 40,
              backgroundColor: 'white',
            },
          }}
          helperText={
            errors?.parental_contact ? '保護者連絡先が必要です。' : ''
          }
          FormHelperTextProps={{ sx: { color: 'primary.main' } }}
        />
      </Box>

      {/* 保護者連絡済みチェックボックス */}
      <ConsentCheckbox
        checked={formData?.consent || false}
        onChange={handleConsentChange}
        errors={errors}
        disabled={!isMinor}
      />

      {/* 買取承諾書 */}
      <AgreementFileUploader
        errors={errors}
        handleFileChange={handleFileChange}
        parental_consent_image_url={formData?.parental_consent_image_url}
        disabled={!isMinor}
        isIpadSize={isIpadSize}
      />
    </Box>
  );
};
