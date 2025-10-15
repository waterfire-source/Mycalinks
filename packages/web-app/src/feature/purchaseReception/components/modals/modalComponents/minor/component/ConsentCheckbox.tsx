import { Box, FormHelperText } from '@mui/material';
import { CommonCheckbox } from '@/feature/purchaseReception/components/modals/modalComponents/common/CommonCheckbox';

interface props {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  errors?: Record<string, boolean> | null;
  disabled?: boolean;
}

// 保護者連絡済みチェックボックス
export const ConsentCheckbox = ({
  checked,
  onChange,
  errors,
  disabled = false,
}: props) => (
  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
    <CommonCheckbox
      checked={checked}
      onChange={onChange}
      label="保護者連絡済み"
      disabled={disabled} // disabledをCommonCheckboxに渡す
    />
    {errors?.consent && (
      <FormHelperText sx={{ color: 'primary.main' }}>
        保護者連絡の確認が必要です。
      </FormHelperText>
    )}
  </Box>
);
