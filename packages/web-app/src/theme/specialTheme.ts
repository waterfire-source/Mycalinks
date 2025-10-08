'use client';
import { palette } from '@/theme/palette';
import { typography } from '@/theme/typography';
import { createTheme } from '@mui/material/styles';

// 販売画面と買取画面は一目でわかるようにthemeを変更する
export const specialTheme = createTheme({
  typography,
  palette,
  components: {
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: palette.grey[700],
          color: palette.text.secondary,
          '& .MuiTableCell-root': {
            backgroundColor: palette.grey[700],
            color: palette.text.secondary,
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            backgroundColor: palette.grey[100],
          },
        },
      },
    },
  },
});
