import { CustomError } from '@/api/implement';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { InventoryInjectWholesaleTable } from '@/app/auth/(dashboard)/inventory-count/components/InventoryInjectWholesaleTable';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { Stack, Typography } from '@mui/material';
import { MycaPosApiClient } from 'api-generator/client';
import { useEffect, useMemo, useState } from 'react';
import z from 'zod';
import { injectInventoryWholesalePriceApi } from 'api-generator';
import { InventoryProductAPIData } from '@/feature/inventory-count/hook/useInventoryProducts';

type Props = {
  open: boolean;
  onClose: () => void;
  handleCloseModal: () => void;
  inventoryId: number;
  unInjectedProducts: InventoryProductAPIData[];
};

export type injectedProductRow = InventoryProductAPIData & {
  injectedWholesalePrice: number | undefined;
};

type InjectRequestBody = z.infer<
  typeof injectInventoryWholesalePriceApi.request.body
>;

export const InjectWholesaleModal = ({
  open,
  onClose,
  handleCloseModal,
  inventoryId,
  unInjectedProducts,
}: Props) => {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<injectedProductRow[]>([]);

  const mycaPosApiClient = useMemo(
    () =>
      new MycaPosApiClient({ BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api` }),
    [store.id],
  );

  const handleInjectWholesalePrice = async () => {
    const products: InjectRequestBody['wholesalePriceList'] = rows
      .map((r) => {
        if (!r.injectedWholesalePrice || !r.wholesale_price_history_id)
          return null;

        return {
          unit_price: r.injectedWholesalePrice,
          product_id: r.product_id,
          wholesale_price_history_id: r.wholesale_price_history_id,
        };
      })
      .filter((p) => p !== null) as InjectRequestBody['wholesalePriceList'];

    const requestBody: InjectRequestBody = {
      wholesalePriceList: products,
    };

    await injectWholesalePrice(requestBody);
    handleCloseModal();
  };

  const injectWholesalePrice = async (products: InjectRequestBody) => {
    try {
      setLoading(true);
      const res =
        await mycaPosApiClient.inventory.injectInventoryWholesalePrice({
          storeId: store.id,
          inventoryId: inventoryId,
          requestBody: products,
        });

      if (res instanceof CustomError) throw res;
      setAlertState({
        message: '棚卸し商品の仕入れ値挿入に成功しました',
        severity: 'success',
      });
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setRows(
      unInjectedProducts.map((p) => ({
        ...p,
        injectedWholesalePrice: undefined,
      })),
    );
  }, [unInjectedProducts]);

  return (
    <CustomModalWithIcon
      title="仕入れ値を登録"
      open={open}
      onClose={onClose}
      width="90%"
      height="90%"
      onActionButtonClick={handleInjectWholesalePrice}
      actionButtonText="登録する"
      loading={loading}
    >
      <Stack sx={{ width: '100%', height: '100%' }}>
        <Typography sx={{ mb: 2 }}>
          以下の商品は仕入れ値の記録がありませんでした。仕入れ値を入力して棚卸しを完了させて下さい。
        </Typography>
        <Stack sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <InventoryInjectWholesaleTable rows={rows} setRows={setRows} />
        </Stack>
      </Stack>
    </CustomModalWithIcon>
  );
};
