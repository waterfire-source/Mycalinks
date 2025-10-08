import { useEffect, useMemo } from 'react';
import {
  Modal,
  Box,
  Typography,
  Divider,
  Paper,
  Stack,
  Button,
  Tooltip,
} from '@mui/material';
import { ProductDetail } from '@/feature/products/components/ProductDetail';
import { useFetchTransactionDetails } from '@/feature/transaction/hooks/useFetchTransactionDetails';
import { useCustomer } from '@/feature/customer/hooks/useCustomer';
import { FaTimes } from 'react-icons/fa';
import ErrorIcon from '@mui/icons-material/Error';

interface TransactionDetailModalProps {
  open: boolean;
  onClose: () => void;
  transactionID: number;
}

export const TransactionDetailModal = ({
  open,
  onClose,
  transactionID,
}: TransactionDetailModalProps) => {
  const { transaction, fetchTransactionData, isLoading } =
    useFetchTransactionDetails(transactionID ?? 0);
  const { customer, fetchCustomerByCustomerID, resetCustomer } = useCustomer();

  useEffect(() => {
    if (transactionID) {
      fetchTransactionData();
    }
  }, [transactionID, fetchTransactionData]);

  useEffect(() => {
    if (transaction && transaction.customer_id) {
      fetchCustomerByCustomerID(transaction.store_id, transaction.customer_id);
    } else {
      resetCustomer();
    }
  }, [transaction]);

  // 手入力の検知
  const isAmountChangeFlg = useMemo(() => {
    if (!transaction) return false;

    return transaction.transaction_carts.some(
      (cart) =>
        cart.unit_price != null &&
        cart.original_unit_price != null &&
        cart.unit_price !== cart.original_unit_price,
    );
  }, [transaction]);

  return (
    <Modal open={open} onClose={onClose}>
      <Paper
        sx={{
          position: 'absolute',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          height: '90%',
          top: '50%',
          left: '50%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {isLoading ? (
          <Box
            sx={{
              height: '100%',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography>詳細情報を取得中...</Typography>
          </Box>
        ) : transaction ? (
          <>
            {/* ヘッダー */}
            <Stack
              flexDirection={'row'}
              width={'100%'}
              alignItems={'center'}
              justifyContent={'space-between'}
              sx={{
                bgcolor:
                  transaction.transaction_kind === 'sell'
                    ? 'secondary.main'
                    : 'primary.main',
                color: 'common.white',
                p: 1,
                borderRadius: '4px 4px 0 0',
              }}
            >
              <Typography variant="h6">
                取引ID: {transaction.id} (
                {transaction.transaction_kind === 'sell' ? '販売' : '買取'})
              </Typography>

              <Button
                onClick={onClose}
                sx={{
                  right: '10px',
                  color: 'common.white',
                  minWidth: 'auto',
                }}
              >
                <FaTimes size={10} />
              </Button>
            </Stack>

            {/* 商品リスト部分 */}
            <Box
              sx={{
                flexGrow: 1,
                overflowY: 'auto',
                border: '1px solid',
                borderColor: 'common.black',
                m: 2,
                p: 2,
              }}
            >
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body1">
                  {transaction.transaction_carts.reduce(
                    (total, cart) => total + (cart.item_count || 0),
                    0,
                  )}
                  点 ({transaction.transaction_carts.length}商品)
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {isAmountChangeFlg && (
                    <Tooltip
                      title="手入力による金額の変更が行われています。"
                      placement="top"
                      arrow
                    >
                      <ErrorIcon
                        color="error"
                        sx={{ mr: 1, verticalAlign: 'middle' }}
                      />
                    </Tooltip>
                  )}
                  <Typography variant="body1">
                    合計金額 ¥{transaction.total_price.toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ my: 1 }} />

              <Stack flexDirection={'column'}>
                {transaction.transaction_carts.map((item, index) => (
                  <Box key={index}>
                    <ProductDetail
                      imageUrl={item.product_details?.image_url ?? ''}
                      title={`${item.product_name} ${item.product_details?.product_code} (${item.product_details?.product_code})`}
                      condition={
                        item.product_details?.condition_option_display_name ??
                        ''
                      }
                      rarity={item.product_details?.item_rarity ?? ''}
                      price={item.unit_price}
                      discountPrice={item.total_discount_price}
                      total_unit_price={item.total_unit_price * item.item_count}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-end',
                          gap: '2px',
                        }}
                      >
                        <Typography
                          sx={{ fontSize: '14px', whiteSpace: 'nowrap' }}
                        >
                          数量
                          <Box
                            component="span"
                            sx={{ fontSize: '18px', fontWeight: 'bold' }}
                          >
                            {item.item_count}
                          </Box>
                        </Typography>
                      </Box>
                    </ProductDetail>
                    <Divider sx={{ my: 1 }} />
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* 顧客情報 */}
            {customer && (
              <Box
                sx={{
                  borderColor: 'common.black',
                  p: '0 16px 16px 16px',
                  flexShrink: 0,
                }}
              >
                <Typography variant="body2">
                  名前: {customer.full_name}（{customer.full_name_ruby}）
                </Typography>
                <Typography variant="body2">
                  郵便番号: {customer.zip_code}
                </Typography>
                <Typography variant="body2">
                  住所: {customer.prefecture}
                  {customer.city}
                  {customer.address2}
                  {customer.building}
                </Typography>
                <Typography variant="body2">
                  電話番号: {customer.phone_number}
                </Typography>
              </Box>
            )}
          </>
        ) : (
          <Typography>詳細情報が取得できませんでした。</Typography>
        )}
      </Paper>
    </Modal>
  );
};
