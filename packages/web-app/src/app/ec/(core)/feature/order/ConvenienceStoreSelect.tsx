'use client';
import { useState } from 'react';
import {
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
} from '@mui/material';
import {
  ConvenienceCode,
  CONVENIENCE_MAP,
} from '@/app/ec/(core)/constants/convenience';

interface ConvenienceStoreSelectProps {
  onConfirm: (convenienceCode: ConvenienceCode) => void;
  onBack: () => void;
}

export const ConvenienceStoreSelect = ({
  onConfirm,
  onBack,
}: ConvenienceStoreSelectProps) => {
  const [selectedConvenience, setSelectedConvenience] =
    useState<ConvenienceCode | null>(null);

  const handleConvenienceChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSelectedConvenience(event.target.value as ConvenienceCode);
  };

  const handleConfirm = () => {
    if (selectedConvenience) {
      onConfirm(selectedConvenience);
    }
  };

  return (
    <Box sx={{ p: 0 }}>
      <RadioGroup
        value={selectedConvenience || ''}
        onChange={handleConvenienceChange}
        sx={{ width: '100%' }}
      >
        {Object.entries(CONVENIENCE_MAP).map(([code, name], index, array) => (
          <FormControlLabel
            key={code}
            value={code}
            control={<Radio />}
            label={name}
            sx={{
              width: '100%',
              margin: 0,
              padding: '12px',
              borderBottom:
                index !== array.length - 1 ? '1px solid #eee' : undefined,
              paddingBottom: index === array.length - 1 ? '0px' : '12px',
            }}
          />
        ))}
      </RadioGroup>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: 3,
        }}
      >
        <Button variant="outlined" onClick={onBack} size="small">
          戻る
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirm}
          disabled={!selectedConvenience}
          size="small"
        >
          このコンビニで支払う
        </Button>
      </Box>
    </Box>
  );
};
