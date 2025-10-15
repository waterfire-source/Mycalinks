'use client';

import { Box, Typography, TextField } from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { StaffCode } from '@/utils/staffCode';

interface LockScreenProps {
  handleUnlock: () => void;
}

export const LockScreen = ({ handleUnlock }: LockScreenProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f7f7f7',
      }}
    >
      <Box
        sx={{
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          maxWidth: '600px',
          width: '100%',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            padding: '8px',
            borderRadius: '4px 4px 0 0',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          ロック中
        </Typography>
        <Box
          sx={{
            padding: '16px',
          }}
        >
          <Box sx={{ margin: '16px 0' }}>
            <TextField
              fullWidth
              variant="outlined"
              onChange={(e) => {
                // 従業員番号を入力した時はその番号をセット
                StaffCode.setStaffCode(Number(e.target.value), null);
              }}
              placeholder="従業員番号を入力または従業員バーコードをスキャン"
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <PrimaryButton
              fullWidth
              onClick={handleUnlock}
              sx={{ width: '50%' }}
            >
              ログイン
            </PrimaryButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
