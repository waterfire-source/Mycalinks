import { useEffect, useState } from 'react';
import { useFetchTransactionDetails } from '@/feature/transaction/hooks/useFetchTransactionDetails';
import { useCustomer } from '@/feature/customer/hooks/useCustomer';
import { useLabelPrinterHistory } from '@/contexts/LabelPrinterContext';
import { DetailCard } from '@/components/cards/DetailCard';
import { BackendTransactionAPI } from '@/app/api/store/[store_id]/transaction/api';
import { TransactionDetailContent } from '@/feature/transaction/components/TransactionDetailContent';
import { TransactionDetailBottom } from '@/feature/transaction/components/TransactionDetailBottom';
import { TransactionKind } from '@prisma/client';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { Box } from '@mui/material';

export const TransactionDetail = ({
  selectedTransaction,
  handleClickReturn,
  isShow,
  setProductId,
  setIsDetailModalOpen,
  handleFetchTransactionData,
  onShowOriginalTransaction,
}: {
  selectedTransaction:
    | BackendTransactionAPI[5]['response']['200']['transactions'][0]
    | null;
  handleClickReturn: () => void;
  isShow: boolean;
  setProductId: React.Dispatch<React.SetStateAction<number | undefined>>;
  setIsDetailModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleFetchTransactionData: () => void;
  onShowOriginalTransaction?: (
    originalTransactionId: number | undefined,
  ) => void;
}) => {
  const transactionID = selectedTransaction ? selectedTransaction.id : null;
  const transactionKind = selectedTransaction
    ? selectedTransaction.transaction_kind
    : null;

  const { pushQueue } = useLabelPrinterHistory();
  const { transaction, fetchTransactionData, isLoading } =
    useFetchTransactionDetails(transactionID ?? 0);

  // 顧客IDから顧客情報を取得
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
    // エラー回避のため以下ESLintのコメントでのルール制御を挿入
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction]);

  // 印刷用のチェックボックスを全て選択するかどうかを管理するstate
  const [isCheckAll, setIsCheckAll] = useState(false);
  // 印刷用のチェックボックスの状態を管理するstateを追加（初期状態は全て選択）
  const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>(
    {},
  );

  // ポイント付与ダイアログの開閉状態を管理するstate
  const [isAddPointDialogOpen, setIsAddPointDialogOpen] = useState(false);
  const handleCloseAddPointDialog = () => {
    setIsAddPointDialogOpen(false);
  };

  // 初期状態で全て選択されるようにチェック状態を設定
  useEffect(() => {
    if (transaction?.transaction_carts) {
      setIsCheckAll(true);
    }
  }, [transaction]);

  // 全てのチェックボックスを選択
  const handleSelectAll = () => {
    if (transaction?.transaction_carts) {
      const allSelectedState = transaction.transaction_carts.reduce(
        (acc: { [key: number]: boolean }, cart) => {
          acc[cart.product_id] = true;
          return acc;
        },
        {},
      );
      setCheckedItems(allSelectedState);
    }
  };

  // isCheckAllの変更に伴う処理
  useEffect(() => {
    if (isLoading) return;
    if (isCheckAll) {
      handleSelectAll();
    } else {
      setCheckedItems({});
    }
  }, [isCheckAll, isLoading]);

  const handleCheckboxChange = (productId: number) => {
    setCheckedItems((prevState) => ({
      ...prevState,
      [productId]: !prevState[productId],
    }));
  };

  const handlePrintLabels = () => {
    // 取引の商品の配列から印刷のチェックが付いているものだけ抽出
    const checkedProducts = transaction?.transaction_carts.filter((item) => {
      return checkedItems[item.product_id];
    });

    if (!checkedProducts || !transaction) return;

    // 最後のアイテムのIDを特定
    const lastProductId =
      checkedProducts[checkedProducts.length - 1]?.product_id;

    checkedProducts.forEach((product) => {
      const thisProductInfo = transaction.transaction_carts.find(
        (e) => e.product_id == Number(product.product_id),
      );
      if (thisProductInfo) {
        //在庫数と同じだったら一つだけ価格ありにする
        const stockNumber = thisProductInfo.product_details?.stock_number ?? 0;

        let isFirstStock = stockNumber == thisProductInfo.item_count;
        const isLastItem = product.product_id === lastProductId;

        for (let i = 0; i < thisProductInfo.item_count; i++) {
          pushQueue({
            template: 'product',
            data: Number(product.product_id),
            meta: {
              isFirstStock,
              transactionId: transaction.id,
              isManual: true,
              isLastItem: isLastItem && i === thisProductInfo.item_count - 1, // 最後のアイテムの最後のラベル
            },
          });

          isFirstStock = false;
        }
      }
    });
  };

  return (
    <DetailCard
      title={`取引 ID：${transactionID ?? ''}${
        transaction?.reception_number !== null &&
        transaction?.transaction_kind === TransactionKind.buy
          ? `  (${transaction.reception_number})`
          : ''
      }${
        transaction && transaction.return_transaction_id !== null
          ? `  (返品済)`
          : ''
      }`}
      titleDetail={selectedTransaction?.is_return ? `※返品取引` : ''}
      titleTextColor={
        transactionKind === 'buy' || transactionKind === 'sell'
          ? 'text.secondary'
          : 'text.primary'
      }
      titleBackgroundColor={
        (transaction && transaction.return_transaction_id !== null) ||
        selectedTransaction?.is_return
          ? 'grey.700'
          : transactionKind === 'buy'
          ? 'primary.main'
          : transactionKind === 'sell'
          ? 'secondary.main'
          : 'common.white'
      }
      content={
        <>
          <TransactionDetailContent
            transactionID={transactionID}
            transaction={transaction}
            isLoading={isLoading}
            isAddPointDialogOpen={isAddPointDialogOpen}
            handleCloseAddPointDialog={handleCloseAddPointDialog}
            fetchTransactionData={fetchTransactionData}
            isCheckAll={isCheckAll}
            setIsCheckAll={setIsCheckAll}
            transactionKind={transactionKind}
            checkedItems={checkedItems}
            handleCheckboxChange={handleCheckboxChange}
            isShow={isShow}
            customer={customer}
            setProductId={setProductId}
            setIsDetailModalOpen={setIsDetailModalOpen}
          />
          {selectedTransaction && selectedTransaction.is_return && (
            <Box display="flex" justifyContent="flex-end" p={2}>
              <SecondaryButtonWithIcon
                id="basic-button"
                aria-controls="back-to-original-transaction"
                aria-haspopup="true"
                onClick={() =>
                  onShowOriginalTransaction?.(
                    transaction?.original_transaction_id ?? undefined,
                  )
                }
                disabled={isLoading}
              >
                元取引（{transaction?.original_transaction_id}）を表示
              </SecondaryButtonWithIcon>
            </Box>
          )}
        </>
      }
      bottomContent={
        isShow && transactionID && transaction ? (
          <TransactionDetailBottom
            transactionID={transactionID}
            transaction={transaction}
            isLoading={isLoading}
            handleClickReturn={handleClickReturn}
            setIsAddPointDialogOpen={setIsAddPointDialogOpen}
            handlePrintLabels={handlePrintLabels}
            handleFetchTransactionData={handleFetchTransactionData}
          />
        ) : (
          <></>
        )
      }
    />
  );
};
