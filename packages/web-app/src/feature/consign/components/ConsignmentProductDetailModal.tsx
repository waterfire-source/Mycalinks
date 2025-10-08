'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  TextField,
  Grid,
  Checkbox,
} from '@mui/material';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { ItemImage } from '@/feature/item/components/ItemImage';
import {
  ConsignmentProduct,
  useConsignment,
} from '@/feature/consign/hooks/useConsignment';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { useLabelPrinterHistory } from '@/contexts/LabelPrinterContext';
import { CustomTable } from '@/components/tables/CustomTable';
import { ColumnDef } from '@/components/tables/CustomTable';
import { ItemText } from '@/feature/item/components/ItemText';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { CancelConsignmentModal } from '@/feature/consign/components/cancelConsignment/CancelConsignmentModal';

interface ConsignmentProductDetailModalProps {
  open: boolean;
  onClose: () => void;
  consignmentClient: any;
}
type PrintCount = {
  id: number;
  count: number;
};

export const ConsignmentProductDetailModal: React.FC<
  ConsignmentProductDetailModalProps
> = ({ open, onClose, consignmentClient }) => {
  const { fetchConsignmentProducts } = useConsignment();
  const { pushQueue } = useLabelPrinterHistory();
  const [products, setProducts] = useState<ConsignmentProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [printCounts, setPrintCounts] = useState<PrintCount[]>([]);
  const [isOpenCancelModal, setIsOpenCancelModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<
    ConsignmentProduct[]
  >([]);

  useEffect(() => {
    if (open && consignmentClient) {
      fetchProductsData();
    }
  }, [open, consignmentClient]);

  const fetchProductsData = async () => {
    if (!consignmentClient) return;

    setLoading(true);
    try {
      const result = await fetchConsignmentProducts({
        consignmentClientFullName: consignmentClient.full_name,
        includesSummary: true,
      });

      if (result) {
        if (Array.isArray(result.products)) {
          setProducts(result.products);
        } else {
          setProducts([]);
        }
      }
    } catch (error) {
      console.error('商品取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCountChange = (id: number, value: string) => {
    const newValue = parseInt(value, 10) || 0;

    setPrintCounts((prev) => {
      const existing = prev.find((p) => p.id === id);
      if (existing) {
        return prev.map((p) => (p.id === id ? { ...p, count: newValue } : p));
      } else {
        return [...prev, { id, count: newValue }];
      }
    });
  };

  const handleProductSelect = (
    product: ConsignmentProduct,
    checked: boolean,
  ) => {
    setSelectedProducts((prev) => {
      if (checked) {
        const exists = prev.some((p) => p.id === product.id);
        if (!exists) {
          return [...prev, product];
        }
        return prev;
      } else {
        return prev.filter((p) => p.id !== product.id);
      }
    });
  };

  const handleCloseProductDetailModal = () => {
    onClose();
    setSelectedProducts([]);
  };

  if (!consignmentClient) return null;

  const columns: ColumnDef<ConsignmentProduct>[] = [
    {
      header: '',
      render: (product) => (
        <Checkbox
          sx={{
            '& .MuiSvgIcon-root': { color: 'primary.main' },
          }}
          checked={selectedProducts.some((p) => p.id === product.id)}
          onChange={(e) => handleProductSelect(product, e.target.checked)}
        />
      ),
      sx: { textAlign: 'center', width: '60px' },
    },
    {
      header: '商品画像',
      render: (product) => (
        <Box sx={{ width: 60, height: 60, margin: '0 auto' }}>
          <ItemImage imageUrl={product.image_url || null} fill />
        </Box>
      ),
      sx: { textAlign: 'center', width: '100px' },
    },
    {
      header: '商品名',
      render: (product) => <ItemText text={product.displayNameWithMeta} />,
    },
    {
      header: '販売価格',
      render: (product) => `${product.specific_sell_price?.toLocaleString()}円`,
      sx: { textAlign: 'center', width: '150px' },
    },
    {
      header: '在庫数',
      render: (product) => `${product.stock_number || 0}点`,
      sx: { textAlign: 'center', width: '100px' },
    },
    {
      header: '',
      render: (product) => (
        <Stack direction="row" gap={1}>
          <TextField
            sx={{
              flex: 1,
              minWidth: '40px',
            }}
            size="small"
            type="number"
            placeholder="枚数"
            onClick={(e) => e.stopPropagation()}
            value={printCounts.find((p) => p.id === product.id)?.count ?? ''}
            onChange={(e) => handleCountChange(product.id, e.target.value)}
          />
          <PrimaryButton
            size="small"
            onClick={async (e) => {
              e.stopPropagation();

              //在庫数>指定した枚数の場合→価格無しラベルのみ
              //在庫数=指定した枚数の場合→価格ありラベル1枚+残り価格無しラベル

              const productId = product.id;
              const printCount =
                printCounts.find((p) => p.id === product.id)?.count ?? 1;
              const stockNumber = product.stock_number ?? 0;

              let isFirstStock = stockNumber <= printCount;

              for (let i = 0; i < printCount; i++) {
                pushQueue({
                  template: 'product',
                  data: productId,
                  meta: {
                    isFirstStock,
                    isManual: true,
                  },
                });
                isFirstStock = false; //2枚目以降はfalseで
              }
            }}
            sx={{ minWidth: '60px' }}
          >
            印刷
          </PrimaryButton>
        </Stack>
      ),
      sx: { textAlign: 'center', width: '180px' },
    },
  ];

  return (
    <>
      <CancelConsignmentModal
        open={isOpenCancelModal}
        onClose={() => setIsOpenCancelModal(false)}
        selectedProducts={selectedProducts}
        setSelectedProducts={setSelectedProducts}
        fetchProductsData={fetchProductsData}
      />
      <CustomModalWithIcon
        open={open}
        onClose={handleCloseProductDetailModal}
        title="受託在庫一覧"
        width="90%"
        height="90%"
        hideButtons={true}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* メインコンテンツエリア */}
          <Box
            sx={{
              flexGrow: 1,
              overflow: 'hidden',
              marginBottom: 2,
              minHeight: 0, // 重要: フレックスアイテムの最小高さを0に設定
            }}
          >
            <Grid container sx={{ height: '100%' }}>
              {/* 左側：委託者情報エリア */}
              <Grid
                item
                xs={3}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  flexShrink: 0, // 左側エリアのサイズを固定
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="body2" sx={{ minWidth: '60px' }}>
                    委託者
                  </Typography>
                  <TextField
                    size="small"
                    value={consignmentClient?.full_name || '委託者名'}
                    InputProps={{ readOnly: true }}
                    sx={{
                      backgroundColor: 'white',
                      '& .MuiInputBase-root': {
                        height: '32px',
                      },
                    }}
                  />
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <SecondaryButton
                    onClick={() => setIsOpenCancelModal(true)}
                    disabled={!selectedProducts.length}
                  >
                    選択した委託を取り消し
                  </SecondaryButton>
                </Stack>
              </Grid>

              {/* 右側：商品テーブル */}
              <Grid
                item
                xs={9}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flexGrow: 1,
                  height: '100%',
                  minHeight: 0, // 重要: フレックスアイテムの最小高さを0に設定
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0, // 重要: フレックスアイテムの最小高さを0に設定
                    overflow: 'hidden', // 親コンテナでのオーバーフローを防ぐ
                  }}
                >
                  <CustomTable
                    columns={columns}
                    rows={products}
                    rowKey={(product) => product.id || 'sample'}
                    sx={{
                      flex: 1,
                    }}
                    isLoading={loading}
                    hasRedLine={true}
                  />
                </Box>
                <Box
                  width="100%"
                  display="flex"
                  sx={{
                    borderTop: '1px solid #ddd',
                    backgroundColor: 'white',
                    justifyContent: 'end',
                    flexShrink: 0, // フッターエリアのサイズを固定
                  }}
                >
                  <PrimaryButton
                    onClick={async () => {
                      //在庫数分印刷の場合→価格無し1枚+残り価格あり

                      products.forEach((product) => {
                        const printCount =
                          printCounts.find((p) => p.id === product.id)?.count ??
                          product.stock_number;

                        let isFirstStock = product.stock_number <= printCount;

                        for (let i = 0; i < printCount; i++) {
                          pushQueue({
                            template: 'product',
                            data: product.id,
                            meta: {
                              isFirstStock,
                              isManual: true,
                            },
                          });

                          isFirstStock = false;
                        }
                      });
                    }}
                    sx={{
                      margin: '8px',
                      minWidth: '100px',
                    }}
                  >
                    ラベル印刷
                  </PrimaryButton>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </CustomModalWithIcon>
    </>
  );
};
