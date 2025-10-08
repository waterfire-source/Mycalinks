import {
  Box,
  Modal,
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { OrderInfo } from '@/app/auth/(dashboard)/ec/list/types/OrderInfo';
import { useState, useEffect } from 'react';
import { useOrderComplete } from '@/app/auth/(dashboard)/ec/list/hooks/useOrderComplete';
import { EcShippingCompany } from '@prisma/client';
import { useDeliveryMethod } from '@/feature/ec/setting/delivery/hooks/useDeliveryMethod';

interface ECOrderCompleteModalProps {
  open: boolean;
  onClose: () => void;
  orderInfo: OrderInfo;
  storeId: number;
  closeAllModals: () => void;
  onComplete: () => void;
  handleTableReset: () => void;
}

export const ECOrderCompleteModal = ({
  open,
  onClose,
  orderInfo,
  storeId,
  closeAllModals,
  onComplete,
  handleTableReset,
}: ECOrderCompleteModalProps) => {
  const [deliveryCompany, setDeliveryCompany] = useState<EcShippingCompany>(
    EcShippingCompany.SAGAWA,
  );
  const [trackingNumber, setTrackingNumber] = useState<string | undefined>(
    undefined,
  );
  const [shippingMethod, setShippingMethod] = useState<any>(null);

  const { fetchDeliveryMethodById } = useDeliveryMethod();

  // 配送方法の情報を取得
  useEffect(() => {
    const fetchShippingMethod = async () => {
      if (open && orderInfo.deliveryMethod.id) {
        try {
          const response = await fetchDeliveryMethodById(
            storeId,
            true, // includesFeeDefs
            orderInfo.deliveryMethod.id,
          );
          if (response?.shippingMethods?.[0]) {
            setShippingMethod(response.shippingMethods[0]);
          }
        } catch (error) {
          console.error('配送方法の取得に失敗しました:', error);
        }
      }
    };

    fetchShippingMethod();
  }, [open]);

  // モーダルが閉じられたときに入力値をリセット
  useEffect(() => {
    if (!open) {
      setDeliveryCompany(EcShippingCompany.SAGAWA);
      setTrackingNumber('');
      setShippingMethod(null);
    }
  }, [open]);

  const { completeOrder } = useOrderComplete({
    storeId: storeId,
  });

  const handleCompleteOrder = async () => {
    try {
      await completeOrder({
        orderId: orderInfo.orderId,
        shippingTrackingCode: shippingMethod?.enabled_tracking
          ? trackingNumber
          : undefined,
        shippingCompany: deliveryCompany,
      });
      await onComplete();
      await handleTableReset();
      closeAllModals();
    } catch (error) {
      // エラーが発生した場合はモーダルを閉じない
      console.error('発送完了処理でエラーが発生しました:', error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 24,
        }}
      >
        <Box sx={{ pt: 4, pb: 2, px: 4 }}>
          <Typography variant="h1" sx={{ color: 'rgba(184,42,42,1)' }}>
            発送完了確認
          </Typography>
          <Typography sx={{ pt: 2, pb: 3 }}>
            お客様に発送完了通知が送信されます。これ以降、店舗側での注文キャンセルはできません。
            <br />
            送り先や商品を再度ご確認ください。
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              運送会社
            </Typography>
            <ToggleButtonGroup
              value={deliveryCompany}
              exclusive
              onChange={(_, value) => value && setDeliveryCompany(value)}
              sx={{
                mb: 1,
                gap: 1,
                '& .MuiToggleButton-root': {
                  border: '1px solid #E0E0E0',
                  borderRadius: '4px !important',
                  bgcolor: '#F5F5F5',
                  color: '#666666',
                  padding: '4px 16px',
                  minHeight: '32px',
                  '&:hover': {
                    bgcolor: '#EEEEEE',
                  },
                  '&.Mui-selected': {
                    bgcolor: '#666666 !important',
                    color: '#FFFFFF !important',
                    '&:hover': {
                      bgcolor: '#555555 !important',
                    },
                  },
                },
              }}
            >
              <ToggleButton value={EcShippingCompany.SAGAWA}>
                佐川急便
                {deliveryCompany === EcShippingCompany.SAGAWA && (
                  <Box
                    sx={{
                      ml: 1,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: '#666666',
                      border: '1px solid white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckIcon sx={{ fontSize: 12, color: 'white' }} />
                  </Box>
                )}
              </ToggleButton>
              <ToggleButton value={EcShippingCompany.KURONEKO}>
                ヤマト運輸
                {deliveryCompany === EcShippingCompany.KURONEKO && (
                  <Box
                    sx={{
                      ml: 1,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: '#666666',
                      border: '1px solid white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckIcon sx={{ fontSize: 12, color: 'white' }} />
                  </Box>
                )}
              </ToggleButton>
              <ToggleButton value={EcShippingCompany.YUBIN}>
                郵便
                {deliveryCompany === EcShippingCompany.YUBIN && (
                  <Box
                    sx={{
                      ml: 1,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: '#666666',
                      border: '1px solid white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckIcon sx={{ fontSize: 12, color: 'white' }} />
                  </Box>
                )}
              </ToggleButton>
              <ToggleButton value={EcShippingCompany.OTHER}>
                その他
                {deliveryCompany === EcShippingCompany.OTHER && (
                  <Box
                    sx={{
                      ml: 1,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: '#666666',
                      border: '1px solid white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckIcon sx={{ fontSize: 12, color: 'white' }} />
                  </Box>
                )}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* 配送方法でenabled_trackingがtrueの場合のみ伝票番号フィールドを表示 */}
          {shippingMethod?.enabled_tracking && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                伝票番号
              </Typography>
              <TextField
                fullWidth
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder=""
                size="small"
              />
            </Box>
          )}
        </Box>

        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
          }}
        >
          <PrimaryButton variant="text" onClick={onClose}>
            注文を確認する
          </PrimaryButton>
          <PrimaryButton
            variant="contained"
            color="error"
            onClick={handleCompleteOrder}
            disabled={shippingMethod?.enabled_tracking && !trackingNumber}
          >
            発送完了
          </PrimaryButton>
        </Box>
      </Box>
    </Modal>
  );
};
