import React from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormHelperText,
} from '@mui/material';

interface RequiredFieldProps {
  label: string;
  value: string;
  error?: boolean;
  helperText?: string;
  additions?: React.ReactNode;
}

export const RequiredField: React.FC<RequiredFieldProps> = ({
  label,
  value,
  error = false,
  helperText = '',
  additions = undefined,
}) => {
  return (
    <Grid container spacing={1} sx={{ mb: '2px', alignItems: 'center' }}>
      {/* ラベル部分 */}
      <Grid item xs={2}>
        <Typography
          variant="body2"
          sx={{ whiteSpace: 'nowrap', fontSize: '14px' }}
        >
          {label}
        </Typography>
      </Grid>

      {/* 必須マーク部分 */}
      <Grid item xs={1} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Box
          sx={{
            backgroundColor: 'grey.200',
            padding: '2px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '30px',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 'bold',
              textAlign: 'center',
              fontSize: '10px',
            }}
          >
            必須
          </Typography>
        </Box>
      </Grid>

      {/* 値部分 */}
      <Grid item xs={9} sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '80%' }}>
          <TextField
            value={value}
            InputProps={{ readOnly: true }}
            error={error}
            fullWidth
            size="small"
            variant="outlined"
            sx={{
              color: 'grey.100',
            }}
          />
          {error && (
            <Box sx={{ width: '100%', mt: '4px' }}>
              <FormHelperText error>{helperText}</FormHelperText>
            </Box>
          )}
        </Box>
        {additions}
      </Grid>
    </Grid>
  );
};
