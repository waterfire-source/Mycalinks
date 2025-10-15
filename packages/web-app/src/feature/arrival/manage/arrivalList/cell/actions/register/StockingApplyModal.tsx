import { BackendStockingAPI } from '@/app/api/store/[store_id]/stocking/api';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { useApplyStocking } from '@/feature/arrival/hooks/useApplyStocking';
import { StockingRegisterTable } from '@/feature/arrival/manage/arrivalList/cell/actions/register/StockingRegisterTable';
import { Box, Stack, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultStocking: BackendStockingAPI[5]['response']['200'][0];
  search: () => Promise<void>;
}

export const StockingApplyModal = ({
  isOpen,
  onClose,
  defaultStocking,
  search,
}: Props) => {
  const { applyStocking, isLoading } = useApplyStocking();
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [stocking, setStocking] =
    useState<BackendStockingAPI[5]['response']['200'][0]>(defaultStocking);

  // 納品数量
  const itemCount = stocking.stocking_products.reduce(
    (sum, product) => sum + (product.actual_item_count ?? 0),
    0,
  );

  // 納品金額
  const totalPrice = stocking.stocking_products.reduce(
    (sum, product) =>
      sum + (product.unit_price ?? 0) * (product.actual_item_count ?? 0),
    0,
  );

  const handleClickArrival = async () => {
    const res = await applyStocking({
      stocking,
      actualDate: dayjs(date),
    });

    if (res) {
      onClose();
      search();
    }
  };

  useEffect(() => {
    // 納品登録モーダルで入荷数量の初期値に入荷予定数量を入れる
    setStocking((prev) => ({
      ...prev,
      stocking_products: prev.stocking_products.map((sp) => {
        return {
          ...sp,
          actual_item_count: sp.planned_item_count,
          unit_price: sp.unit_price ?? sp.unit_price_without_tax,
        };
      }),
    }));
  }, [defaultStocking]);

  return (
    <CustomModalWithIcon
      open={isOpen}
      onClose={onClose}
      title="納品登録"
      onActionButtonClick={handleClickArrival}
      actionButtonText={'納品確定'}
      cancelButtonText={'納品をやめる'}
      loading={isLoading}
      width="95%"
      height="85%"
    >
      <Stack flexDirection="row" gap={4} px={3} height="35px">
        <Stack flexDirection="row" gap={1} alignItems="center">
          <Typography variant="body2">入荷日</Typography>
          <Box
            sx={{
              backgroundColor: 'grey.200',
              padding: '2px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '10px',
              }}
            >
              必須
            </Typography>
          </Box>
        </Stack>
        <TextField
          name="date"
          type="date"
          size="small"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
          }}
          InputLabelProps={{
            shrink: true,
            sx: {
              color: 'text.primary',
            },
          }}
        />
        <Stack flexDirection="row" sx={{ ml: 'auto' }} alignItems="center">
          <Typography variant="h1">
            {defaultStocking.stocking_products.length.toLocaleString()}商品
            {itemCount.toLocaleString()}点 （{totalPrice.toLocaleString()}円）
          </Typography>
        </Stack>
      </Stack>
      <Box height="calc(100% - 35px)">
        <StockingRegisterTable stocking={stocking} setStocking={setStocking} />
      </Box>
    </CustomModalWithIcon>
  );
};
