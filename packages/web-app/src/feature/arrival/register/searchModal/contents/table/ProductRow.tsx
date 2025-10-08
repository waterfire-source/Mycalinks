import { useEffect, useState } from 'react';
import { TableCell, IconButton, Typography, Stack } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NumericTextField from '@/components/inputFields/NumericTextField';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import {
  ArrivalItemType,
  ArrivalProductSearchType,
} from '@/feature/arrival/register/searchModal/type';
import { useCreateSpecialtyProduct } from '@/feature/specialty/hooks/useCreateSpecialtyProduct';
import { useStore } from '@/contexts/StoreContext';
import { createClientAPI, CustomError } from '@/api/implement';
import { ItemAPI } from '@/api/frontend/item/api';
import { useAlert } from '@/contexts/AlertContext';
import { CustomArrivalProductSearchType } from '@/app/auth/(dashboard)/arrival/register/page';

interface Props {
  item: ArrivalItemType;
  product: ArrivalProductSearchType;
  index: number;
  handleAdd: (
    product: ArrivalProductSearchType,
    arrivalCount: number,
    arrivalPrice: number,
  ) => Promise<void>;
  isExpanded: boolean;
  handleToggleExpand: () => void;
  isLastRow: boolean;
  selectedSpecialtyId?: number;
}

export const ArrivalProductRow: React.FC<Props> = ({
  item,
  product,
  index,
  handleAdd,
  isExpanded,
  handleToggleExpand,
  isLastRow,
  selectedSpecialtyId,
}: Props) => {
  const [count, setCount] = useState<number | undefined>(0);
  const [price, setPrice] = useState<number | undefined>(0);
  const { createSpecialtyProduct, isLoading } = useCreateSpecialtyProduct();
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const clientAPI = createClientAPI();

  // 作成済みの状態のidを管理する
  const [createdConditionOptionIds, setCreatedConditionOptionIds] = useState<
    number[]
  >([]);

  useEffect(() => {
    // 特殊状態を変更したらリセットする
    setCreatedConditionOptionIds([]);
  }, [selectedSpecialtyId]);

  //特殊状態を変更したときにもうあるのに特殊状態を作成しようとしてバグる。
  const onClickAdd = async (product: CustomArrivalProductSearchType) => {
    try {
      const itemResponse: ItemAPI['get']['response'] = await clientAPI.item.get(
        {
          storeID: store.id,
          id: product.item_id,
          includesProducts: true,
        },
      );

      if (itemResponse instanceof CustomError)
        return setAlertState({
          message: 'アイテムが見つかりません',
          severity: 'error',
        });

      const isExist = itemResponse.items[0].products.some(
        (p) =>
          p.item_id === product.item_id &&
          p.condition_option_id === product.condition_option_id &&
          p.specialty_id === selectedSpecialtyId,
      );

      if (count === undefined || price === undefined) return;
      // 特殊状態が選択されていて、まだその特殊状態の商品が作成されていない時
      if (selectedSpecialtyId && !isExist) {
        if (product.condition_option_id === null)
          throw new Error('条件オプションが設定されていません');
        const res = await createSpecialtyProduct({
          storeId: store.id,
          itemId: item.id,
          requestBody: {
            specialty_id: selectedSpecialtyId,
            condition_option_id: product.condition_option_id,
          },
        });
        setCreatedConditionOptionIds((prev) => [
          ...prev,
          product.condition_option_id ?? 0,
        ]);
        await handleAdd({ ...product, id: res.id }, count, price);
      } else {
        await handleAdd(product, count, price);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const cellSx = {
    borderBottom: isExpanded && !isLastRow ? 'none' : undefined,
  };

  return (
    <>
      <TableCell align="center" sx={cellSx}>
        <Stack
          height="100%"
          alignItems="center"
          justifyContent="center"
          direction="row"
        >
          <Typography variant="body2">
            {product.condition_option_display_name || '-'}
          </Typography>
          {index === 0 && item.products.length > 1 && (
            <IconButton onClick={handleToggleExpand} size="small">
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </Stack>
      </TableCell>
      <TableCell align="center" sx={{ ...cellSx, maxWidth: '150px' }}>
        <Stack height="100%" alignItems="center" justifyContent="center">
          <NumericTextField
            value={price}
            min={0}
            onChange={(val) => setPrice(val)}
            suffix="円"
            InputProps={{
              inputProps: {
                min: 0,
              },
            }}
            noSpin
          />
        </Stack>
      </TableCell>
      <TableCell align="center" sx={cellSx}>
        <Stack height="100%" alignItems="center" justifyContent="center">
          <Typography variant="body2">
            {product.item_infinite_stock
              ? '∞'
              : selectedSpecialtyId &&
                product.specialty_id !== selectedSpecialtyId
              ? '0個'
              : product.stock_number?.toLocaleString() + '個'}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell align="center" sx={{ ...cellSx, maxWidth: '120px' }}>
        <Stack height="100%" alignItems="center" justifyContent="center">
          <NumericTextField
            value={count}
            min={0}
            onChange={(val) => setCount(val)}
            suffix="個"
            InputProps={{
              inputProps: {
                min: 0,
              },
            }}
          />
        </Stack>
      </TableCell>
      <TableCell align="center" sx={cellSx}>
        <Stack height="100%" alignItems="center" justifyContent="center">
          <PrimaryButton
            disabled={count === undefined || count <= 0}
            loading={isLoading}
            onClick={() => onClickAdd(product)}
          >
            追加
          </PrimaryButton>
        </Stack>
      </TableCell>
    </>
  );
};
