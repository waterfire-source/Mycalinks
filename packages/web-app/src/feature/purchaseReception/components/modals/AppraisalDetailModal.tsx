import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import { CustomModalWithHeader } from '@/components/modals/CustomModalWithHeader';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { ProductDetail } from '@/feature/products/components/ProductDetail';
import { BackendTransactionAPI } from '@/app/api/store/[store_id]/transaction/api';
// import { TransactionCart } from '@/app/auth/(dashboard)/purchaseReception/[TransactionID]/purchase/page';
import { TransactionCart } from '@/feature/purchaseReception/hooks/useTransactionCart';
import SecondaryButton from '@/components/buttons/SecondaryButton';

interface AppraisalDetailModalProps {
  open: boolean;
  onClose: () => void;
  transaction: TransactionCart;
  customerCartItems:
    | BackendTransactionAPI[5]['response']['200']['transactions'][0]['transaction_customer_carts'][0][]
    | null;
  onConfirmClick: () => void;
  onCancelClick: () => void;
}

export const AppraisalDetailModal: React.FC<AppraisalDetailModalProps> = ({
  open,
  onClose,
  transaction,
  customerCartItems,
  onConfirmClick,
  onCancelClick,
}) => {
  // 合計査定額を計算
  const totalAppraisalAmount = transaction.transaction_cart_items.reduce(
    (sum: number, item: TransactionCart['transaction_cart_items'][0]) => {
      const customerCartDetail = customerCartItems?.find(
        (customerCart) => customerCart.product_id === item.product_details.id,
      );

      // customerCartItems が存在する場合はその item_count を優先して使用
      const itemCount = customerCartDetail
        ? customerCartDetail.item_count
        : item.item_count;

      // 合計査定額の計算
      return sum + (item.unit_price + (item.discount_price ?? 0)) * itemCount;
    },
    0,
  );

  return (
    <CustomModalWithHeader
      open={open}
      onClose={onClose}
      title="査定内容確認"
      height="80%"
      width="30%"
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between',
          gap: '30px',
        }}
      >
        <TableContainer
          component={Paper}
          sx={{
            height: '100%',
            overflowY: 'auto',
            border: '0.1px solid gray',
            boxShadow: 'none',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingY: 2,
              paddingX: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: '18px',
              }}
            >
              買取番号：
              <span style={{ fontSize: '24px', paddingLeft: '10px' }}>
                {transaction.reception_number}
              </span>
            </Typography>

            <Typography
              sx={{
                fontSize: '18px',
              }}
            >
              合計査定額
              <span style={{ fontSize: '24px', paddingLeft: '10px' }}>
                ¥{totalAppraisalAmount.toLocaleString()}
              </span>
            </Typography>
          </Box>
          <Divider
            sx={{
              my: 2,
              borderColor: 'grey.500',
              width: '100%',
              margin: '0',
            }}
          />

          <Table>
            <TableBody sx={{ height: '100%', overflowY: 'auto' }}>
              {transaction.transaction_cart_items.map((detail, index) => {
                const customerCartDetail = customerCartItems?.find(
                  (customerCart) =>
                    customerCart.product_id === detail.product_details.id,
                );

                const customerSideQuantity = customerCartDetail
                  ? customerCartDetail.item_count
                  : detail.item_count;

                const highlight = detail.item_count !== customerSideQuantity;

                return (
                  <TableRow key={index} sx={{ boxShadow: 'none' }}>
                    <TableCell
                      colSpan={3}
                      sx={{
                        boxShadow: 'none',
                        p: 2,
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 2,
                        justifyContent: 'space-between',
                      }}
                    >
                      <ProductDetail
                        imageUrl={detail.product_details.image_url || ''}
                        title={detail.product_details.display_name || ''}
                        condition={
                          detail.product_details.conditions[0]?.option_name ||
                          ''
                        }
                        discountPrice={detail.discount_price}
                        price={detail.unit_price}
                        quantity={detail.item_count}
                        customerSideQuantity={customerSideQuantity}
                      >
                        <Typography
                          sx={{
                            bottom: 0,
                            marginTop: 'auto',
                            fontSize: '24px',
                            color: highlight ? 'primary.main' : 'text.primary',
                          }}
                        >
                          ¥
                          {(
                            (detail.unit_price + (detail.discount_price ?? 0)) *
                            (highlight
                              ? customerSideQuantity
                              : detail.item_count)
                          ).toLocaleString()}
                        </Typography>
                      </ProductDetail>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <PrimaryButton
          onClick={onConfirmClick}
          fullWidth
          sx={{ height: '50px' }}
        >
          買取会計へ
        </PrimaryButton>

        <SecondaryButton
          onClick={onCancelClick}
          fullWidth
          sx={{ height: '50px' }}
        >
          買取をキャンセル
        </SecondaryButton>
      </Box>
    </CustomModalWithHeader>
  );
};
