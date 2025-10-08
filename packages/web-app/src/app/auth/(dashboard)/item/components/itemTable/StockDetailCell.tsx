import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';
import { getConditionDisplayName } from '@/feature/products/utils/conditionDisplayName';
import { InfoOutlined } from '@mui/icons-material';
import { Box, ClickAwayListener, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';

interface Props {
  products: BackendItemAPI[0]['response']['200']['items'][0]['products'];
  productsStockNumber: number;
  infiniteStock: boolean;
}

export const StockDetailCell = ({
  products,
  productsStockNumber,
  infiniteStock,
}: Props) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  // `products` から `condition_option_display_name : stock_number` のリストを作成
  const stockDetails = products?.length
    ? products.map((product) => (
        <Typography
          key={product.id}
          variant="caption"
          sx={{ display: 'block' }}
        >
          {`${getConditionDisplayName(product)} : ${
            infiniteStock ? '∞' : product.stock_number
          }`}
        </Typography>
      ))
    : [
        <Typography key="no-stock" variant="caption">
          在庫情報なし
        </Typography>,
      ];

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Typography>{infiniteStock ? '∞' : productsStockNumber}</Typography>

      {/* 在庫詳細を表示する Tooltip */}
      {!infiniteStock &&
      Number.isFinite(productsStockNumber) &&
      productsStockNumber > 0 ? (
        <ClickAwayListener onClickAway={() => setTooltipOpen(false)}>
          <Tooltip
            title={<Box>{stockDetails}</Box>}
            arrow
            open={tooltipOpen}
            onClose={() => setTooltipOpen(false)}
            disableFocusListener
            disableHoverListener
            disableTouchListener
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 15,
                height: 15,
                borderRadius: '50%',
                backgroundColor: (theme) => theme.palette.grey[400],
                color: 'white',
                fontSize: 12,
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
              onClick={(e) => {
                e.stopPropagation(); // DataGridの行選択を防ぐ
                setTooltipOpen((prev) => !prev);
              }}
            >
              <InfoOutlined fontSize="small" />
            </Box>
          </Tooltip>
        </ClickAwayListener>
      ) : null}
    </Box>
  );
};
