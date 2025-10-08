'use client';

import { useEffect, useState } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { MycaPosApiClient } from 'api-generator/client';
import { CustomError } from '@/api/implement';
import { useRouter } from 'next/navigation';

interface ShopifyFormData {
  shopifyUrl: string;
}

interface ShopifyIntegrationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ShopifyIntegrationModal = ({
  open,
  onClose,
  onSuccess,
}: ShopifyIntegrationModalProps) => {
  const { setAlertState } = useAlert();
  const { store } = useStore();
  const { push } = useRouter();

  const [isUpdating, setIsUpdating] = useState(false);
  const [formState, setFormState] = useState<ShopifyFormData>({
    shopifyUrl: '',
  });

  const mycaPosApiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });

  // モーダルが閉じられる際にフォームをリセット
  useEffect(() => {
    if (!open) {
      setFormState({
        shopifyUrl: '',
      });
    }
  }, [open]);

  const handleInputChange = (field: keyof ShopifyFormData, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // バリデーション
    if (!formState.shopifyUrl.trim()) {
      setAlertState({
        severity: 'error',
        message: 'Shopify URLを入力してください。',
      });
      return;
    }

    // myshopifyじゃなくても大丈夫な場合があるためコメントアウト
    // // URLフォーマットの簡易チェック
    // if (!formState.shopifyUrl.includes('.myshopify.com')) {
    //   setAlertState({
    //     severity: 'error',
    //     message:
    //       'Shopify URLは「〇〇.myshopify.com」の形式で入力してください。',
    //   });
    //   return;
    // }

    setIsUpdating(true);
    try {
      const res = await mycaPosApiClient.shopify.getShopifyOAuthUrl({
        storeId: store.id,
        shopDomain: formState.shopifyUrl,
        succeedCallbackUrl: `${process.env.NEXT_PUBLIC_ORIGIN}/api/shopify/oauth/callback/route.ts`,
      });

      if (res instanceof CustomError) throw res;

      setAlertState({
        severity: 'success',
        message: 'Shopifyログインページへ遷移します',
      });

      onSuccess();

      push(res.url);
    } catch (error) {
      setAlertState({
        severity: 'error',
        message: 'Shopify連携に失敗しました。入力内容を確認してください。',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <CustomModalWithIcon
      open={open}
      onClose={onClose}
      title="Shopify連携設定"
      onActionButtonClick={handleSubmit}
      actionButtonText="連携"
      loading={isUpdating}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'start',
          width: '100%',
        }}
      >
        <Typography sx={{ fontSize: '14px' }}>Shopify URL</Typography>
        <TextField
          fullWidth
          placeholder="example.myshopify.com"
          value={formState.shopifyUrl}
          onChange={(e) => handleInputChange('shopifyUrl', e.target.value)}
          size="small"
          sx={{ backgroundColor: '#fff' }}
        />
      </Box>
    </CustomModalWithIcon>
  );
};
