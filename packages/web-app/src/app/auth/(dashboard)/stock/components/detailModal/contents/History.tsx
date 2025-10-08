import { useState, useMemo, useEffect } from 'react';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { DetailComponent } from '@/app/auth/(dashboard)/stock/components/detailModal/DetailComponent';
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  TextField,
} from '@mui/material';
import {
  format,
  subMonths,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
  isValid,
  min as minDate,
} from 'date-fns';
import { CaptionToolTip } from '@/components/tooltips/CaptionToolTip';
import { ProductChangeHistory } from '@/feature/stock/changeHistory/useChangeHistory';
import { customDayjs } from 'common';

interface Props {
  detailData: BackendProductAPI[0]['response']['200']['products'][0][];
  fetchProducts: () => Promise<void>;
  histories: ProductChangeHistory[];
  fetchAllProducts?: () => Promise<void>;
  onCancelSpecialPrice?: () => void;
  loading?: boolean;
}

export const History = ({
  detailData,
  histories,
  fetchProducts,
  fetchAllProducts,
  onCancelSpecialPrice,
  loading,
}: Props) => {
  const sourceKindMapping: { [key: string]: string } = {
    transaction_sell: '販売',
    transaction_buy: '買取',
    transaction_sell_return: '販売(返品)',
    transaction_buy_return: '買取(返品)',
    product: '在庫更新',
    stocking: '仕入れ',
    stocking_rollback: '仕入れ取り消し',
    loss: 'ロス',
    loss_rollback: 'ロス取り消し',
    bundle: 'バンドル',
    bundle_release: 'バンドル解体',
    original_pack: 'オリパ・福袋',
    original_pack_release: 'オリパ・福袋解体',
    pack_opening: 'パック開封',
    pack_opening_unregister: 'パック開封',
    pack_opening_rollback: 'パック開封取り消し',
    pack_opening_unregister_rollback: 'パック開封未登録取り消し',
    box_opening: 'ボックス解体',
    box_create: 'パックからボックス作成',
    carton_create: 'カートン作成',
    carton_opening: 'カートン開封',
    appraisal_create: '鑑定',
    appraisal_return: '鑑定返却',
    transfer: '在庫転移',
    ec_sell: 'EC販売',
    ec_sell_return: 'EC販売返品',
    consignment_create: '委託',
    consignment_return: '委託返却',
    store_shipment: '店舗間在庫移動',
    store_shipment_rollback: '店舗間在庫移動取り消し',
    location: 'ロケーション',
    location_release: 'ロケーション解体',
  };

  // 選択された処理フィルター
  const [selectedProcess, setSelectedProcess] = useState<string>('all');

  const [startDate, setStartDate] = useState<string>('');

  const [endDate, setEndDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd'),
  );

  const minSelectableDate = useMemo(() => {
    const validDates = histories
      .filter((history) => history.product?.created_at)
      .map((history) => {
        const createdAt = history.product.created_at;
        return createdAt instanceof Date ? createdAt : parseISO(createdAt);
      })
      .filter((date) => isValid(date));

    return validDates.length > 0
      ? format(minDate(validDates), 'yyyy-MM-dd')
      : null;
  }, [histories]);

  useEffect(() => {
    const defaultStartDate =
      minSelectableDate ?? format(subMonths(new Date(), 1), 'yyyy-MM-dd');
    setStartDate(defaultStartDate);
  }, [minSelectableDate]);

  // フィルタリングした履歴データ
  const filteredHistories = useMemo(() => {
    let tempHistories =
      selectedProcess === 'all'
        ? histories
        : histories.filter(
            (history) => history.source_kind === selectedProcess,
          );

    const parsedStartDate = parseISO(startDate);
    const parsedEndDate = parseISO(endDate);

    if (isValid(parsedStartDate) && isValid(parsedEndDate)) {
      tempHistories = tempHistories.filter((history) => {
        try {
          const datetime = history.datetime;
          const historyDate =
            datetime instanceof Date ? datetime : parseISO(datetime);
          return (
            isValid(historyDate) &&
            isWithinInterval(historyDate, {
              start: startOfDay(parsedStartDate),
              end: endOfDay(parsedEndDate),
            })
          );
        } catch (e) {
          return false;
        }
      });
    }
    return tempHistories;
  }, [histories, selectedProcess, startDate, endDate]);

  const { totalSalesAmount, totalPurchaseAmount, totalStockChange } =
    useMemo(() => {
      return filteredHistories.reduce(
        (acc, history) => {
          if (history.source_kind === 'transaction_sell') {
            acc.totalSalesAmount +=
              history.unit_price * Math.abs(history.item_count);
          } else if (history.source_kind === 'transaction_buy') {
            acc.totalPurchaseAmount += history.unit_price * history.item_count;
          }
          acc.totalStockChange += history.item_count;
          return acc;
        },
        {
          totalSalesAmount: 0,
          totalPurchaseAmount: 0,
          totalStockChange: 0,
        },
      );
    }, [filteredHistories]);

  const stockChangeText = (history: ProductChangeHistory) => {
    if (
      detailData &&
      detailData.length > 0 &&
      detailData[0].item_infinite_stock
    ) {
      return `∞ → ∞`;
    } else if (history.item_count > 0) {
      return `${(history.result_stock_number || 0) - history.item_count} → ${
        history.result_stock_number
      }`;
    } else {
      return `${
        (history.result_stock_number || 0) + Math.abs(history.item_count)
      } → ${history.result_stock_number}`;
    }
  };

  return (
    <Grid container spacing={1} sx={{ height: '100%' }}>
      <Grid item xs={4} sx={{ height: '100%' }}>
        <DetailComponent
          detailData={detailData}
          fetchProducts={fetchProducts}
          onCancelSpecialPrice={onCancelSpecialPrice}
          loading={loading}
          fetchAllProducts={fetchAllProducts}
        />
      </Grid>
      <Grid item xs={8} sx={{ height: '100%' }}>
        <Box
          sx={{ borderTop: '4px solid #b82a2a', bgcolor: 'white', mt: 2, p: 1 }}
        >
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2, pt: 2 }}>
            <Grid item>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel
                  id="process-select-label"
                  sx={{
                    color: 'black',
                  }}
                >
                  処理
                </InputLabel>
                <Select
                  labelId="process-select-label"
                  id="process-select"
                  value={selectedProcess}
                  onChange={(e) => setSelectedProcess(e.target.value)}
                  label="処理"
                >
                  <MenuItem value="all">全て</MenuItem>
                  {Object.entries(sourceKindMapping).map(([key, label]) => (
                    <MenuItem key={key} value={key}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item sx={{ pt: 3 }}>
              <TextField
                type="date"
                label="開始日"
                size="small"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '@media (max-width: 1400px)': {
                    width: 130,
                  },
                  width: 170,
                  '& .MuiInputLabel-root': {
                    color: 'black', // ラベルの色
                  },
                  '& .MuiInputBase-input': {
                    color: 'black', // 入力値の文字色
                  },
                }}
              />
            </Grid>
            <Grid item>
              <TextField
                type="date"
                label="終了日"
                size="small"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  // 画面幅によってwidthを変える
                  '@media (max-width: 1400px)': {
                    width: 130,
                  },
                  width: 170,
                  '& .MuiInputLabel-root': {
                    color: 'black', // ラベルの色
                  },
                  '& .MuiInputBase-input': {
                    color: 'black', // 入力値の文字色
                  },
                }}
              />
            </Grid>
            <Grid
              item
              xs
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 1,
                alignItems: 'center',
                pr: 1,
              }}
            >
              <TextField
                label="販売合計"
                value={`¥${totalSalesAmount.toLocaleString()}`}
                InputProps={{
                  readOnly: true,
                }}
                variant="outlined"
                size="small"
                sx={{
                  width: 130,
                  '& .MuiInputBase-input': {
                    color: 'red',
                    textAlign: 'right',
                    fontSize: '0.875rem',
                  },
                  '& .MuiInputLabel-root': {
                    color: 'black',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.23)',
                    },
                  },
                }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="買取合計"
                value={`¥${totalPurchaseAmount.toLocaleString()}`}
                InputProps={{
                  readOnly: true,
                }}
                variant="outlined"
                size="small"
                sx={{
                  width: 130,
                  '& .MuiInputBase-input': {
                    color: 'blue',
                    textAlign: 'right',
                    fontSize: '0.875rem',
                  },
                  '& .MuiInputLabel-root': {
                    color: 'black',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.23)',
                    },
                  },
                }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="在庫増減"
                value={`${
                  totalStockChange >= 0 ? '+' : ''
                }${totalStockChange.toLocaleString()}`}
                InputProps={{
                  readOnly: true,
                }}
                variant="outlined"
                size="small"
                sx={{
                  width: 90,
                  '& .MuiInputBase-input': {
                    color: 'black',
                    textAlign: 'right',
                    fontSize: '0.875rem',
                  },
                  '& .MuiInputLabel-root': {
                    color: 'black',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.23)',
                    },
                  },
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <Box>
            <TableContainer
              sx={{
                maxHeight: '550px',
                overflowY: 'auto',
                boxShadow: '0px 4px 10px rgba(128, 128, 128, 0.2)',
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow
                    sx={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 1000,
                      backgroundColor: 'white',
                    }}
                  >
                    <TableCell>処理</TableCell>
                    <TableCell>取引ID</TableCell>
                    <TableCell>日時</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        単価
                        <CaptionToolTip message="※販売のみ販売価格を、それ以外は仕入れ値を表示しています。" />
                      </Box>
                    </TableCell>
                    <TableCell>在庫管理</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHistories.length > 0 ? (
                    filteredHistories.map((history, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Tooltip title={history?.description ?? ''}>
                            <Typography variant="body2">
                              {(sourceKindMapping[history.source_kind] ||
                                history?.source_kind) ??
                                ''}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{history.id}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {customDayjs(history.datetime)
                              .tz()
                              .format('YYYY/MM/DD HH:mm:ss')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {history.unit_price.toLocaleString()}円
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {stockChangeText(history)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        表示するデータがありません
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};
