import { EC_PAYMENT_METHOD_MAP } from '@/constants/shipping';
import { Box, TextField, MenuItem, Typography, Button } from '@mui/material';
import { Shipping_Method } from '@prisma/client';
import { useState } from 'react';

interface Props {
  selectedShippingMethod: string | null;
  selectedPaymentMethod: string | null;
  sortOrder: 'asc' | 'desc';
  orderId: string;
  shippingMethods: Shipping_Method[];
  onShippingMethodChange: (value: string | null) => void;
  onPaymentMethodChange: (value: string | null) => void;
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  onOrderIdChange: (value: string) => void;
  onSearch: () => void;
  selectedOrderIds: number[];
  isDeliveryNoteLoading: boolean;
  isKuronekoShippingLabelGenerating: boolean;
  onKuronekoShippingLabelGeneration: () => void;
  onDeliveryNoteGeneration: () => void;
  orderedAtGte: Date | null;
  orderedAtLt: Date | null;
  onOrderedAtGteChange: (date: Date | null) => void;
  onOrderedAtLtChange: (date: Date | null) => void;
}

export const OrderSearchForm = ({
  selectedShippingMethod,
  selectedPaymentMethod,
  sortOrder,
  orderId,
  shippingMethods,
  onShippingMethodChange,
  onPaymentMethodChange,
  onSortOrderChange,
  onOrderIdChange,
  onSearch,
  selectedOrderIds,
  isDeliveryNoteLoading,
  isKuronekoShippingLabelGenerating,
  onKuronekoShippingLabelGeneration,
  onDeliveryNoteGeneration,
  orderedAtGte,
  orderedAtLt,
  onOrderedAtGteChange,
  onOrderedAtLtChange,
}: Props) => {
  const [searchOrderId, setSearchOrderId] = useState('');
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        p: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="注文番号"
          size="small"
          value={searchOrderId}
          onChange={(e) => setSearchOrderId(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onOrderIdChange(searchOrderId);
            }
          }}
          onBlur={() => onOrderIdChange(searchOrderId)}
          sx={{
            width: '130px',
            '& .MuiInputLabel-root': {
              color: 'common.black',
            },
          }}
        />
        <TextField
          select
          label="支払方法"
          size="small"
          value={selectedPaymentMethod || ''}
          onChange={(e) => {
            const value = e.target.value || null;
            onPaymentMethodChange(value);
          }}
          sx={{
            width: '150px',
            '& .MuiInputLabel-root': {
              color: 'common.black',
            },
          }}
        >
          <MenuItem value="">すべて</MenuItem>
          {Object.entries(EC_PAYMENT_METHOD_MAP).map(([key, value]) => (
            <MenuItem key={key} value={key}>
              {value}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="配送方法"
          size="small"
          value={selectedShippingMethod || ''}
          onChange={(e) => {
            const value = e.target.value || null;
            onShippingMethodChange(value);
          }}
          sx={{
            width: '200px',
            '& .MuiInputLabel-root': {
              color: 'common.black',
            },
          }}
        >
          <MenuItem value="">すべて</MenuItem>
          {shippingMethods.map((method) => (
            <MenuItem key={method.id} value={method.id.toString()}>
              {method.display_name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="受注日時（開始）"
          type="date"
          size="small"
          value={orderedAtGte ? orderedAtGte.toISOString().split('T')[0] : ''}
          onChange={(e) => {
            const value = e.target.value;
            onOrderedAtGteChange(value ? new Date(value) : null);
          }}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{
            width: '130px',
            '& .MuiInputLabel-root': {
              color: 'common.black',
            },
          }}
        />
        <TextField
          label="受注日時（終了）"
          type="date"
          size="small"
          value={orderedAtLt ? orderedAtLt.toISOString().split('T')[0] : ''}
          onChange={(e) => {
            const value = e.target.value;
            onOrderedAtLtChange(value ? new Date(value) : null);
          }}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{
            width: '130px',
            '& .MuiInputLabel-root': {
              color: 'common.black',
            },
          }}
        />
        <Button
          variant="contained"
          color="primary"
          disabled={
            selectedOrderIds.length === 0 || isKuronekoShippingLabelGenerating
          }
          onClick={onKuronekoShippingLabelGeneration}
          sx={{ minWidth: '140px' }}
        >
          {isKuronekoShippingLabelGenerating
            ? '発行中...'
            : `送り状印刷 (${selectedOrderIds.length})`}
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={selectedOrderIds.length === 0 || isDeliveryNoteLoading}
          onClick={onDeliveryNoteGeneration}
          sx={{ minWidth: '140px' }}
        >
          {isDeliveryNoteLoading
            ? '発行中...'
            : `納品書発行 (${selectedOrderIds.length})`}
        </Button>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2">並び替え</Typography>
        <TextField
          select
          size="small"
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value as 'asc' | 'desc')}
          sx={{
            width: '200px',
            '& .MuiInputLabel-root': {
              color: 'common.black',
            },
          }}
        >
          <MenuItem value="asc">受注日時早い順</MenuItem>
          <MenuItem value="desc">受注日時遅い順</MenuItem>
        </TextField>
      </Box>
    </Box>
  );
};
