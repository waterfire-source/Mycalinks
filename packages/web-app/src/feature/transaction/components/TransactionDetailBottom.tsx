import { useState, MouseEvent, useMemo } from 'react';
import { Menu, MenuItem } from '@mui/material';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { useEposDevice } from '@/contexts/EposDeviceContext';
import { TransactionWithProductDetailsType } from '@/feature/transaction/hooks/useFetchTransactionDetails';
import { useAccountGroupContext } from '@/contexts/AccountGroupProvider';
import { useStore } from '@/contexts/StoreContext';
import { usePayment } from '@/feature/transaction/hooks/usePayment';
import { TransactionPaymentMethod } from '@prisma/client';

interface TransactionDetailBottomProps {
  transactionID: number;
  transaction: TransactionWithProductDetailsType;
  isLoading: boolean;
  handleClickReturn: () => void;
  setIsAddPointDialogOpen: (isAddPointDialogOpen: boolean) => void;
  handlePrintLabels: () => void;
  handleFetchTransactionData: () => void;
}

export const TransactionDetailBottom = ({
  transactionID,
  transaction,
  isLoading,
  handleClickReturn,
  setIsAddPointDialogOpen,
  handlePrintLabels,
  handleFetchTransactionData,
}: TransactionDetailBottomProps) => {
  const { ePosDev } = useEposDevice();
  // 各種操作メニューの開閉状態を管理するstate
  const [buttonListAnchor, setbuttonListAnchor] = useState<null | HTMLElement>(
    null,
  );
  const isOpenButtonList = Boolean(buttonListAnchor);

  const handleButtonListAnchorClick = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    setbuttonListAnchor(event.currentTarget);
  };
  const handleCloseButtonListAnchor = () => {
    setbuttonListAnchor(null);
  };

  const { store } = useStore();

  // 返品できるか
  const { accountGroup } = useAccountGroupContext();
  const canReturn = accountGroup?.create_transaction_return;

  // 銀行振込情報hooks
  const isMethodBank =
    transaction.payment_method === TransactionPaymentMethod.bank;
  const isBankChecked = useMemo(() => {
    return transaction.payment?.bank__checked;
  }, [transaction]);
  const { putPayment, bankChecked } = usePayment(isBankChecked);

  const handleBankChecked = async (checked: boolean) => {
    await putPayment(transaction.store_id, transactionID, checked);
    handleFetchTransactionData();
    handleCloseButtonListAnchor();
  };

  return (
    <>
      <SecondaryButtonWithIcon
        id="basic-button"
        aria-controls={isOpenButtonList ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={isOpenButtonList ? 'true' : undefined}
        onClick={handleButtonListAnchorClick}
        disabled={isLoading}
      >
        各種操作
      </SecondaryButtonWithIcon>

      <Menu
        id="basic-menu"
        anchorEl={buttonListAnchor}
        open={isOpenButtonList}
        onClose={() => handleCloseButtonListAnchor()}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem
          onClick={() => {
            handleCloseButtonListAnchor();
            if (ePosDev) {
              ePosDev.printReceipt(
                transactionID!,
                store.id,
                'receipt',
                false,
                undefined,
                undefined,
                true,
              );
            }
          }}
        >
          レシート (再印刷)
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCloseButtonListAnchor();
            if (ePosDev) {
              ePosDev.printReceipt(
                transactionID!,
                store.id,
                'ryoshu',
                false,
                undefined,
                undefined,
                true,
              );
            }
          }}
        >
          領収書 (再印刷)
        </MenuItem>
        {/* ここから下は返品した取引だと表示されない */}
        <>
          {canReturn && (
            <MenuItem
              onClick={() => {
                handleCloseButtonListAnchor();
                handleClickReturn();
              }}
            >
              返品
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              handleCloseButtonListAnchor();
              if (!transaction) return;
              setIsAddPointDialogOpen(true);
            }}
          >
            ポイント付与
          </MenuItem>
          {isMethodBank &&
            (bankChecked ? (
              <MenuItem onClick={() => handleBankChecked(false)}>
                振込前に戻す
              </MenuItem>
            ) : (
              <MenuItem onClick={() => handleBankChecked(true)}>
                振込完了
              </MenuItem>
            ))}
        </>
      </Menu>

      <PrimaryButtonWithIcon
        onClick={handlePrintLabels}
        disabled={isLoading}
        sx={{
          backgroundColor: 'primary.main',
        }}
      >
        選択した商品のラベルを印刷
      </PrimaryButtonWithIcon>
    </>
  );
};
