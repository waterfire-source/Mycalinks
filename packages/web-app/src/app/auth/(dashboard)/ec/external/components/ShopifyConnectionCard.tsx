'use client';

import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { ExternalPlatformCard } from '@/app/auth/(dashboard)/ec/external/components/ExternalPlatformCard';
import { useStoreInfoNormal } from '@/feature/store/hooks/useStoreInfoNormal';
import { useStore } from '@/contexts/StoreContext';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { MycaPosApiClient } from 'api-generator/client';
import { useAlert } from '@/contexts/AlertContext';

interface ShopifyIntegrationData {
  shopifyShopDomain: string | null;
}

interface ShopifyConnectionCardProps {
  onConnect: () => void;
}

export function ShopifyConnectionCard({
  onConnect,
}: ShopifyConnectionCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  // TODO: 実際のデータフェッチロジックを実装
  // TODO: 中身はいったんこれにしている
  const [shopifyData, setShopifyData] = useState<ShopifyIntegrationData | null>(
    null,
  );

  const { fetchStoreInfoNormal } = useStoreInfoNormal();
  const { store } = useStore();
  const { setAlertState } = useAlert();

  useEffect(() => {
    const fetchShopifyData = async () => {
      const res = await fetchStoreInfoNormal(store.id, false, true);

      if (!res) return;

      const thisStoreSetting = res[0].ec_setting;

      if (!thisStoreSetting) return;

      setShopifyData({
        shopifyShopDomain: thisStoreSetting.shopify_shop_domain,
      });
    };
    fetchShopifyData();
  }, [store]);

  const isConnected = shopifyData && shopifyData.shopifyShopDomain;

  const [isExporting, setIsExporting] = useState(false);
  const handleExportStockCSV = async () => {
    setIsExporting(true);
    const apiClient = new MycaPosApiClient({
      BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
    });
    const res = await apiClient.shopify.getShopifyProductCsv({
      storeId: store.id!,
    });

    if (!res.fileUrl) {
      setAlertState({
        message: 'Shopify在庫CSV出力に失敗しました',
        severity: 'error',
      });
      return;
    }

    window.location.href = res.fileUrl;
    setIsExporting(false);
  };

  return (
    <ExternalPlatformCard
      title="Shopify"
      isLoading={isLoading}
      isConnected={!!isConnected}
      onConnect={onConnect}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="body1" sx={{ minWidth: 170 }}>
          ストアドメイン
        </Typography>
        <Typography variant="body1">
          {shopifyData?.shopifyShopDomain || '未設定'}
        </Typography>
      </Box>
      <Box>
        <PrimaryButton
          sx={{ width: '180px', mt: 2 }}
          onClick={handleExportStockCSV}
          loading={isExporting}
        >
          Shopify在庫CSV出力
        </PrimaryButton>
      </Box>
    </ExternalPlatformCard>
  );
}
