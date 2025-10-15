'use client';

import { useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import { useChangeHistory } from '@/feature/stock/changeHistory/useChangeHistory';
import { customDayjs } from 'common';

export function MobileChangeHistoryListModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { histories, setParams } = useChangeHistory();

  useEffect(() => {
    setParams({
      sourceKind: 'product',
    });
  }, [setParams]);

  const handleClose = () => setIsOpen(false);

  const extractReason = (description: string | null) => {
    if (!description) return '理由が指定されていません';
    const reasonIndex = description.indexOf('理由：');
    return reasonIndex !== -1
      ? description.slice(reasonIndex + 3)
      : '理由が指定されていません';
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} fullWidth>
      <DialogTitle
        sx={{
          textAlign: 'center',
          backgroundColor: 'grey.700',
          color: 'text.secondary',
        }}
      >
        在庫編集履歴
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          {histories?.length > 0 ? (
            histories.map((history, index) => (
              <Box
                key={index}
                sx={{ borderBottom: '1px solid grey', paddingY: 1 }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Image
                    src={history.product.image_url || ''}
                    alt={history.product.display_name}
                    width={80}
                    height={100}
                    style={{ objectFit: 'contain' }}
                  />
                  <Stack>
                    <Typography variant="subtitle1">
                      {history.product.display_name}
                    </Typography>
                    <Typography variant="body2">
                      変更日時:{' '}
                      {customDayjs(history.datetime)
                        .tz()
                        .format('YYYY/MM/DD HH:mm:ss')}
                    </Typography>

                    <Typography variant="body2">
                      変更内容:{' '}
                      {history.item_count > 0
                        ? `${
                            (history.result_stock_number || 0) -
                            history.item_count
                          } → ${history.result_stock_number}`
                        : `${
                            (history.result_stock_number || 0) +
                            Math.abs(history.item_count)
                          } → ${history.result_stock_number}`}
                    </Typography>
                    <Typography variant="body2">
                      仕入れ値: {history.unit_price.toLocaleString()}円
                    </Typography>
                    <Typography variant="body2">
                      理由: {extractReason(history.description)}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            ))
          ) : (
            <Typography variant="body1" textAlign="center">
              履歴データがありません。
            </Typography>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
