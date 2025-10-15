import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { TableRowData } from '@/components/cards/ChangeStockTableCard'; // ※インポート先を共通化して他の不ファイルからも参照したい
import { ItemText } from '@/feature/item/components/ItemText';

interface ProductData {
  display_name: string;
  displayNameWithMeta: string;
  product_code: string;
  stock_number: number;
}

interface ChangeStockConfirmModalProps {
  productData: ProductData;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  changes: TableRowData[];
}

const ChangeStockConfirmModal: React.FC<ChangeStockConfirmModalProps> = ({
  productData,
  open,
  onClose,
  onConfirm,
  changes,
}) => {
  // console.log('productData: ', productData, 'changes: ', changes);

  if (!productData) {
    return null;
  }

  const totalChangedStock = changes.reduce(
    (acc, change) => acc + parseInt((change.currentStock ?? 0).toString(), 10),
    0,
  );
  const remainingStock =
    parseInt(productData.stock_number.toString(), 10) - totalChangedStock;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: 600,
          bgcolor: 'background.paper',
          borderRadius: '8px',
          boxShadow: 24,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px',
            backgroundColor: 'grey.700',
            borderRadius: '4px 4px 0 0',
            color: 'text.secondary',
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: 'common.white', flexGrow: 1, textAlign: 'center' }}
          >
            在庫内容変更
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'common.white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ p: 4 }}>
          <Typography variant="h6" align="center" gutterBottom>
            以下の通り在庫内容を変更します
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ width: '45%' }}>
              <Typography variant="subtitle1">変更前</Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <ItemText
                  sx={{ wordBreak: 'break-all' }}
                  text={`商品名: ${productData.displayNameWithMeta}`}
                />
                <Typography variant="body2">
                  型番: {productData.product_code}
                </Typography>
                <Typography variant="body2">
                  総変更数(残数): {totalChangedStock} ({remainingStock})
                </Typography>
              </Paper>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ width: '45%' }}>
              <Typography variant="subtitle1">変更後</Typography>
              <Paper
                variant="outlined"
                sx={{ p: 2, mb: 2, maxHeight: '200px', overflow: 'auto' }}
              >
                {changes.map((change, index) => {
                  console.log(`Change ${index}:`, change); // changenoの内容をコンソールに出力
                  return (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 'bold' }}
                      >
                        変更{index + 1}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ wordBreak: 'break-all' }}
                      >
                        商品名: {change.displayNameWithMeta}
                      </Typography>
                      <Typography variant="body2">
                        型番: {change.product_code?.toString()}
                      </Typography>
                      <Typography variant="body2">
                        変更数(変更後総数):{' '}
                        {parseInt((change.currentStock ?? 0).toString(), 10)} (
                        {parseInt((change.stockNumber || 0).toString(), 10) +
                          parseInt((change.currentStock ?? 0).toString(), 10)}
                        )
                      </Typography>
                      <Typography variant="body2">
                        備考: {change.remarks}
                      </Typography>
                    </Box>
                  );
                })}
              </Paper>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button variant="contained" color="primary" onClick={onConfirm}>
              変更確定
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default ChangeStockConfirmModal;
