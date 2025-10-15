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
  CircularProgress,
} from '@mui/material';
import { CustomModalWithHeader } from '@/components/modals/CustomModalWithHeader';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { ProductDetail } from '@/feature/products/components/ProductDetail';
import { TransactionCart } from '@/feature/purchaseReception/hooks/useTransactionCart';
import { Specialties } from '@/feature/specialty/hooks/useGetSpecialty';
interface UnappraisalDetailModalProps {
  open: boolean;
  onClose: () => void;
  onConfirmedClick: () => Promise<void>;
  transaction: TransactionCart | null;
  isLoading: boolean;
  specialties: Specialties;
}

export const UnappraisalDetailModal: React.FC<UnappraisalDetailModalProps> = ({
  open,
  onClose,
  onConfirmedClick,
  transaction,
  isLoading,
  specialties,
}) => {
  // 合計査定額を計算
  const totalAppraisalAmount =
    transaction?.transaction_cart_items.reduce(
      (sum, item) =>
        sum +
        (item.unit_price + (item.discount_price ? item.discount_price : 0)) *
          item.item_count,
      0,
    ) || 0;

  return (
    <CustomModalWithHeader
      open={open}
      onClose={onClose}
      title="査定内容確認"
      height="70%"
      width="30%"
      sx={{ minWidth: '300px' }}
      dataTestId="purchase-unappraisal-modal"
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
            <Typography variant="body2">
              買取番号：
              {transaction?.reception_number}
            </Typography>

            <Typography variant="body2">
              合計査定額 ¥{totalAppraisalAmount.toLocaleString()}
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
          <Table stickyHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : transaction ? (
                transaction.transaction_cart_items.map((detail, index) => (
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
                        title={`${
                          detail.product_details?.display_name ?? ''
                        } (${detail.expansion ?? ' '} ${
                          detail.cardnumber ?? ''
                        })`}
                        condition={
                          detail.product_details.conditionDisplayName || ''
                        }
                        price={detail.unit_price}
                        discountPrice={detail.discount_price}
                        quantity={detail.item_count}
                        specialty={
                          specialties.find(
                            (specialty) => specialty.id === detail.specialId,
                          )?.display_name
                        }
                        managementNumber={detail.managementNumber}
                      >
                        <Typography
                          variant="body1"
                          style={{
                            marginTop: 'auto',
                            color: 'text.primary',
                          }}
                        >
                          ¥
                          {(
                            (Number(detail.unit_price) +
                              Number(detail.discount_price || 0)) *
                            detail.item_count
                          ).toLocaleString()}
                        </Typography>
                      </ProductDetail>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    データの取得に失敗しました
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <PrimaryButton
          onClick={onConfirmedClick}
          fullWidth
          disabled={isLoading || !transaction}
          sx={{ height: '50px' }}
          data-testid="purchase-unappraisal-confirm-button"
        >
          査定確定
        </PrimaryButton>
      </Box>
    </CustomModalWithHeader>
  );
};
