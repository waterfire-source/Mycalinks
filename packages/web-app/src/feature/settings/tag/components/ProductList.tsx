'use client';

import React from 'react';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  IconButton,
} from '@mui/material';
import { ProductType } from '@/feature/settings/tag/components/ProductSearchTable';
import Image from 'next/image';
import DeleteIcon from '@mui/icons-material/Delete';

interface ProductListProps {
  selectedProducts: ProductType[];
  tableHeight: string;
  onRemoveProduct: (productID: number) => void;
  onSave: () => Promise<void>;
  isLoading?: boolean;
  height?: string;
}

export const ProductList: React.FC<ProductListProps> = ({
  selectedProducts,
  tableHeight,
  onRemoveProduct: handleRemoveProduct,
  onSave: handleSave,
  isLoading = false,
  height = 'auto',
}) => {
  return (
    <Card
      sx={{
        width: '100%',
        height: tableHeight,
        minHeight: '554px',
        maxHeight: '100%',
        boxShadow: 3,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography
        align="center"
        sx={{
          color: 'text.secondary',
          backgroundColor: 'primary.main',
          height: '56px',
          borderRadius: '4px 4px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        タグを追加する商品
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          paddingTop: 2,
          paddingLeft: 2,
          paddingRight: 2,
          paddingBottom: 1,
          overflow: 'auto',
          width: '100%',
          gap: 1,
        }}
      >
        {/* 選択したプロダクトリスト部分 */}
        <Box
          sx={{
            flex: 1,
            minHeight: '200px',
            overflowY: 'auto',
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: height,
              maxHeight: height,
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid',
              borderColor: 'grey.300',
              borderRadius: '5px',
              overflow: 'hidden',
            }}
          >
            {/* ヘッダー部分 */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid',
                borderColor: 'grey.300',
                paddingX: 2,
                paddingY: 1,
                height: '35px',
              }}
            >
              <Typography variant="body1">
                合計{' '}
                <Typography
                  variant="h6"
                  component="span"
                  sx={{ fontSize: '1rem' }}
                >
                  {selectedProducts.length}商品
                </Typography>
              </Typography>
            </Box>

            {/* 商品リスト部分 */}
            <TableContainer
              sx={{
                flexGrow: 1,
                backgroundColor: 'white',
                paddingX: 2,
              }}
            >
              <Table stickyHeader>
                <TableBody>
                  {selectedProducts.map((product) => (
                    <TableRow key={product.id}>
                      {/* 商品画像 */}
                      <TableCell sx={{ width: 60, padding: 1 }}>
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            width={50}
                            height={72}
                            style={{
                              objectFit: 'cover',
                            }}
                            alt={product.displayName || ''}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 50,
                              height: 50,
                              backgroundColor: 'grey.300',
                            }}
                          />
                        )}
                      </TableCell>
                      {/* 商品詳細情報 */}
                      <TableCell sx={{ padding: 1 }}>
                        {/* 商品名とカード番号 */}
                        <Typography
                          sx={{
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            textAlign: 'left',
                            fontSize: '0.8rem',
                            paddingBottom: '5px',
                          }}
                        >
                          {product.displayName}
                          {product.cardNumber && ` (${product.cardNumber})`}
                        </Typography>
                        {/* レアリティ（存在する場合のみ表示） */}
                        {product.rarity && (
                          <Typography
                            sx={{
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                              textAlign: 'left',
                              fontSize: '0.8rem',
                              paddingBottom: '5px',
                            }}
                          >
                            レアリティ：{product.rarity}
                          </Typography>
                        )}
                        {/* 商品の状態 */}
                        <Typography
                          sx={{
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            textAlign: 'left',
                            fontSize: '0.8rem',
                            paddingBottom: '5px',
                          }}
                        >
                          状態：
                          {product.condition.conditionOptionId &&
                            product.condition.conditionOptionName}
                        </Typography>
                        {/* 販売/買取価格 */}
                        <Typography
                          sx={{
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            textAlign: 'left',
                            fontSize: '0.8rem',
                            paddingBottom: '5px',
                          }}
                        >
                          販売/買取：¥
                          {product.specificSellPrice?.toLocaleString() ||
                            product.sellPrice?.toLocaleString()}
                          /¥
                          {product.specificBuyPrice?.toLocaleString() ||
                            product.buyPrice?.toLocaleString()}
                        </Typography>
                      </TableCell>
                      {/* 削除ボタン */}
                      <TableCell
                        sx={{
                          width: '20px',
                          padding: '4px',
                          verticalAlign: 'center',
                        }}
                      >
                        <IconButton
                          aria-label="delete"
                          sx={{ height: 50, width: 50 }}
                          onClick={() => handleRemoveProduct(product.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Box>

      {/* ボタン部分 */}
      <Box sx={{ paddingLeft: 2, paddingRight: 2, paddingBottom: 2 }}>
        <PrimaryButton
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSave}
          disabled={selectedProducts.length === 0}
          loading={isLoading}
        >
          タグを追加
        </PrimaryButton>
      </Box>
    </Card>
  );
};
