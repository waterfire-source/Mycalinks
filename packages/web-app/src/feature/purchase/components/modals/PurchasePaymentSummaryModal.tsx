import React, { useEffect, useState } from 'react';
import { Box, Typography, Stack, CircularProgress } from '@mui/material';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { CustomModalWithHeader } from '@/components/modals/CustomModalWithHeader';
import { useRouter } from 'next/navigation';
import { useEposDevice } from '@/contexts/EposDeviceContext';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { usePurchaseCartContext } from '@/contexts/PurchaseCartContext';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { useLabelPrinterHistory } from '@/contexts/LabelPrinterContext';
import { PATH } from '@/constants/paths';
import { ItemAPIRes } from '@/api/frontend/item/api';
import { useStore } from '@/contexts/StoreContext';

interface Props {
  open: boolean;
  onClose: () => void;
  transactionId: number;
  zeroPriceItems: ItemAPIRes['getAll']['items'];
}

// ラベル印刷の状況
export type labelPrintingStatusType = {
  status: 'printing' | 'error' | 'printed';
  previewSrc: string;
};

export const PurchasePaymentSummaryModal: React.FC<Props> = ({
  open,
  onClose,
  transactionId,
  zeroPriceItems,
}) => {
  const router = useRouter();
  const { ePosDev } = useEposDevice();
  const { state } = usePurchaseCartContext();
  const { store } = useStore();

  const handlePrintReceipt = () => {
    if (ePosDev) {
      ePosDev.printReceipt(transactionId, store.id);
    }
  };

  const handlePrintRyoshu = () => {
    if (ePosDev) {
      ePosDev.printReceipt(transactionId, store.id, 'ryoshu');
    }
  };

  const [labelPrintingStatus, setLabelPrintingStatus] =
    useState<labelPrintingStatusType>({ status: 'printed', previewSrc: '' });

  const { pushQueue: pushLabelPrinterQueue } = useLabelPrinterHistory();

  // ラベル印刷関連のハンドラ
  const printLabels = () => {
    // 自動印刷設定を確認
    const autoPrintLabelEnabled = localStorage.getItem(
      'purchase_auto_print_label_enabled',
    );
    const isAutoPrintEnabled =
      autoPrintLabelEnabled === null ? true : autoPrintLabelEnabled === 'true';

    // 自動印刷がOFFの場合は印刷をスキップ
    if (!isAutoPrintEnabled) {
      setLabelPrintingStatus({
        status: 'printed',
        previewSrc: labelPrintingStatus.previewSrc,
      });
      return;
    }

    try {
      const targetProducts = state.carts.filter((cart) => {
        if (!cart.isBuyOnly) {
          if (
            !zeroPriceItems.some((item) => {
              return item.products.some(
                (product) => product.id == cart.productId,
              );
            })
          ) {
            return true;
          }
        }
        return false;
      });

      let remainingItemCount = targetProducts.reduce((acc, curr) => {
        return (
          acc +
          curr.variants.reduce((acc, curr) => {
            return acc + curr.itemCount;
          }, 0)
        );
      }, 0);

      for (const eachProduct of targetProducts) {
        setLabelPrintingStatus({
          status: 'printing',
          previewSrc: labelPrintingStatus.previewSrc,
        });

        let currentStockNumber = eachProduct.stockNumber;

        //すべてプリント
        for (const variant of eachProduct.variants) {
          // itemCountの数だけラベルをプリント
          for (let count = 0; count < variant.itemCount; count++) {
            remainingItemCount--;

            pushLabelPrinterQueue({
              template: 'product',
              data: eachProduct.productId,
              meta: {
                isFirstStock: currentStockNumber <= 0,
                isLastItem: !remainingItemCount,
              },
            });

            currentStockNumber++;
          }
        }
      }
    } catch {
      setLabelPrintingStatus({
        status: 'error',
        previewSrc: labelPrintingStatus.previewSrc,
      });
    }
  };

  useEffect(() => {
    printLabels();
  }, []);

  const handleFinishTransaction = () => {
    router.replace(PATH.PURCHASE);
    // resetCart();
    if (ePosDev && ePosDev.devices.display) {
      ePosDev.resetDisplay();
    }
    onClose();
  };

  return (
    <CustomModalWithHeader
      open={open}
      // 取引終了を押さない限りモーダルが閉じないようにするため。
      onClose={() => {}}
      isShowCloseIcon={false}
      title="お会計完了"
      width="30%"
      dataTestId="transaction-completion-modal"
    >
      <Stack flexDirection="column" gap={2}>
        <Box
          display="flex"
          justifyContent="space-between"
          mt={1}
          mb={2}
          data-testid="completion-total-container"
        >
          <Typography variant="body1">合計金額</Typography>
          <Typography variant="body1" data-testid="completion-total-amount">
            {state.totalPrice.toLocaleString()}円
          </Typography>
        </Box>

        {/* ラベルの印刷状況を示す */}
        {labelPrintingStatus != undefined && (
          <>
            <Box
              display="flex"
              justifyContent="flex-start"
              alignItems="center"
              gap={1}
            >
              {labelPrintingStatus.status == 'printing' ? (
                <>
                  <Typography>
                    {!labelPrintingStatus.previewSrc
                      ? 'ラベルを印刷中です'
                      : '次のラベルを印刷中です'}
                  </Typography>
                  <CircularProgress size={15} />
                </>
              ) : labelPrintingStatus.status == 'error' ? (
                <>
                  <Typography>ラベル印刷ができませんでした</Typography>
                  <ReportProblemIcon color="error" />
                </>
              ) : labelPrintingStatus.status == 'printed' ? (
                <>
                  <Typography>ラベル印刷が完了しました</Typography>
                </>
              ) : null}
            </Box>
            {labelPrintingStatus.previewSrc && (
              <Box display="flex" justifyContent="center">
                <img src={labelPrintingStatus.previewSrc} />
              </Box>
            )}
          </>
        )}

        <Stack
          flexDirection="row"
          sx={{ width: '100%', height: '30px' }}
          gap={2}
        >
          <SecondaryButtonWithIcon
            sx={{ width: '50%', height: '100%' }}
            onClick={handlePrintReceipt}
            data-testid="completion-receipt-button"
          >
            レシート印刷
          </SecondaryButtonWithIcon>
          <SecondaryButtonWithIcon
            sx={{ width: '50%', height: '100%' }}
            onClick={handlePrintRyoshu}
            data-testid="completion-invoice-button"
          >
            領収書印刷
          </SecondaryButtonWithIcon>
        </Stack>
        <SecondaryButtonWithIcon
          sx={{ width: '100%', height: '30px' }}
          onClick={() => printLabels()}
          data-testid="completion-label-button"
        >
          ラベル再印刷
        </SecondaryButtonWithIcon>
        <PrimaryButtonWithIcon
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleFinishTransaction}
          sx={{ height: '50px' }}
          data-testid="completion-finish-button"
        >
          取引終了
        </PrimaryButtonWithIcon>
      </Stack>
    </CustomModalWithHeader>
  );
};
