import { createClientAPI, CustomError } from '@/api/implement';
import {
  MarketFluctuationsItem,
  SearchParams,
} from '@/feature/marketFluctuationsModal/type';
import { useAlert } from '@/contexts/AlertContext';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';

interface MatchMasterPriceToMarketPriceProps {
  open: boolean;
  onClose: () => void;
  isLoadingMatchMasterPrice: boolean;
  setIsLoadingMatchMasterPrice: Dispatch<SetStateAction<boolean>>;
  marketPriceGapItems: MarketFluctuationsItem[];
  storeId: number;
  searchParams: SearchParams;
  fetchMarketPriceGapItems: (storeID: number, take?: number) => Promise<void>;
  setHasChange: (value: SetStateAction<boolean>) => void;
}

export const MatchMasterPriceToMarketPriceModal = ({
  open,
  onClose,
  isLoadingMatchMasterPrice,
  setIsLoadingMatchMasterPrice,
  marketPriceGapItems,
  storeId,
  searchParams,
  fetchMarketPriceGapItems,
  setHasChange,
}: MatchMasterPriceToMarketPriceProps) => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();

  const adjustItemsWithMarketPriceGap = useCallback(async () => {
    setIsLoadingMatchMasterPrice(true);
    const res = await clientAPI.store.adjustItemsWithMarketPriceGap({
      storeID: storeId,
      query: {
        genreId: searchParams.genreId,
        categoryId: searchParams.categoryId,
      },
      body: { adjustAll: true },
    });
    setIsLoadingMatchMasterPrice(false);
    if (res instanceof CustomError) {
      setAlertState({
        message: `${res.status}:${res.message}`,
        severity: 'error',
      });
      return;
    }
    setAlertState({
      message: `販売価格を相場価格に一括変更する処理を開始しました`,
      severity: 'success',
    });
    await fetchMarketPriceGapItems(storeId);
    setHasChange(true);
  }, [
    clientAPI.store,
    fetchMarketPriceGapItems,
    searchParams.categoryId,
    searchParams.genreId,
    setAlertState,
    setHasChange,
    setIsLoadingMatchMasterPrice,
    storeId,
  ]);

  const onPrimaryButtonClick = () => {
    adjustItemsWithMarketPriceGap();
    onClose();
  };

  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      title="相場価格に合わせる"
      message={`以下${marketPriceGapItems.length}商品の販売価格を相場価格に変更します。\\n買取価格は変更されないので注意してください。`}
      confirmButtonText="価格を変更する"
      confirmButtonLoading={isLoadingMatchMasterPrice}
      onConfirm={onPrimaryButtonClick}
      content={
        <Box sx={{ border: 1, my: 2 }}>
          <TableContainer
            sx={{
              maxHeight: '400px',
              overflowY: 'auto',
              m: 1,
              width: 'auto',
            }}
          >
            <Table size="small">
              <TableBody>
                {marketPriceGapItems.map((item: MarketFluctuationsItem) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Typography>{item.display_name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>
                        {item.expansion} {item.cardnumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>{item.rarity}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      }
    />
  );
};
