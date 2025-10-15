import { Box, Stack, Typography } from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { useEffect, useMemo, useState } from 'react';
import { useFetchTransactionDetails } from '@/feature/transaction/hooks/useFetchTransactionDetails';
import { TransactionCartDetail } from '@/feature/transaction/components/TransactionCartDetail';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';
import { DetailCard } from '@/components/cards/DetailCard';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { palette } from '@/theme/palette';
import { useCustomer } from '@/feature/customer/hooks/useCustomer';
import { useStore } from '@/contexts/StoreContext';
import { CustomerBasicInformation } from '@/feature/customers/components/CustomerBasicInformation';

export const DraftSaleDetail = ({
  transactionID,
  customerID,
  setIsOpen,
  handleDelete,
}: {
  transactionID: number | null;
  customerID: number | null;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleDelete: (id: number) => void;
}) => {
  const { store } = useStore();
  const { transaction, fetchTransactionData } = useFetchTransactionDetails(
    transactionID ?? 0,
  );
  const router = useRouter();

  const { customer, fetchCustomerByCustomerID } = useCustomer();

  // 削除確認モーダル用の状態
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  //IDからproductの情報を持たせたデータを取得
  useEffect(() => {
    if (transactionID) {
      fetchTransactionData();
    }
  }, [transactionID, fetchTransactionData]);

  useEffect(() => {
    if (customerID) {
      fetchCustomerByCustomerID(store.id, customerID);
    }
  }, [customerID, fetchCustomerByCustomerID, store.id]);

  // 削除を実行
  const handleDeleteConfirm = () => {
    if (!transactionID) return;

    setIsDeleting(true);
    try {
      handleDelete(transactionID);
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error('削除エラー:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // 会計ボタンの処理
  const handleResume = (transactionID: number, customerID: number | null) => {
    // 会員情報がある場合はクエリパラメータにIDを載せる
    const customerParam = customerID ? `&customerID=${customerID}` : '';
    const targetUrl = `${PATH.SALE.root}?transactionID=${transactionID}${customerParam}`;

    // 現在のURLと同じ場合は強制リロード
    if (window.location.pathname + window.location.search === targetUrl) {
      window.location.reload();
    } else {
      router.push(targetUrl);
    }

    // モーダルを閉じる
    setIsOpen(false);
  };

  const content = useMemo(() => {
    return (
      <>
        {transactionID ? (
          <Box sx={{ width: '100%', height: '100%', overflowY: 'auto' }}>
            {transaction ? (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid',
                    padding: 2,
                  }}
                >
                  <Typography variant="body1">
                    合計
                    <Typography component="span">
                      {transaction.transaction_carts.reduce(
                        (total, cart) => total + (cart.item_count || 0),
                        0,
                      )}
                      点{' '}
                    </Typography>
                    <Typography component="span">
                      ({transaction.transaction_carts.length}商品)
                    </Typography>
                  </Typography>
                  <Typography variant="body1">
                    合計金額{' '}
                    <Typography component="span">
                      {transaction.total_price.toLocaleString()}円
                    </Typography>
                  </Typography>
                </Box>

                {/* スクロール可能な領域 */}
                <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                  {/* transaction.transaction_carts分コンポーネントを表示 */}
                  {transaction.transaction_carts.map((item, index) => (
                    <TransactionCartDetail
                      key={index}
                      transactionCart={item}
                      checked={false}
                      onCheckboxChange={() => {}}
                    />
                  ))}
                  <Box
                    sx={{
                      width: '80%',
                      mx: 'auto',
                      my: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    {customer && (
                      <CustomerBasicInformation customer={customer} />
                    )}
                    <Typography>メモ</Typography>
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{
                        border: '1px solid',
                        p: 2,
                        borderRadius: 1,
                        borderColor: palette.grey[300],
                      }}
                    >
                      <Typography>{transaction.description}</Typography>
                    </Stack>
                  </Box>
                </Box>
              </>
            ) : (
              <Typography>詳細情報を取得中...</Typography>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              mt: 2,
              p: 2,
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h1" sx={{ ml: 1 }}>
                保留リストを選択して詳細を表示
              </Typography>
            </Box>
          </Box>
        )}
      </>
    );
  }, [transactionID, transaction]);

  const bottomContent = useMemo(() => {
    return (
      <>
        <SecondaryButton
          sx={{
            borderRadius: 1,
            whiteSpace: 'nowrap',
            width: 'auto',
            minWidth: 'auto',
          }}
          onClick={() => setDeleteConfirmOpen(true)}
          disabled={!transactionID}
        >
          削除
        </SecondaryButton>
        <PrimaryButton
          sx={{
            borderRadius: 1,
            whiteSpace: 'nowrap',
            width: 'auto',
            minWidth: 'auto',
          }}
          onClick={() => handleResume(transactionID!, customerID)}
          disabled={!transactionID}
        >
          会計に進む
        </PrimaryButton>
      </>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionID, customerID]);

  const title = `取引ID: ${transactionID || ''}${
    transaction?.reception_number
      ? `（受付番号: ${transaction.reception_number}）`
      : '（受付番号: ）'
  }`;

  return (
    <>
      <DetailCard
        title={title}
        content={content}
        bottomContent={bottomContent}
        titleSx={{ p: 2 }}
        containerSx={{ width: '100%', flexGrow: 1, minHeight: 0 }}
        contentSx={{
          width: '100%',
          height: '100%',
          padding: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />

      {/* 削除確認モーダル */}
      <ConfirmationDialog
        title="保留削除"
        message="本当に削除しますか？"
        confirmButtonText="削除する"
        cancelButtonText="削除しない"
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </>
  );
};
