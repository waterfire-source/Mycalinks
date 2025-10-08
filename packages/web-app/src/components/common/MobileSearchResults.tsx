'use client';

import React from 'react';
import {
  Box,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';

import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';
import { ProductDetailCard } from '@/feature/products/components/ProductDetailCard';

interface Props {
  searchResults: BackendItemAPI[0]['response']['200']['items'][0][];
  onRegister: (
    productId: number,
    row: BackendItemAPI[0]['response']['200']['items'][0],
    registerCount: number,
  ) => void;
  isLoading: boolean;
  loadMoreItems: () => Promise<void>;
  hasMore: boolean;
  isStockRestriction: boolean;
}

export const MobileSearchResults: React.FC<Props> = ({
  searchResults,
  onRegister,
  isLoading,
  loadMoreItems,
  hasMore,
  isStockRestriction,
}) => {
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (
      scrollHeight - scrollTop <= clientHeight * 1.5 &&
      hasMore &&
      !isLoading
    ) {
      loadMoreItems();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        border: 'solid 1px',
        borderColor: 'grey.300',
        height: '100%',
        width: '100%',
        overflowX: 'hidden',
      }}
    >
      <Box sx={{ height: '100%', width: '100%' }}>
        <Stack
          direction="column"
          sx={{
            height: '100%',
            overflowY: 'auto',
          }}
          onScroll={handleScroll}
        >
          {searchResults.length > 0 ? (
            <>
              {searchResults.map((item) => (
                <React.Fragment key={item.id}>
                  <ProductDetailCard
                    imageUrl={item.image_url || ''}
                    title={item.products[0]?.displayNameWithMeta}
                    isStockRestriction={isStockRestriction}
                    conditions={item.products.map((product) => ({
                      name: product.condition_option_display_name || '',
                      buyPrice: product.specific_buy_price ?? product.buy_price,
                      sellPrice:
                        product.specific_sell_price ?? product.sell_price,
                      stockNumber: product.stock_number,
                      tags: [],
                      onRegister: (registerCount: number) =>
                        onRegister(product.id, item, registerCount),
                    }))}
                  />
                  <Divider />
                </React.Fragment>
              ))}
              {isLoading && (
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    padding: 2,
                  }}
                >
                  <CircularProgress size={24} />
                </Box>
              )}
            </>
          ) : isLoading ? (
            <Stack
              justifyContent="center"
              alignItems="center"
              sx={{ height: '100%', width: '100%' }}
            >
              <CircularProgress size={24} />
            </Stack>
          ) : (
            <Stack
              justifyContent="center"
              alignItems="center"
              sx={{ height: '100%', width: '100%' }}
            >
              <Typography variant="body1" color="text.primary">
                検索結果がありません。
              </Typography>
            </Stack>
          )}
        </Stack>
      </Box>
    </Box>
  );
};
