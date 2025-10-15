import { Box, Typography } from '@mui/material';
import { QuantityControlField } from '@/components/inputFields/QuantityControlField';
import { ItemImage } from '@/feature/item/components/ItemImage';
import TagLabel from '@/components/common/TagLabel';
import { ItemText } from '@/feature/item/components/ItemText';

export interface QuantityControlCardProps {
  cardData: {
    id: number;
    image_url: string | null;
    display_name: string | null;
    expansion?: string;
    cardnumber?: string;
    rarity?: string;
    stock?: number; // 在庫数など
    condition?: string; // 状態
    description?: string; // 説明
    quantity: number | null;
    maxQuantity?: number | null;
    processId?: string; // process_id
    specialty__display_name?: string | null;
  };
  onQuantityChange: (newQuantity: number) => void;
}

export const QuantityControlCard = ({
  cardData,
  onQuantityChange,
}: QuantityControlCardProps) => {
  return (
    <Box
      sx={{
        // 親の grid カラム幅 (minmax(200px, 1fr)) に合わせていっぱい使う
        width: '100%',
        maxWidth: 268,
        height: 190,
        border: '1px solid #ccc',
        borderRadius: 2,
        boxShadow: 3,
        backgroundColor: 'background.paper',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexGrow: 1,
        }}
      >
        {/* 左上部（画像エリア） */}
        <Box
          sx={{
            flexShrink: 0,
            marginLeft: 1,
            marginTop: 1,
          }}
        >
          <ItemImage imageUrl={cardData?.image_url} height={100} />
        </Box>

        {/* 右上部（テキストエリア） */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            p: 1,
            overflow: 'auto',
          }}
        >
          {/* カード名 */}
          <ItemText
            text={cardData?.display_name ?? '-'}
            sx={{
              fontWeight: 'bold',
              minHeight: 52,
              display: '-webkit-box',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
            }}
          />
          <Box sx={{ mt: 'auto' }}>
            {/* カードナンバー */}
            {cardData?.expansion && cardData?.cardnumber && (
              <Typography variant="caption" noWrap sx={{ display: 'block' }}>
                {cardData?.expansion} {cardData?.cardnumber}
              </Typography>
            )}

            {/* レアリティ */}
            {cardData?.rarity && (
              <Typography variant="caption" sx={{ display: 'block' }}>
                {cardData?.rarity}
              </Typography>
            )}

            {/* 在庫数 */}
            {cardData?.stock !== undefined ? (
              <Typography variant="caption" noWrap sx={{ display: 'block' }}>
                在庫：{cardData.stock}
              </Typography>
            ) : null}

            {/* 状態 */}
            {cardData?.condition && (
              <Box
                sx={{
                  py: 0.5,
                  mr: 'auto',
                  width: 'fit-content',
                }}
              >
                <TagLabel
                  width="fit-content"
                  height="20px"
                  typographyVariant="caption"
                >
                  {cardData?.condition}
                </TagLabel>
              </Box>
            )}

            {/* 特殊状態 */}
            {cardData?.specialty__display_name && (
              <Typography variant="caption" sx={{ display: 'block' }}>
                {cardData?.specialty__display_name}
              </Typography>
            )}

            {/* 説明 */}
            {cardData?.description && (
              <Typography variant="caption" noWrap sx={{ display: 'block' }}>
                {cardData.description}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* 下部（数量コントロール） */}
      <Box
        sx={{
          height: 50,
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          p: 1,
        }}
      >
        <QuantityControlField
          quantity={cardData.quantity ?? 0}
          maxQuantity={cardData.maxQuantity ?? undefined}
          onQuantityChange={onQuantityChange}
          textFieldProps={{
            sx: {
              '& .MuiInputBase-input': {
                color:
                  cardData.quantity === null || cardData.quantity >= 1
                    ? 'red'
                    : 'inherit',
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};
