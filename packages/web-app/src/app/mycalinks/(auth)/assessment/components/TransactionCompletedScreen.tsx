import { Box, Typography } from '@mui/material';

/**
 * 取引査定終了後に飛んでしまった場合の買取が完了しています画面
 */
export const TransactionCompletedScreen = () => {
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#f8f8f8',
        position: 'relative',
      }}
    >
      {/* ヘッダー */}
      <Box
        sx={{
          width: '100%',
          backgroundColor: 'primary.main',
          py: 1,
        }}
      >
        <Typography
          fontSize={14}
          sx={{
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '14px!important',
            color: 'white',
          }}
        >
          買取待ち状況
        </Typography>
      </Box>

      {/* メインコンテンツ */}
      <Box
        sx={{
          width: '100%',
          height: '75vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '40px!important',
          }}
        >
          買取が完了しています
        </Typography>
      </Box>
    </Box>
  );
};
