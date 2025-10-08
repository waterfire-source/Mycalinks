'use client';
import { palette } from '@/theme/palette';
import { typography } from '@/theme/typography';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography,
  palette,
  components: {
    MuiRadio: {
      styleOverrides: {
        root: {
          '&.Mui-checked': {
            color: 'rgba(184,42,42,1)', // 選択時の色
          },
          color: palette.text.disabled, // 未選択時の色
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: 'white',
          color: palette.grey['700'],
          '& .MuiTableCell-root': {
            backgroundColor: 'white',
            color: palette.grey['700'],
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            backgroundColor: 'white',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: palette.grey['700'],
          '& .MuiSvgIcon-root': {
            fontSize: '16px',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: palette.grey['700'], // 通常時の色
          '&.Mui-focused': {
            color: palette.primary.main, // フォーカス時の色（必要に応じて変更）
          },
        },
      },
    },
  },
});

export default theme;
