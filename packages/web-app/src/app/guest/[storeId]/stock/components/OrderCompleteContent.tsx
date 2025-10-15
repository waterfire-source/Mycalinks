import { Box, Typography, Button } from '@mui/material';

interface OrderCompletePageProps {
  receptionNumber: number | null;
  onBackToGenreSelect: () => void;
}

export const OrderCompleteContent = ({
  receptionNumber,
  onBackToGenreSelect,
}: OrderCompletePageProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh',
        textAlign: 'center',
      }}
    >
      {/* 注文完了メッセージ */}
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
        <Box
          sx={{
            fontWeight: 'bold',
          }}
          fontSize={32}
        >
          注文完了
        </Box>
      </Typography>
      <Typography variant="h6" sx={{ mb: 4 }}>
        <Box fontSize={32}>
          下記番号でお呼びいたしましたら
          <br />
          レジまでお越しください。
        </Box>
      </Typography>

      {/* 注文番号 */}
      <Typography
        variant="h1"
        sx={{
          fontWeight: 'bold',
          fontSize: '6rem', // 数字を大きく
          mb: 4,
        }}
      >
        <Box
          sx={{
            fontWeight: 'bold',
          }}
          fontSize={128}
        >
          {receptionNumber ?? '---'}
        </Box>
      </Typography>

      {/* 閉じるボタン */}
      <Button variant="contained" color="primary" onClick={onBackToGenreSelect}>
        閉じる
      </Button>
    </Box>
  );
};
