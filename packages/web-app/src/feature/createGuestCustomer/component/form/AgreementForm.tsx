'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Paper,
} from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { usePurchaseTerm } from '@/feature/purchaseReception/hooks/usePurchaseTerm';
import { useParams } from 'next/navigation';

interface AgreementFormProps {
  onNext: () => void;
  onBack: () => void;
}

export const AgreementForm: React.FC<AgreementFormProps> = ({
  onNext,
  onBack,
}) => {
  const [agreeAllChecked, setAgreeAllChecked] = useState(false);
  const [taxChecked, setTaxChecked] = useState(false);

  const handleAgreeAllChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAgreeAllChecked(event.target.checked);
  };

  const handleTaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTaxChecked(event.target.checked);
  };
  const canProceed = agreeAllChecked && taxChecked;
  const { storeId } = useParams();
  const { term, fetchTerms } = usePurchaseTerm(Number(storeId));
  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        gap: 2,
      }}
    >
      <Typography sx={{ fontSize: '16px' }}>買取における注意事項</Typography>

      <Paper
        elevation={3}
        sx={{
          padding: 2,
          width: '100%',
          height: '50vh',
          overflow: 'auto',
        }}
      >
        <Typography
          sx={{ fontSize: '14px', height: '100%', whiteSpace: 'pre-wrap' }}
          paragraph
        >
          {term}
        </Typography>
      </Paper>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          width: '100%',
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              sx={{ color: 'grey.500' }}
              checked={agreeAllChecked}
              onChange={handleAgreeAllChange}
            />
          }
          label="上記注意事項すべてに同意します。"
          sx={{
            '& .MuiTypography-root': { fontSize: 14 },
          }}
        />
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              sx={{ color: 'grey.500' }}
              checked={taxChecked}
              onChange={handleTaxChange}
            />
          }
          label="私（売主）は消費税における適格請求事業者ではありません。"
          sx={{
            '& .MuiTypography-root': { fontSize: 14 },
          }}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <SecondaryButton
          onClick={onBack}
          sx={{
            paddingX: 4,
          }}
        >
          戻る
        </SecondaryButton>

        <PrimaryButton
          onClick={onNext}
          disabled={!canProceed}
          sx={{
            paddingX: 4,
          }}
        >
          必要情報入力
        </PrimaryButton>
      </Box>
    </Box>
  );
};
