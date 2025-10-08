import { useEffect, useState } from 'react';
import { TableCell, IconButton, Typography, Stack } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NumericTextField from '@/components/inputFields/NumericTextField';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { useCreateSpecialtyProduct } from '@/feature/specialty/hooks/useCreateSpecialtyProduct';
import { useStore } from '@/contexts/StoreContext';
import {
  ConsignmentItemType,
  ConsignmentProductSearchType,
} from '@/feature/consign/components/register/searchModal/type';

interface Props {
  item: ConsignmentItemType;
  product: ConsignmentProductSearchType;
  index: number;
  handleAdd: (
    product: ConsignmentProductSearchType,
    products: ConsignmentProductSearchType[],
    consignmentCount: number,
    consignmentPrice: number,
  ) => Promise<void>;
  isExpanded: boolean;
  handleToggleExpand: () => void;
  isLastRow: boolean;
  selectedSpecialtyId?: number;
}

export const ConsignmentProductRow: React.FC<Props> = ({
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
  const [price, setPrice] = useState<number | undefined>(
    product.sell_price || 0,
  );
  const { createSpecialtyProduct, isLoading } = useCreateSpecialtyProduct();
  const { store } = useStore();

  // 作成済みの状態のidを管理する
  const [createdConditionOptionIds, setCreatedConditionOptionIds] = useState<
    number[]
  >([]);

  useEffect(() => {
    // 特殊状態を変更したらリセットする
    setCreatedConditionOptionIds([]);
  }, [selectedSpecialtyId]);

  useEffect(() => {
    // 商品の販売価格を初期値として設定
    setPrice(product.sell_price || 0);
  }, [product.sell_price]);

  const onClickAdd = async (product: ConsignmentProductSearchType) => {
    try {
      if (count === undefined || count <= 0 || price === undefined) return;
      // 特殊状態が選択されていて、まだその特殊状態の商品が作成されていない時
      if (
        selectedSpecialtyId &&
        !item.products.some((p) => p.specialty_id === selectedSpecialtyId) &&
        !createdConditionOptionIds.includes(product.condition_option_id ?? 0)
      ) {
        if (product.condition_option_id === null)
          throw new Error('条件オプションが設定されていません');
        const res = await createSpecialtyProduct({
          storeId: store.id,
          itemId: item.id,
          requestBody: {
            specialty_id: selectedSpecialtyId,
            condition_option_id: product.condition_option_id!,
          },
        });
        setCreatedConditionOptionIds((prev) => [
          ...prev,
          product.condition_option_id!,
        ]);
        await handleAdd(
          { ...product, id: res.id },
          item.products as unknown as ConsignmentProductSearchType[],
          count ?? 0,
          price ?? 0,
        );
      } else {
        await handleAdd(
          product,
          item.products as unknown as ConsignmentProductSearchType[],
          count ?? 0,
          price ?? 0,
        );
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
            登録
          </PrimaryButton>
        </Stack>
      </TableCell>
    </>
  );
};
