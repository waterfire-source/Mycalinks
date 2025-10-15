'use client';

import { Box, Typography } from '@mui/material';

interface ShopifyConnectionData {
  shopifyStoreUrl: string | null;
  shopifyAccessToken: string | null;
  shopifyWebhookSecret: string | null;
}

interface ShopifyConnectionDisplayProps {
  connectionData: ShopifyConnectionData;
}

export function ShopifyConnectionDisplay({
  connectionData,
}: ShopifyConnectionDisplayProps) {
  return (
    <>
      {/* ストアURL */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="body1" sx={{ minWidth: 170 }}>
          ストアURL
        </Typography>
        <Typography variant="body1">
          {connectionData?.shopifyStoreUrl}
        </Typography>
      </Box>

      {/* アクセストークン */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="body1" sx={{ minWidth: 170 }}>
          アクセストークン
        </Typography>
        <Typography variant="body1">
          {connectionData?.shopifyAccessToken &&
            `shpat_****${connectionData.shopifyAccessToken.slice(-4)}`}
        </Typography>
      </Box>

      {/* Webhookシークレット */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="body1" sx={{ minWidth: 170 }}>
          Webhookシークレット
        </Typography>
        <Typography variant="body1">
          {connectionData?.shopifyWebhookSecret &&
            `whsec_****${connectionData.shopifyWebhookSecret.slice(-4)}`}
        </Typography>
      </Box>
    </>
  );
}