import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import TertiaryButtonWithIcon from '@/components/buttons/TertiaryButtonWithIcon';
import { useStore } from '@/contexts/StoreContext';
import { usePostAdjustStock } from '@/feature/products/hooks/usePostAdjustStock';
import { useUpdateProduct } from '@/feature/products/hooks/useUpdateProduct';
import { Box, Modal, Typography, TextField } from '@mui/material';
import { Product } from '@prisma/client';
import { Dispatch, SetStateAction, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useEffect } from 'react';

interface Props {
  detailData: BackendProductAPI[0]['response']['200']['products'][0][];
  open: boolean;
  onClose: () => void;
  formData?: Partial<Product>;
  fetchProducts: () => Promise<void>;
  fetchAllProducts?: () => Promise<void>;
  setStockNumber: Dispatch<SetStateAction<number | ''>>;
  setIsStockChange: React.Dispatch<React.SetStateAction<boolean>>;
  isResetSpecificPrice: boolean;
  setIsResetSpecificPrice: React.Dispatch<React.SetStateAction<boolean>>;
}
//在庫数を変換確認モーダル
export const StockChangeSaveModal = ({
  open,
  onClose,
  detailData,
  formData,
  fetchProducts,
  fetchAllProducts,
  setStockNumber,
  setIsStockChange,
  isResetSpecificPrice,
  setIsResetSpecificPrice,
}: Props) => {
  const { store } = useStore();
  const { updateProduct } = useUpdateProduct();
  const { postAdjustStock } = usePostAdjustStock();
  const [wholesalePrice, setWholesalePrice] = useState<number>(0);
  const [reason, setReason] = useState<string>(''); // 変更理由の状態を追加
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true); // ボタンの状態管理
  const [isStockDecreasing, setIsStockDecreasing] = useState<boolean>(false);

  // 在庫数の変化を監視
  useEffect(() => {
    const stockNumber = detailData[0]?.stock_number ?? 0;
    const formStockNumber = formData?.stock_number ?? 0;
    setIsStockDecreasing(stockNumber > formStockNumber);
  }, [detailData, formData]);

  // ボタンの活性/非活性を監視
  useEffect(() => {
    setIsButtonDisabled(
      (isStockDecreasing &&
        (wholesalePrice === null || wholesalePrice === undefined)) ||
        reason.trim() === '',
    );
  }, [wholesalePrice, reason, isStockDecreasing]);

  const handleUpdate = async () => {
    const stockNumber = detailData[0]?.stock_number ?? 0;
    const formStockNumber = formData?.stock_number ?? 0;

    let changeCount = 0;
    if (stockNumber > formStockNumber) {
      changeCount = formStockNumber - stockNumber; // 減数
    } else if (stockNumber < formStockNumber) {
      changeCount = formStockNumber - stockNumber; // 増数
    }

    // 在庫の更新処理
    await postAdjustStock(store.id, detailData[0].id, {
      changeCount: changeCount,
      wholesalePrice: wholesalePrice,
      reason: reason,
    });

    // 商品情報の更新処理
    await updateProduct(store.id, detailData[0].id, {
      displayName: formData?.display_name ?? undefined,
      readonlyProductCode: formData?.readonly_product_code ?? undefined,
      specificSellPrice: isResetSpecificPrice
        ? null
        : formData?.specific_sell_price ?? undefined,
      specificBuyPrice: isResetSpecificPrice
        ? null
        : formData?.specific_buy_price ?? undefined,
      retailPrice: formData?.retail_price ?? undefined,
    });
    // 更新処理をかけたら、在庫数を0にする
    setStockNumber('');
    setIsStockChange(false);
    // 特別価格リセットのフラグを元に戻す
    setIsResetSpecificPrice(false);

    fetchProducts();
    if (fetchAllProducts) {
      fetchAllProducts();
    }
    // モーダルを閉じる
    onClose();
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReason(e.target.value);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 500,
          bgcolor: 'background.paper',
          borderRadius: '8px',
          boxShadow: 24,
          p: 3,
        }}
      >
        {/* モーダルヘッダー */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h2" sx={{ color: 'primary.main' }}>
            在庫数を修正
          </Typography>
          <FaTimes
            size={20}
            onClick={onClose}
            style={{
              color: 'black',
              cursor: 'pointer',
              borderRadius: '50%',
              padding: '5px',
            }}
          />
        </Box>

        {/* 在庫数 */}
        <Typography variant="body1" sx={{ mb: 2 }}>
          在庫数:{' '}
          <span style={{ fontWeight: 'bold' }}>
            {detailData[0]?.stock_number || 0} → {formData?.stock_number}
          </span>
        </Typography>

        {/* 仕入れ値 */}
        {!isStockDecreasing && (
          <Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography>仕入れ値</Typography>
              <Typography
                variant="caption"
                sx={{
                  backgroundColor: 'grey.300',
                  color: 'black',
                  pr: 0.5,
                  pl: 0.5,
                  borderRadius: '2px',
                  lineHeight: '1.5',
                }}
              >
                必須
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              <TextField
                size="small"
                sx={{ width: '120px' }}
                onChange={(event) =>
                  setWholesalePrice(Number(event.target.value))
                }
              />
              <Typography>円</Typography>
            </Box>
          </Box>
        )}

        {/* 変更理由 */}
        <Box sx={{ mb: 3, mt: 2 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography>変更理由</Typography>
            <Typography
              variant="caption"
              sx={{
                backgroundColor: 'grey.300',
                color: 'black',
                borderRadius: '2px',
                pr: 0.5,
                pl: 0.5,
                lineHeight: '1.5',
              }}
            >
              必須
            </Typography>
          </Box>
          <TextField
            multiline
            rows={3}
            fullWidth
            // value={reason}
            onChange={handleReasonChange}
          />
        </Box>

        {/* ボタンエリア */}
        <Box display="flex" justifyContent="end" gap={2}>
          <TertiaryButtonWithIcon onClick={onClose}>
            キャンセル
          </TertiaryButtonWithIcon>
          <PrimaryButtonWithIcon
            onClick={handleUpdate}
            disabled={isButtonDisabled}
          >
            修正
          </PrimaryButtonWithIcon>
        </Box>
      </Box>
    </Modal>
  );
};
