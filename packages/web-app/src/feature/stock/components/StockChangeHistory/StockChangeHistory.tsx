import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { StockChangeHistoryCard } from '@/feature/stock/components/StockChangeHistory/StockChangeHistoryCard';
import { useChangeHistory } from '@/feature/stock/changeHistory/useChangeHistory';

export function StockChangeHistory({
  productId,
}: {
  productId: number | undefined;
}) {
  // 在庫履歴
  const { histories, setParams } = useChangeHistory();

  useEffect(() => {
    if (productId) {
      setParams({
        productId: productId,
      });
    }
  }, [productId, setParams]);

  return (
    <Box>
      {histories?.length > 0 ? (
        histories.map((history) => (
          <StockChangeHistoryCard key={history.id} history={history} />
        ))
      ) : (
        <Typography
          sx={{
            padding: '10px',
          }}
          variant="body1"
          textAlign="center"
        >
          履歴データ取得中...
        </Typography>
      )}
    </Box>
  );
}
