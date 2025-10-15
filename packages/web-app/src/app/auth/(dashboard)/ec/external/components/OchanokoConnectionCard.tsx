'use client';

import { useCallback, useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { useStoreInfoNormal } from '@/feature/store/hooks/useStoreInfoNormal';
import { ExternalPlatformCard } from '@/app/auth/(dashboard)/ec/external/components/ExternalPlatformCard';
import { createClientAPI, CustomError } from '@/api/implement';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import PrimaryButton from '@/components/buttons/PrimaryButton';

interface OchanokoIntegrationData {
  ochanokoEmail: string | null;
  ochanokoAccountId: string | null;
  ochanokoApiToken: string | null;
}

interface OchanokoConnectionCardProps {
  onConnect: () => void;
}

export function OchanokoConnectionCard({
  onConnect,
}: OchanokoConnectionCardProps) {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const { fetchStoreInfoNormal } = useStoreInfoNormal();
  const [isLoading, setIsLoading] = useState(true);
  const [ochanokoData, setOchanokoData] =
    useState<OchanokoIntegrationData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // おちゃのこネット連携情報の取得
  const fetchOchanokoSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchStoreInfoNormal(store.id, false, true);
      if (res?.[0]?.ec_setting) {
        setOchanokoData({
          ochanokoEmail: res[0].ec_setting.ochanoko_email ?? null,
          ochanokoAccountId: res[0].ec_setting.ochanoko_account_id ?? null,
          ochanokoApiToken: res[0].ec_setting.ochanoko_api_token ?? null,
        });
      } else {
        setOchanokoData(null);
      }
    } catch (e) {
      setOchanokoData(null);
      setAlertState({
        severity: 'error',
        message: 'おちゃのこネット連携情報の取得に失敗しました。',
      });
    } finally {
      setIsLoading(false);
    }
  }, [store.id, fetchStoreInfoNormal, setAlertState]);

  useEffect(() => {
    fetchOchanokoSettings();
  }, [fetchOchanokoSettings]);

  const [uploading, setUploading] = useState(false);

  const uploadOchanokoCsv = useCallback(async () => {
    setUploading(true);
    if (!selectedFile) {
      setAlertState({
        message: 'ファイルを選択してください',
        severity: 'error',
      });
      return;
    }

    const apiClient = createClientAPI();
    const res = await apiClient.product.uploadOchanokoCsv({
      storeID: store.id,
      body: {
        file: selectedFile,
      },
    });

    if (res instanceof CustomError) {
      setAlertState({
        message: res.message,
        severity: 'error',
      });
      setUploading(false);
      return;
    }

    setAlertState({
      message: res.ok,
      severity: 'success',
    });

    setUploading(false);
  }, [store, selectedFile]);

  const isConnected =
    ochanokoData &&
    ochanokoData.ochanokoEmail &&
    ochanokoData.ochanokoAccountId &&
    ochanokoData.ochanokoApiToken;

  return (
    <ExternalPlatformCard
      title="おちゃのこネット"
      isLoading={isLoading}
      // isConnected={!!isConnected}
      isConnected={true}
      onConnect={onConnect}
    >
      {/* アカウントID */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="body1" sx={{ minWidth: 170 }}>
          アカウントID
        </Typography>
        <Typography variant="body1">
          {ochanokoData?.ochanokoAccountId}
        </Typography>
      </Box>

      {/* メールアドレス */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="body1" sx={{ minWidth: 170 }}>
          メールアドレス
        </Typography>
        <Typography variant="body1">{ochanokoData?.ochanokoEmail}</Typography>
      </Box>

      {/* APIキー */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="body1" sx={{ minWidth: 170 }}>
          APIキー
        </Typography>
        <Typography variant="body1">
          {ochanokoData?.ochanokoApiToken &&
            `********${ochanokoData.ochanokoApiToken.slice(-4)}`}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
          おちゃのこ在庫連携
        </Typography>

        <Box
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 2,
            padding: 1.5,
            textAlign: 'center',
            backgroundColor: '#fafafa',
            maxWidth: 400,
            minHeight: 96,
          }}
        >
          <Typography
            variant="caption"
            sx={{ mb: 1, fontSize: '0.75rem', display: 'block' }}
          >
            おちゃのこネットから出力したCSVファイルを選択してください
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SecondaryButton
              variant="contained"
              component="label"
              sx={{
                padding: '6px 12px',
                fontSize: '0.75rem',
                minWidth: 'auto',
              }}
            >
              ファイルを選択
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                  }
                }}
              />
            </SecondaryButton>

            {selectedFile && (
              <PrimaryButton
                sx={{
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  minWidth: 'auto',
                }}
                onClick={uploadOchanokoCsv}
                loading={uploading}
              >
                アップロード
              </PrimaryButton>
            )}
          </Box>

          {selectedFile && (
            <Box
              sx={{
                mt: 1,
                p: 1,
                backgroundColor: '#e8f5e8',
                borderRadius: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'success.dark',
                  display: 'block',
                  fontSize: '0.7rem',
                }}
              >
                ✓ {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)}{' '}
                KB)
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </ExternalPlatformCard>
  );
}
