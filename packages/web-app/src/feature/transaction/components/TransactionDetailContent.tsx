import { useMemo, ChangeEvent } from 'react';
import {
  Box,
  Typography,
  Tooltip,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import { TransactionCartDetail } from '@/feature/transaction/components/TransactionCartDetail';
import { AddPointDialog } from '@/feature/transaction/components/AddPointDialog';
import { TransactionWithProductDetailsType } from '@/feature/transaction/hooks/useFetchTransactionDetails';
import { CustomerType } from '@/feature/customer/hooks/useCustomer';
import ErrorIcon from '@mui/icons-material/Error';
import InfoTooltip from '@/components/tooltips/InfoTooltip';
import { TransactionKind } from '@prisma/client';

interface TransactionDetailContentProps {
  transactionID: number | null;
  transaction: TransactionWithProductDetailsType | null;
  isLoading: boolean;
  isAddPointDialogOpen: boolean;
  handleCloseAddPointDialog: () => void;
  fetchTransactionData: () => void;
  isCheckAll: boolean;
  setIsCheckAll: (isChecked: boolean) => void;
  transactionKind: string | null;
  checkedItems: { [key: number]: boolean };
  handleCheckboxChange: (productId: number) => void;
  isShow?: boolean;
  customer?: CustomerType;
  setProductId: React.Dispatch<React.SetStateAction<number | undefined>>;
  setIsDetailModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TransactionDetailContent = ({
  transactionID,
  transaction,
  isLoading,
  isAddPointDialogOpen,
  handleCloseAddPointDialog,
  fetchTransactionData,
  isCheckAll,
  setIsCheckAll,
  transactionKind,
  checkedItems,
  handleCheckboxChange,
  isShow,
  customer,
  setProductId,
  setIsDetailModalOpen,
}: TransactionDetailContentProps) => {
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

  // 割引額合計
  const totalDiscountPrice = useMemo(() => {
    if (!transaction) return 0;

    return (
      transaction.transaction_carts.reduce((sum, cart) => {
        const unitDiscount = cart.total_discount_price ?? 0;
        const itemCount = cart.item_count ?? 0;
        return sum + unitDiscount * itemCount;
      }, 0) ?? 0
    );
  }, [transaction]);

  if (!transactionID) {
    return (
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
        <Typography variant="body1">取引をクリックして詳細を表示</Typography>
      </Box>
    );
  } else if (transaction && !isLoading) {
    // 割引・割増のメッセージを作成
    const discountMessage =
      totalDiscountPrice !== 0
        ? `${totalDiscountPrice < 0 ? '割引' : '割増'}: ${Math.abs(
            totalDiscountPrice,
          ).toLocaleString()}円`
        : '';

    const InCharge = () => {
      if (transaction && transaction.return_transaction_id) {
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Box>
              <Typography variant="caption" noWrap>
                受付
              </Typography>
              <Typography variant="body1">
                {transaction.reception_staff_account_name}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" noWrap>
                会計
              </Typography>
              <Typography variant="body1">
                {transaction.staff_account_name}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" noWrap>
                返品
              </Typography>
              <Typography variant="body1">
                {transaction.return_staff_account_name}
              </Typography>
            </Box>
          </Box>
        );
      } else if (
        transaction &&
        transaction.transaction_kind === TransactionKind.buy
      ) {
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Box>
              <Typography variant="caption" noWrap>
                受付
              </Typography>
              <Typography variant="body1">
                {transaction.reception_staff_account_name}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" noWrap>
                査定
              </Typography>
              <Typography variant="body1">
                {transaction.input_staff_account_name}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" noWrap>
                会計
              </Typography>
              <Typography variant="body1">
                {transaction.staff_account_name}
              </Typography>
            </Box>
          </Box>
        );
      } else if (
        transaction &&
        transaction.transaction_kind === TransactionKind.sell
      ) {
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Box>
              <Typography variant="caption" noWrap>
                受付
              </Typography>
              <Typography variant="body1">
                {transaction.reception_staff_account_name}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" noWrap>
                会計
              </Typography>
              <Typography variant="body1">
                {transaction.staff_account_name}
              </Typography>
            </Box>
          </Box>
        );
      }
    };

    return (
      <>
        {' '}
        <Box
          sx={{
            borderBottom: '1px solid',
            borderBottomColor: 'grey.200',
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pl: 1,
              width: '100%',
            }}
          >
            <Box>
              <Typography variant="body1">
                合計
                <Typography variant="body1" component="span">
                  {transaction.transaction_carts.reduce(
                    (total, cart) => total + (cart.item_count || 0),
                    0,
                  )}
                  点 ({transaction.transaction_carts.length}商品)
                </Typography>
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Typography variant="body1">合計金額 </Typography>
                <Typography variant="body1" component="span">
                  {transaction.original_transaction_id ? ' -' : ''}
                  {(
                    transaction.total_sale_price ?? transaction.total_price
                  ).toLocaleString()}
                  円
                </Typography>

                {/* 割引または割増がある場合のみツールチップを表示 */}
                {totalDiscountPrice !== 0 && (
                  <InfoTooltip message={discountMessage} />
                )}
                {/* 予約残金支払いの場合前金を表示 */}
                {transaction.total_reservation_price !== 0 && (
                  <Typography variant="body1" component="span">
                    うち前金
                    {Math.abs(
                      transaction.total_reservation_price,
                    ).toLocaleString()}
                    円
                  </Typography>
                )}

                <Typography variant="body1" component="span">
                  （
                  {transaction.point_amount === null
                    ? 0
                    : transaction.point_amount.toLocaleString()}
                  pt付与）
                </Typography>
                {isAmountChangeFlg && (
                  <Tooltip
                    title="手入力による金額の変更が行われています。"
                    placement="top"
                    arrow={true}
                  >
                    <ErrorIcon
                      fontSize="small"
                      sx={{
                        verticalAlign: 'middle',
                        color: 'grey.500',
                      }}
                    />
                  </Tooltip>
                )}
                {transaction.point_discount_price !== 0 && (
                  <Typography>
                    {Math.abs(
                      transaction.point_discount_price,
                    ).toLocaleString()}
                    pt使用
                  </Typography>
                )}
              </Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                direction: 'row',
                justifyContent: 'flex-end',
                width: '45%',
              }}
            >
              {InCharge()}
              {isShow && (
                <Checkbox
                  sx={{
                    '& .MuiSvgIcon-root': { color: 'primary.main' },
                  }}
                  checked={isCheckAll}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setIsCheckAll(e.target.checked);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            maxHeight: 'calc(100vh - 150px)',
            overflow: 'hidden',
          }}
        >
          {/* 取引詳細一覧 */}
          <Box
            sx={{
              flexGrow: 1, // 残りの高さを占める
              maxHeight: '400px', // カート部分の最大高さ
              overflowY: 'auto',
              borderBottom: '1px solid #ddd', // 視認性向上
              paddingBottom: '10px',
            }}
          >
            {transaction.transaction_carts.map((item, index) => (
              <TransactionCartDetail
                key={index}
                transactionKind={transactionKind}
                transactionCart={item}
                checked={checkedItems[item.product_id]}
                onCheckboxChange={() => handleCheckboxChange(item.product_id)}
                setProductId={setProductId}
                setIsDetailModalOpen={setIsDetailModalOpen}
              />
            ))}
          </Box>
          {/* 会員情報 */}
          {customer && isShow && (
            <Box
              // sx={{
              //   display: 'flex',
              //   flexDirection: 'column',
              //   alignItems: 'center',
              //   gap: 2,
              //   width: '100%',
              // }}
              sx={{
                flexShrink: 0, // スクロールの影響を受けないようにする
                padding: '8px',
                background: '#f9f9f9', // 見やすくするために背景色を変更
              }}
            >
              <Box sx={{ textAlign: 'left', width: '70%', marginTop: '16px' }}>
                <Typography sx={{ fontSize: '14px', marginBottom: '3px' }}>
                  名前：{customer.full_name}（{customer.full_name_ruby}）
                </Typography>
                <Typography sx={{ fontSize: '14px', marginBottom: '3px' }}>
                  郵便番号：{customer.zip_code}
                </Typography>
                <Typography sx={{ fontSize: '14px', marginBottom: '3px' }}>
                  住所：
                  {(customer.prefecture || '') +
                    (customer.city || '') +
                    (customer.address2 || '') +
                    (customer.building || '')}
                </Typography>
                <Typography sx={{ fontSize: '14px', marginBottom: '3px' }}>
                  電話番号：{customer.phone_number}
                </Typography>
                {/* 取得できたら表示 */}
                {/* <Typography sx={{ fontSize: '14px', marginBottom: '8px' }}>
                  本人確認書類：{}
                </Typography> */}
              </Box>
            </Box>
          )}
        </Box>
        {/* ポイント付与モーダル */}
        <AddPointDialog
          isOpen={isAddPointDialogOpen}
          handleClose={handleCloseAddPointDialog}
          transaction={transaction}
          fetchTransactionData={fetchTransactionData}
        />
      </>
    );
  } else {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          py: 2,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
};
