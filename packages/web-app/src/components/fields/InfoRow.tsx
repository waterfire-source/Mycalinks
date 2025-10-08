import { Box, Typography, Grid } from '@mui/material';
import SecondaryButton from '@/components/buttons/SecondaryButton';

// 店舗設定・法人情報設定画面で使用している
// 編集ボタンを押したらonEditが呼ばれる
interface Props {
  label: string; // ラベルのテキスト
  value: React.ReactNode; // 表示する値
  onEdit?: () => void; // 編集ボタンのクリック時に呼ばれる関数
  buttonLabel?: string; // 編集ボタンのテキスト
}

// InfoRowコンポーネントを定義
export const InfoRow = ({
  label,
  value,
  onEdit,
  buttonLabel = '編集',
}: Props) => (
  <Grid container sx={{ borderBottom: '1px solid #e0e0e0' }}>
    <Grid item xs={3}>
      <Box
        sx={{
          bgcolor: '#808080',
          color: 'white',
          p: 2,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        <Typography>{label}</Typography>
      </Box>
    </Grid>
    <Grid item xs={7}>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          textAlign: 'left',
        }}
      >
        {typeof value === 'string' ? <Typography>{value}</Typography> : value}
      </Box>
    </Grid>
    <Grid item xs={2}>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
          height: '100%',
        }}
      >
        {onEdit && (
          <SecondaryButton variant="contained" onClick={onEdit}>
            {buttonLabel}
          </SecondaryButton>
        )}
      </Box>
    </Grid>
  </Grid>
);
