'use client';

import { useRef, useState } from 'react';
import { Box, TextField } from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { useStore } from '@/contexts/StoreContext';
import SaleTableCard from '@/components/cards/SaleTableCard';
import { useAlert } from '@/contexts/AlertContext';
import ReturnDetailsCard from '@/components/cards/ReturnDetailsCard';
import ReturnAccountModal from '@/components/modals/sale+purchase/return/ReturnAccountModal';
import { createClientAPI, CustomError } from '@/api/implement';
import { FaBarcode } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { TableData } from '@/types/TableData';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';

const ReturnPage = () => {
  const [data, setData] = useState<TableData[]>([]);
  const [transactionID, setTransactionID] = useState('');
  const transactionInputRef = useRef<HTMLInputElement>(null);
  const [transactionDetails, setTransactionDetails] = useState({
    subtotal: 0,
    globalDiscountPrice: 0,
    tax: 0,
    total: 0,
  });
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const { store } = useStore();
  const { data: session } = useSession();
  const staffAccountID = session?.user?.id;
  const { alertState, setAlertState } = useAlert();

  const handleScanButtonClick = () => {
    if (transactionInputRef.current) {
      transactionInputRef.current.focus();
      setTransactionID('');
    }
  };

  const handleSearchTransaction = async () => {
    const clientAPI = createClientAPI();
    if (!store?.id) {
      setAlertState({ message: '店舗情報がありません。', severity: 'error' });
      return;
    }
    const response = await clientAPI.transaction.getTransactionDetails({
      store_id: store.id,
      transaction_id: parseInt(transactionID),
    });

    if (response instanceof CustomError) {
      setAlertState({ message: response.message, severity: 'error' });
    } else {
      const fetchedData = response.transactions[0].transaction_carts.map(
        (cart, index) => ({
          no: index + 1,
          category: '',
          productName: cart.product_name,
          unitPrice: cart.unit_price ?? 0,
          quantity: cart.item_count,
          discount: cart.discount_price ?? 0,
          totalPrice:
            ((cart.unit_price ?? 0) + (cart.discount_price ?? 0)) *
              cart.item_count ?? 0,
          id: cart.product_id,
          productId: cart.product_id ?? 0,
          productCode: BigInt(0),
          stockNumber: 0,
        }),
      );
      setData(fetchedData);

      setTransactionDetails({
        subtotal: response.transactions[0].subtotal_price ?? 0,
        globalDiscountPrice: response.transactions[0].discount_price ?? 0,
        tax: response.transactions[0].tax ?? 0,
        total: response.transactions[0].total_price ?? 0,
      });
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearchTransaction();
    }
  };

  const handleConfirmReturn = async (setLoading: (value: boolean) => void) => {
    const clientAPI = createClientAPI();
    if (!store?.id) {
      console.error('店舗情報がありません。');
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      console.error('返品する商品がありません。');
      setLoading(false);
      return;
    }

    const response = await clientAPI.transaction.processReturn({
      store_id: store.id,
      transaction_id: parseInt(transactionID),
      body: {
        staff_account_id: parseInt(staffAccountID || ''),
        total_price: transactionDetails.total,
        subtotal_price: transactionDetails.subtotal,
        tax: transactionDetails.tax,
        discount_price: transactionDetails.globalDiscountPrice,
        carts: data.map((item) => ({
          product_id: item.productId,
          item_count: item.quantity,
          unit_price: item.unitPrice,
          discount_price: item.discount,
          dont_adjust_stock_number: false, // todo()
        })),
      },
    });

    if (response instanceof CustomError) {
      setAlertState({ message: response.message, severity: 'error' });
    } else {
      setAlertState({
        message: '返金処理に成功しました。',
        severity: 'success',
      });
      setData([]);
      setTransactionID('');
      setTransactionDetails({
        subtotal: 0,
        globalDiscountPrice: 0,
        tax: 0,
        total: 0,
      });
    }

    setLoading(false);
    setIsReturnModalOpen(false);
  };

  return (
    <>
      <ReturnAccountModal
        open={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onConfirm={handleConfirmReturn}
        subtotal={transactionDetails.subtotal}
        globalDiscountPrice={transactionDetails.globalDiscountPrice}
        tax={transactionDetails.tax}
        total={transactionDetails.total}
      />
      <ContainerLayout
        title="返品モード"
        actions={
          <Box
            sx={{
              display: 'flex',
              flexGrow: 1,
              justifyContent: 'flex-end',
              gap: '10px',
              alignItems: 'center',
            }}
          >
            <PrimaryButton
              sx={{ width: '230px', height: '50px', gap: '10px' }}
              onClick={handleScanButtonClick}
            >
              <FaBarcode size={20} />
              取引バーコードスキャン
            </PrimaryButton>
            <Box sx={{ display: 'flex' }}>
              <Box
                sx={{
                  display: 'flex',
                  bgcolor: 'primary.main',
                  color: 'text.secondary',
                  height: '50px',
                  padding: '6px 16px',
                  borderBottomLeftRadius: '4px',
                  borderTopLeftRadius: '4px',
                  border: '1px solid',
                  borderRight: '0',
                  borderColor: 'grey.700',
                  justifyContent: 'center',
                  textAlign: 'center',
                  alignItems: 'center',
                }}
              >
                レシートNo.
              </Box>
              <TextField
                inputRef={transactionInputRef}
                value={transactionID}
                onChange={(e) => setTransactionID(e.target.value)}
                onKeyPress={handleKeyPress}
                inputProps={{
                  style: {
                    height: '17px',
                    textAlign: 'right',
                  },
                }}
                sx={{
                  width: '200px',
                  '& .MuiInputBase-input': {
                    color: 'text.primary',
                    backgroundColor: 'grey.100',
                    borderRadius: '0px',
                    borderTop: '0',
                  },
                  '& .MuiInput-underline:before': {
                    borderBottomColor: 'grey.700',
                    borderRadius: '0px',
                  },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                    borderBottomColor: 'grey.600',
                    borderRadius: '0px',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'grey.700',
                      borderRadius: '0px',
                    },
                    '&:hover fieldset': {
                      borderColor: 'grey.600',
                      borderRadius: '0px',
                    },
                  },
                }}
              />
            </Box>
          </Box>
        }
      >
        {/* 上部エリア */}

        {/* 中央エリア */}
        <Box
          sx={{ display: 'flex', gap: '20px', flexGrow: 1, overflow: 'auto' }}
        >
          <Box
            sx={{
              flexGrow: 1,
              overflow: 'auto',
              height: '100%',
            }}
          >
            <SaleTableCard data={data} />
          </Box>
          <Box sx={{ width: '300px', flexShrink: 0 }}>
            <ReturnDetailsCard
              subtotal={transactionDetails.subtotal}
              globalDiscountPrice={transactionDetails.globalDiscountPrice}
              tax={transactionDetails.tax}
              total={transactionDetails.total}
              handleOpenReturnModal={() => {
                setIsReturnModalOpen(true);
              }}
            />
          </Box>
        </Box>
      </ContainerLayout>
    </>
  );
};

export default ReturnPage;
