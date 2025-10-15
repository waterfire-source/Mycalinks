'use client';

import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { createClientAPI, CustomError } from '@/api/implement';
import { Store } from '@prisma/client';
import Loader from '@/components/common/Loader';
import { useAlert } from '@/contexts/AlertContext';
import { useGlobalNotify } from '@/app/mycalinks/(auth)/assessment/hooks/useGlobalNotify';
import { useTermsAcceptance } from '@/app/mycalinks/(auth)/assessment/hooks/useTermsAcceptance';

interface TermsAgreementStepProps {
  selectedStore: Store;
  onTermsAccepted: () => void;
  onBackToStoreSelect: () => void;
}

type AgreementKey = 'termsAgreement' | 'taxAgreement';

export const TermsAgreementStep = ({
  selectedStore,
  onTermsAccepted,
  onBackToStoreSelect,
}: TermsAgreementStepProps) => {
  const { notifyInfo } = useGlobalNotify(selectedStore.id);
  const { acceptTerms, acceptTermsLoading } = useTermsAcceptance();
  const { setAlertState } = useAlert();
  const clientAPI = useMemo(() => createClientAPI(), []);
  const [buyTerm, setBuyTerm] = useState('');
  const [agreements, setAgreements] = useState({
    termsAgreement: false,
    taxAgreement: false,
  });
  const [loading, setLoading] = useState(true);

  // チェックボックスの状態を管理
  const handleAgreementChange = (field: AgreementKey) => {
    setAgreements((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // 同意して次に進む
  const handleSubmit = async () => {
    const transactionId = notifyInfo?.purchaseReception?.id;
    if (!transactionId || transactionId === 0) {
      setAlertState({
        message: '取引情報が見つかりません',
        severity: 'error',
      });
      return;
    }
    //査定済みにする
    try {
      const result = await acceptTerms(transactionId);
      if (result) {
        onTermsAccepted();
      }
    } catch (error) {
      setAlertState({
        message: '利用規約の同意処理に失敗しました',
        severity: 'error',
      });
    }
  };

  // 規約文を取得
  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const res = await clientAPI.store.getStoreInfo({
          storeID: selectedStore.id,
        });

        if (res instanceof CustomError) {
          setAlertState({
            message: 'ストア情報が取得できません',
            severity: 'error',
          });
          return;
        }

        setBuyTerm(res.buy_term || '規約文がありません');
      } catch (error) {
        console.error('Store info fetch error:', error);
        setAlertState({
          message: '店舗情報の取得に失敗しました',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, [selectedStore.id, setAlertState]);

  if (loading) {
    return <Loader />;
  }

  return (
    <Box
      sx={{
        flex: 1,
        bgcolor: 'rgba(248,248,248,1)',
        position: 'relative',
        pb: 1,
      }}
    >
      <Box
        sx={{
          bgcolor: 'primary.main',
          width: '90%',
          px: 2,
          py: 1,
          mt: 2,
          mx: 'auto',
        }}
      >
        <Typography
          sx={{
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '14px!important',
            color: 'white',
          }}
        >
          買取における注意事項
        </Typography>
        <Typography
          sx={{
            textAlign: 'center',
            fontSize: '12px!important',
            color: 'white',
            opacity: 0.9,
            mt: 0.5,
          }}
        >
          {selectedStore.display_name || ''}
        </Typography>
      </Box>

      <Paper
        sx={{
          width: '90%',
          height: '60vh',
          mx: 'auto',
          mt: 2,
          bgcolor: '#f5f5f5',
          borderRadius: 1,
          p: 2,
          border: '1px solid rgb(132, 132, 132)',
          overflowY: 'auto',
        }}
      >
        <Typography sx={{ whiteSpace: 'pre-line', fontSize: '14px!important' }}>
          {buyTerm || '利用規約を読み込み中...'}
        </Typography>
      </Paper>

      <FormControlLabel
        control={
          <Checkbox
            checked={agreements.termsAgreement}
            onChange={() => handleAgreementChange('termsAgreement')}
            sx={{ color: 'primary.main' }}
          />
        }
        label={
          <Typography
            sx={{
              fontWeight: 'bold',
              flexWrap: 'wrap',
              fontSize: '14px!important',
            }}
          >
            上記規約をすべて読んで同意します
          </Typography>
        }
        sx={{
          width: '80%',
          mx: 'auto',
          mt: 2,
          display: 'flex',
          alignItems: 'center',
        }}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={agreements.taxAgreement}
            onChange={() => handleAgreementChange('taxAgreement')}
            sx={{ color: 'primary.main' }}
          />
        }
        label={
          <Typography
            sx={{
              fontWeight: 'bold',
              flexWrap: 'wrap',
              fontSize: '14px!important',
            }}
          >
            私(売り主)は消費税における適格請求業者ではありません。
          </Typography>
        }
        sx={{
          width: '80%',
          mx: 'auto',
          mt: 1,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
        }}
      />

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
        <Button
          variant="outlined"
          onClick={onBackToStoreSelect}
          sx={{
            borderRadius: '10px',
            px: '30px',
            py: '10px',
          }}
        >
          戻る
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            !agreements.taxAgreement ||
            !agreements.termsAgreement ||
            acceptTermsLoading
          }
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: '10px',
            px: '50px',
            py: '10px',
            opacity:
              !agreements.taxAgreement || !agreements.termsAgreement ? 0.5 : 1,
            '&:disabled': {
              bgcolor: 'primary.secondary',
            },
          }}
        >
          査定状況確認
        </Button>
      </Box>
    </Box>
  );
};
