import { styled, TextField } from '@mui/material';

// 数値入力フィールドのスピンボタン（矢印）を非表示にしたカスタムTextField
export const NoSpinTextField = styled(TextField)({
  '& input[type=number]': {
    MozAppearance: 'textfield',
  },
  '& input[type=number]::-webkit-inner-spin-button': {
    WebkitAppearance: 'none',
    margin: 0,
  },
  '& input[type=number]::-webkit-outer-spin-button': {
    WebkitAppearance: 'none',
    margin: 0,
  },
});
