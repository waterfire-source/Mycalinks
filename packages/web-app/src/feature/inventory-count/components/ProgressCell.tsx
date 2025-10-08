import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';

interface ProgressCellProps {
  inputCount: number;
  targetCount: number;
  discrepancy: number;
}

const ProgressCell: React.FC<ProgressCellProps> = ({
  inputCount,
  targetCount,
  discrepancy,
}) => {
  const content = useMemo(
    () => (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <Typography
            variant="body2"
            sx={{ minWidth: '100px', textAlign: 'left' }}
          >
            {`${inputCount}/${targetCount}点`}
          </Typography>
          <Typography variant="body2" sx={{ minWidth: '60px' }}>
            入力済み
          </Typography>
          <Typography
            variant="body2"
            color={
              discrepancy > 0
                ? '#1976d2'
                : discrepancy < 0
                ? 'error'
                : 'text.primary'
            }
            sx={{ minWidth: '80px', textAlign: 'left' }}
          >
            {`差異 ${discrepancy > 0 ? '+' : ''}${discrepancy}点`}
          </Typography>
        </Box>
        <Box
          sx={{
            width: '100%',
            bgcolor: 'grey.300',
            height: 8,
            borderRadius: 4,
            mt: 1,
          }}
        >
          <Box
            sx={{
              width: `${(inputCount / targetCount) * 100}%`,
              bgcolor: 'primary.main',
              height: 8,
              borderRadius: 4,
            }}
          />
        </Box>
      </Box>
    ),
    [inputCount, targetCount, discrepancy],
  );

  return content;
};

export default React.memo(ProgressCell);
