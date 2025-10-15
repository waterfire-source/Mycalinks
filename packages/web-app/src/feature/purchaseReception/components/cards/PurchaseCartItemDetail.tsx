import { Box, Stack, TextField, Typography } from '@mui/material';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { Delete } from '@mui/icons-material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { MobileCartResultItem } from '@/components/cards/CartDisplayCard';
import { QuantityControlField } from '@/components/inputFields/QuantityControlField';
import { ItemText } from '@/feature/item/components/ItemText';
import { ConditionChip } from '@/feature/products/components/ConditionChip';
import { Specialties } from '@/feature/specialty/hooks/useGetSpecialty';
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import grey from '@mui/material/colors/grey';

interface PurchaseCartItemDetailProps {
  item: MobileCartResultItem;
  index: number;
  onQuantityChange: (id: string, newQuantity: number) => void;
  onPriceChange?: (id: string, newPrice: number) => void;
  onRemoveItem?: (id: string) => void;
  specialties: Specialties;
  onSpecialtyChange: (id: string, newSpecialtyId: number) => void;
  onManagementNumberChange: (id: string, newManagementNumber: string) => void;
  onMoveItem: (dragIndex: number, hoverIndex: number) => void;
}

const ItemType = 'PURCHASE_CART_ITEM';

export const PurchaseCartItemDetail: React.FC<PurchaseCartItemDetailProps> = ({
  item,
  index,
  onQuantityChange,
  onPriceChange,
  onRemoveItem,
  specialties: _specialties,
  onSpecialtyChange: _onSpecialtyChange,
  onManagementNumberChange,
  onMoveItem,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: ItemType,
    hover(dragItem: { index: number }) {
      if (!ref.current) return;
      const dragIndex = dragItem.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      onMoveItem(dragIndex, hoverIndex);
      dragItem.index = hoverIndex;
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

  const handleCountChange = (newCount: number) => {
    onQuantityChange(item.id, newCount);
  };

  const handlePriceChange = (newPrice: number) => {
    if (onPriceChange) {
      onPriceChange(item.id, newPrice);
    }
  };

  const handleRemove = () => {
    if (onRemoveItem) {
      onRemoveItem(item.id);
    }
  };

  const handleManagementNumberChange = (newManagementNumber: string) => {
    if (onManagementNumberChange) {
      onManagementNumberChange(item.id, newManagementNumber);
    }
  };

  return (
    <Stack
      ref={ref}
      direction="row"
      width="100%"
      alignItems="flex-start"
      spacing={2}
      py={1}
      sx={{
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: '#fff',
        cursor: isDragging ? 'grabbing !important' : 'grab !important',
        borderBottom: `1px solid ${grey[300]}`,
      }}
    >
      {/* ドラッグアイコン */}
      <Box sx={{ display: 'flex', alignItems: 'center', pt: 1 }}>
        <MoreVertIcon sx={{ fontSize: 20, color: grey[500] }} />
      </Box>

      {/* 商品画像とコンディション */}
      <Stack width="80px" spacing={1}>
        <ItemImage imageUrl={item.imageUrl ?? ''} />
        <ConditionChip condition={item.conditionName} />
      </Stack>

      {/* 商品情報 */}
      <Stack flex={1} spacing={1}>
        {/* 商品名 */}
        <ItemText
          sx={{
            WebkitLineClamp: 2,
          }}
          text={item.displayName}
        />

        {/* 査定値 */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="caption" sx={{ minWidth: '50px' }}>
            査定値:
          </Typography>
          <NumericTextField
            value={item.unitPrice}
            onChange={(val) => handlePriceChange(val)}
            suffix="円"
            disabled={!onPriceChange}
            noSpin
            sx={{ width: '120px' }}
          />
        </Stack>

        {/* 管理番号を入力する場合は必ず値が1になるので数量入力は不要 */}
        {item.hasManagementNumber ? (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="caption" sx={{ minWidth: '50px' }}>
              管理番号
            </Typography>
            <TextField
              value={item.managementNumber}
              onChange={(e) => handleManagementNumberChange(e.target.value)}
              size="small"
              sx={{ width: '120px' }}
            />
          </Stack>
        ) : (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="caption" sx={{ minWidth: '50px' }}>
              個数:
            </Typography>
            <QuantityControlField
              quantity={item.itemCount}
              onQuantityChange={handleCountChange}
              suffix="個"
            />
          </Stack>
        )}
      </Stack>

      {/* 削除ボタン */}
      {onRemoveItem && (
        <Box sx={{ pt: 1 }}>
          <Delete
            sx={{
              width: '24px',
              cursor: 'pointer',
              color: 'grey.700',
            }}
            onClick={handleRemove}
          />
        </Box>
      )}
    </Stack>
  );
};
