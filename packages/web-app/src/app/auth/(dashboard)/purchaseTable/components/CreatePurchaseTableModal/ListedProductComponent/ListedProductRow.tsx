import { SelectedProduct } from '@/app/auth/(dashboard)/purchaseTable/components/CreatePurchaseTableModal/CreatePurchaseTableModal';
import { ItemImage } from '@/feature/item/components/ItemImage';
import {
  Checkbox,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import grey from '@mui/material/colors/grey';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ItemText } from '@/feature/item/components/ItemText';

interface Props {
  product: SelectedProduct;
  index: number;
  isShowInputField: boolean;
  handleTextFiledChange: (value: string, itemId?: number) => void;
  handleCheckBoxChange: (value: boolean, itemId?: number) => void;
  handlePsa10CheckBoxChange: (value: boolean, itemId?: number) => void;
  handleDeleteRow: (itemId?: number) => void;
  handleMoveItem: (dragIndex: number, hoverIndex: number) => void;
}

const ItemType = 'PRODUCT';

export const ListedProductRow = ({
  product,
  index,
  isShowInputField,
  handleTextFiledChange,
  handleCheckBoxChange,
  handlePsa10CheckBoxChange,
  handleDeleteRow,
  handleMoveItem,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: ItemType,
    hover(item: { index: number }) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      handleMoveItem(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <Stack
      ref={ref}
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      pt={1}
      px={1}
      pb={1}
      borderBottom={`1px solid ${grey[300]}`}
      gap={0.5}
      sx={{
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: '#fff',
        cursor: isDragging ? 'grabbing !important' : 'grab !important',
      }}
    >
      {/* ドラッグアイコン */}
      <MoreVertIcon sx={{ fontSize: 20 }} />

      {/* 画像部分 */}
      <Stack width={72 * 0.71}>
        <ItemImage imageUrl={product.itemImage ?? null} height={72} />
      </Stack>

      {/* 商品情報 */}
      <Stack direction="column" flex="1.6" alignItems="start">
        <ItemText text={product.itemName ?? '-'} />
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography noWrap>掲載価格</Typography>
          {isShowInputField ? (
            <Typography>
              {product.displayPrice?.toLocaleString() ?? ''}
            </Typography>
          ) : (
            <TextField
              size="small"
              type="text"
              required
              sx={{ width: '100px' }}
              value={product.displayPrice?.toLocaleString() ?? ''}
              onChange={(e) =>
                handleTextFiledChange(e.target.value, product.itemId)
              }
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
                style: { textAlign: 'right' },
              }}
            />
          )}
          <Typography>円</Typography>
        </Stack>
      </Stack>

      <Stack direction="column">
        {/* チェックボックス */}
        <Stack direction="row" alignItems="center" flex="1.2">
          <Checkbox
            checked={!!product.anyModelNumber}
            sx={{
              color: 'primary.main',
              '&.Mui-checked': { color: 'primary.main' },
            }}
            onChange={(e) =>
              handleCheckBoxChange(e.target.checked, product.itemId)
            }
          />
          <Typography noWrap>型番問わない</Typography>
        </Stack>

        {/* PSA10チェックボックス */}
        <Stack direction="row" alignItems="center" flex="1.2">
          <Checkbox
            checked={!!product.isPsa10}
            sx={{
              color: 'primary.main',
              '&.Mui-checked': { color: 'primary.main' },
            }}
            onChange={(e) =>
              handlePsa10CheckBoxChange(e.target.checked, product.itemId)
            }
          />
          <Typography noWrap>PSA10</Typography>
        </Stack>
      </Stack>

      {/* ゴミ箱アイコン (削除ボタン) */}
      {!isShowInputField && (
        <IconButton onClick={() => handleDeleteRow(product.itemId)}>
          <DeleteIcon />
        </IconButton>
      )}
    </Stack>
  );
};
