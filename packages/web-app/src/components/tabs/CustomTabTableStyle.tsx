// components/CustomTab.tsx
// TDOO: use components/tabs/CustomTabTable.tsx
import { Tab } from '@mui/material';
import { styled } from '@mui/material/styles';

export const CustomTabTableStyle = styled(Tab)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  color: theme.palette.text.primary,
  borderTopLeftRadius: '5px',
  borderTopRightRadius: '5px',
  fontSize: theme.typography.body1.fontSize,
  [`@media (max-width:1400px)`]: {
    fontSize: '12px',
  },
  textAlign: 'center',
  border: '1px solid gray',
  borderBottom: 'none',
  margin: 0,
  padding: '8px 10px',
  minWidth: '120px',
  minHeight: '31px',
  position: 'relative',
  gap: '1px',
  textTransform: 'none',
  '& .badge': {
    position: 'absolute',
    top: '5px',
    right: '5px',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.text.secondary,
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    marginRight: '8px',
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.text.secondary,
    '& .badge': {
      backgroundColor: theme.palette.common.white,
      color: theme.palette.text.primary,
      border: '1px solid gray',
      marginRight: '8px',
    },
  },
}));

export const SecondaryCustomTabTableStyle = styled(Tab)(({ theme }) => ({
  fontSize: '12px', // 小さいフォントサイズで高さを抑える
  textAlign: 'center',
  padding: '4px 8px', // 高さを最小限にするためのパディング
  minHeight: '28px', // 最小の高さを設定
  minWidth: '100px', // 幅を調整
  color: theme.palette.grey[500], // デフォルトの文字色
  '&.Mui-selected': {
    color: theme.palette.primary.main, // 選択時の文字色
  },
}));
