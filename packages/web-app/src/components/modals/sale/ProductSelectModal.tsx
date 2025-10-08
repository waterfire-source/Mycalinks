'use client';

import { Box, Typography, Stack } from '@mui/material';
import { SaleItem } from '@/app/auth/(dashboard)/stock/sale/register/page';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { ProductList } from '@/feature/stock/sale/register/components/ProductList';
import { SaleProductSearchTable } from '@/components/tables/ProductSearchTable';
import { SaleRule } from '@prisma/client';
import { useState, useEffect } from 'react';

/**
 * セール・キャンペーンの対象商品または除外商品を選択するモーダルのProps
 */
export interface ProductSelectModalProps {
  /** モーダルの開閉状態 */
  open: boolean;
  /** モーダルを閉じる関数 */
  onClose: () => void;
  /** セールルール (include: 対象商品, exclude: 除外商品) */
  saleRule: SaleRule;
  /** 選択されたセール情報 */
  selectedSale: SaleItem;
  /** セール情報を更新する関数 */
  setSelectedSale: React.Dispatch<React.SetStateAction<SaleItem>>;
}

/**
 * セール・キャンペーンの対象商品または除外商品を選択するモーダル
 * 左側に商品検索テーブル、右側に選択された商品リストを表示
 */
export const ProductSelectModal: React.FC<ProductSelectModalProps> = ({
  open,
  onClose,
  saleRule,
  selectedSale,
  setSelectedSale,
}: ProductSelectModalProps) => {
  // 一時的な選択状態を管理するためのローカルステート
  const [temporarySelectedSale, setTemporarySelectedSale] = useState<SaleItem>(
    () => ({
      ...selectedSale,
      products: [...selectedSale.products],
    }),
  );

  // モーダルが開かれるたびに、temporarySelectedSaleを初期化
  useEffect(() => {
    if (open) {
      setTemporarySelectedSale({
        ...selectedSale,
        products: [...selectedSale.products],
      });
    }
  }, [open, selectedSale]);

  const handleActionButtonClick = () => {
    // 確定ボタンクリック時に親コンポーネントのステートを更新
    setSelectedSale(temporarySelectedSale);
    onClose();
  };

  return (
    <CustomModalWithIcon
      open={open}
      onClose={onClose}
      title={
        saleRule === SaleRule.include
          ? 'セール・キャンペーン対象商品選択検索'
          : 'セール・キャンペーン除外商品選択検索'
      }
      actionButtonText={
        saleRule === SaleRule.include ? '対象商品を追加' : '除外商品を追加'
      }
      cancelButtonText="商品追加しない"
      onActionButtonClick={handleActionButtonClick}
      width="90%"
      height="90%"
    >
      <Stack flexDirection="row" gap={3} width="100%" height="100%">
        {/* 左エリア：商品検索テーブル */}
        <Stack sx={{ flex: 7, overflow: 'scroll', minHeight: 0 }}>
          <SaleProductSearchTable
            width="100%"
            height="100%"
            selectedSale={temporarySelectedSale}
            setSelectedSale={setTemporarySelectedSale}
            modalType={temporarySelectedSale.transactionKind}
            saleRule={saleRule}
            isActive={true}
          />
        </Stack>

        {/* 右エリア：選択された商品リスト */}
        <Stack sx={{ flex: 3, gap: 3, py: 1, minHeight: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              px: 2,
              py: 1,
              borderBottom: '1px solid #E0E0E0',
              minHeight: '48px',
            }}
          >
            <Typography variant="h6">
              {saleRule === SaleRule.include ? '対象商品' : '除外商品'}
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {temporarySelectedSale.products.length}商品
            </Typography>
          </Box>
          
          <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
            <ProductList
              selectedSale={temporarySelectedSale}
              setSelectedSale={setTemporarySelectedSale}
              sx={{
                overflow: 'auto',
                height: '100%',
              }}
            />
          </Box>
        </Stack>
      </Stack>
    </CustomModalWithIcon>
  );
};
