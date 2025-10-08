import { Box, Stack, Typography } from '@mui/material';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import Image from 'next/image';
import { useEffect } from 'react';
import { TransactionWithProductDetailsType } from '@/feature/transaction/hooks/useFetchTransactionDetails';
import { CustomerSearchField } from '@/feature/customer/components/CustomerSearchField';
import { useStore } from '@/contexts/StoreContext';
import { useCustomer } from '@/feature/customer/hooks/useCustomer';
import { useAddPoint } from '@/feature/transaction/hooks/useAddPoint';
import { useAlert } from '@/contexts/AlertContext';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';

type AddPointDialogProps = {
  isOpen: boolean;
  handleClose: () => void;
  transaction: TransactionWithProductDetailsType | null;
  fetchTransactionData: () => void;
};

export const AddPointDialog = ({
  isOpen,
  handleClose,
  transaction,
  fetchTransactionData,
}: AddPointDialogProps) => {
  const { store } = useStore();
  const { customer, resetCustomer, fetchCustomerByMycaID } = useCustomer();
  const { setAlertState } = useAlert();

  // 付与ポイントの取得
  const { addPoint, fetchAddPoint, putTransaction } = useAddPoint();

  const onClose = () => {
    resetCustomer();
    handleClose();
  };

  // ポイント付与ボタンの処理
  const handlePutTransaction = async () => {
    if (store && customer && transaction) {
      // ポイント付与処理の実行
      await putTransaction(store.id, customer.id, transaction.id);
      setAlertState({
        message: `ポイントの付与に成功しました。`,
        severity: 'success',
      });
      // トランザクションの再取得
      fetchTransactionData();

      handleClose();
    }
  };
  useEffect(() => {
    if (store && customer && transaction && transaction.payment_method) {
      fetchAddPoint(
        store.id,
        customer.id,
        transaction.total_price,
        transaction.transaction_kind,
        transaction.payment_method,
      );
    }
  }, [customer, fetchAddPoint, fetchTransactionData, store, transaction]);

  return (
    <CustomModalWithIcon
      open={isOpen}
      onClose={onClose}
      title="ポイント付与"
      hideButtons
      width={600}
      height={400}
    >
      <Stack sx={{ p: 2, alignItems: 'center', height: '100%' }}>
        {transaction && customer ? (
          <Stack height="100%" alignItems="center" gap={2}>
            <Box>
              <Image
                src="/images/dangerous_icon.png"
                alt="Dangerous icon"
                width={90}
                height={80}
              />
            </Box>
            <Box>
              <Typography variant="h6">
                2重でのポイント付与にご注意ください。
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6">
                {transaction.id
                  ? `取引ID： ${transaction.id} ${
                      transaction.transaction_kind === 'buy'
                        ? '(買取)'
                        : transaction.transaction_kind === 'sell'
                        ? '(販売)'
                        : ''
                    }`
                  : '取引詳細'}
              </Typography>
              <Typography variant="h6">
                合計金額：￥{transaction.total_price.toLocaleString()}
              </Typography>
              <Typography variant="h6">
                付与ポイント：
                {addPoint
                  ? `${addPoint.pointAmount}` + 'pt'
                  : 'データ取得中...'}
              </Typography>
              <Typography variant="h6">会員名：{customer.full_name}</Typography>
            </Box>
            <Box>
              <SecondaryButton onClick={handlePutTransaction} sx={{ flex: 1 }}>
                付与
              </SecondaryButton>
            </Box>
          </Stack>
        ) : (
          <Stack height="100%" alignItems="center" gap={2}>
            <Typography sx={{ my: 2, textAlign: 'center' }}>
              会員コードを読み取ってください。
            </Typography>
            <CustomerSearchField
              store={store}
              fetchCustomerByMycaID={fetchCustomerByMycaID}
              isShowInputField={true}
            />
          </Stack>
        )}
      </Stack>
    </CustomModalWithIcon>
  );
};
