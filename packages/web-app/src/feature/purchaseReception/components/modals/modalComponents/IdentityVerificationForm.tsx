import React, { SetStateAction, useEffect } from 'react';
import {
  FormControl,
  FormLabel,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Box,
  Typography,
  Grid,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { PurchaseReceptionFormData } from '@/feature/purchaseReception/components/modals/NewPurchaseModalContainer';
import { IdKind } from '@/feature/purchaseReception/components/modals/DetailModal';

// CustomToggleButtonのスタイル定義
const CustomToggleButton = styled(ToggleButton)(({ theme, selected }) => ({
  transition: '',
  width: '9.0rem',
  height: '35px',
  textTransform: 'capitalize',
  color: selected ? 'white' : theme.palette.text.primary,
  border: '1px solid',
  borderColor: selected ? theme.palette.grey[500] : theme.palette.grey[400],
  margin: '5px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: selected ? theme.palette.grey[500] : 'white',
  '&:hover': {
    backgroundColor: selected ? theme.palette.grey[600] : 'white',
  },
  '&.MuiToggleButtonGroup-grouped': {
    borderRadius: '5px !important',
    border: '1px solid !important',
    borderColor: selected
      ? theme.palette.grey[900]
      : theme.palette.grey[400] + ' !important',
  },
  '&.Mui-selected, &.Mui-selected:hover': {
    color: 'white',
    backgroundColor: theme.palette.grey[500],
    borderColor: theme.palette.grey[500],
  },
}));

// Props定義
export interface IdentityVerificationFormProps {
  selected: string | null;
  onSelectionChange: (
    event: React.MouseEvent<HTMLElement>,
    newSelected: string | null,
  ) => void;
  isIdentityVerificationChecked: boolean;
  setIsIdentityVerificationChecked: React.Dispatch<SetStateAction<boolean>>;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  formData: PurchaseReceptionFormData;
  setFormData: React.Dispatch<SetStateAction<PurchaseReceptionFormData>>;
  isUnsubmitted?: boolean;
}

export const IdentityVerificationForm: React.FC<
  IdentityVerificationFormProps
> = ({
  selected,
  onSelectionChange,
  isIdentityVerificationChecked,
  setIsIdentityVerificationChecked,
  handleInputChange,
  formData,
  setFormData,
  isUnsubmitted,
}) => {
  const [otherChecked, setOtherChecked] = React.useState(false);
  const [otherText, setOtherText] = React.useState('');

  // その他のチェックボックスをクリックしたときの動作
  const handleOtherCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    setOtherChecked(checked);
    const newSelection = checked ? 'others' : ''; // チェックがついたら'others'、外れたら空に
    setOtherText(''); // チェック外れた場合テキストフィールドもリセット
    onSelectionChange(
      e as unknown as React.MouseEvent<HTMLElement>,
      newSelection,
    ); // eventを型変換して渡す
  };

  // テキストフィールドの変更ハンドラー
  const handleOtherTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setOtherText(newValue);
    if (otherChecked) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        id_kind: `other:${newValue}`,
      }));
    }
  };

  // チェックボックスの変更ハンドラー
  const handleIdentityVerificationChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    setIsIdentityVerificationChecked(checked);
    if (checked) {
      const mockEvent = {
        currentTarget: e.currentTarget,
        preventDefault: () => {},
      } as unknown as React.MouseEvent<HTMLElement>;
      onSelectionChange(mockEvent, 'Unsubmitted');
      setFormData((prevFormData) => ({
        ...prevFormData,
        id_kind: 'Unsubmitted',
        id_number: '',
      }));
      setOtherChecked(false);
      setOtherText('');
    } else {
      const mockEvent = {
        currentTarget: e.currentTarget,
        preventDefault: () => {},
      } as unknown as React.MouseEvent<HTMLElement>;
      onSelectionChange(mockEvent, null);
      setFormData((prevFormData) => ({
        ...prevFormData,
        id_kind: '',
      }));
    }
  };

  // ToggleButtonGroupの変更ハンドラー
  const handleToggleButtonGroupChange = (
    event: React.MouseEvent<HTMLElement>,
    newSelection: string | null,
  ) => {
    if (!newSelection) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        id_kind: '',
      }));
    }
    onSelectionChange(event, newSelection);
  };

  useEffect(() => {
    if (formData.id_kind) {
      if (formData.id_kind?.startsWith('other:')) {
        setOtherChecked(true);
        setOtherText(formData.id_kind.split(':')[1] || '');
      }
    }
  }, [formData.id_kind]);

  // モーダルが閉じられたときにチェックを外す
  useEffect(() => {
    if (formData?.id_kind === '') {
      setIsIdentityVerificationChecked(false);
    }
  }, [formData?.id_kind, setIsIdentityVerificationChecked]);

  return (
    <FormControl component="fieldset" sx={{ width: '100%' }}>
      {!isUnsubmitted &&
        (formData?.id_kind === '' || formData?.id_kind === 'Unsubmitted') && (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <FormControlLabel
              control={
                <Checkbox
                  name="consent"
                  checked={isIdentityVerificationChecked}
                  onChange={handleIdentityVerificationChange}
                  sx={{
                    color: 'grey.400',
                  }}
                />
              }
              label="査定完了後に身分証明書類の提出を求める"
            />
          </Box>
        )}
      <FormLabel
        sx={{
          color: isIdentityVerificationChecked ? 'grey.500' : 'text.primary',
          marginBottom: '10px',
          marginTop: '15px',
        }}
      >
        身分証明書類
      </FormLabel>
      <ToggleButtonGroup
        value={selected || ''} // nullの場合は空文字を渡す
        exclusive
        onChange={(event, newSelection) =>
          handleToggleButtonGroupChange(event, newSelection)
        }
        aria-label="certificate type"
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
          alignItems: 'center', // ボタンの縦位置を中央揃え
        }}
        disabled={isIdentityVerificationChecked}
      >
        {[
          { value: 'license', label: '運転免許証' },
          { value: 'healthInsurance', label: '健康保険証' },
          { value: 'myNumber', label: 'マイナンバー' },
          { value: 'studentId', label: '写真付き学生証' },
          { value: 'alienRegistration', label: '外国人登録証明書' },
          { value: 'residentCard', label: '在留カード' },
          { value: 'disabilityPass', label: '障害者手帳' },
          { value: 'passport', label: 'パスポート' },
        ].map((button, index) => (
          <CustomToggleButton
            key={button.value}
            value={button.value}
            selected={selected === button.value}
            sx={{
              marginLeft: index === 0 ? '0px' : '5px', // 最初のボタンだけ左マージンを削除
            }}
          >
            {button.label}
          </CustomToggleButton>
        ))}
      </ToggleButtonGroup>

      {/* その他のチェックボックスと証明書名入力フィールドを横並びに配置 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          marginTop: '15px',
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={otherChecked}
              onChange={handleOtherCheckboxChange}
              value="others"
              sx={{
                color: 'grey.400',
              }}
              disabled={isIdentityVerificationChecked}
            />
          }
          label="その他の証明書"
        />
        <TextField
          placeholder="入力"
          value={otherText}
          onChange={handleOtherTextChange}
          sx={{
            flex: 1,
            height: '35px',
            width: '100%',
            '& .MuiInputBase-root': {
              height: '100%',
              backgroundColor: 'white',
            },
          }}
          disabled={!otherChecked || isIdentityVerificationChecked}
        />
      </Box>

      {/* 証明書類番号入力欄 */}
      <Box sx={{ marginTop: '20px' }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={2} sx={{ display: 'flex' }}>
            <Typography
              variant="body2"
              sx={{
                color: isIdentityVerificationChecked
                  ? 'grey.500'
                  : 'text.primary',
              }}
            >
              証明書類番号
            </Typography>
          </Grid>
          <Grid
            item
            xs={9}
            sx={{ display: 'flex', alignItems: 'center', padding: 0 }}
          >
            <Box sx={{ width: '100%' }}>
              <TextField
                value={formData?.id_number || ''}
                name="id_number"
                variant="outlined"
                placeholder="入力"
                onChange={handleInputChange}
                fullWidth
                size="small"
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: 'white',
                    borderColor:
                      !formData?.id_number || formData.id_number.trim() === ''
                        ? 'red'
                        : 'inherit',
                  },
                }}
                disabled={
                  isIdentityVerificationChecked ||
                  selected === IdKind.myNumber ||
                  selected === IdKind.healthInsurance
                }
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </FormControl>
  );
};
