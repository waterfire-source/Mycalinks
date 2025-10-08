import { Box } from '@mui/material';
import {
  QuantityControlCard,
  QuantityControlCardProps,
} from '@/components/cards/QuantityControlCard';
import { OriginalPackProduct } from '@/app/auth/(dashboard)/original-pack/page';

interface OriginalPackProductCardListContentProps {
  originalPackProducts: OriginalPackProduct[];
  updateQuantity: (id: number, processId: string, newQuantity: number) => void;
}

export const OriginalPackProductCardListContent: React.FC<
  OriginalPackProductCardListContentProps
> = ({
  originalPackProducts,
  updateQuantity,
}: OriginalPackProductCardListContentProps) => {
  const cardDataArray: QuantityControlCardProps['cardData'][] =
    originalPackProducts.map((product) => ({
      id: product.id,
      image_url: product.image_url,
      display_name: product.display_name ?? null,
      condition: product.condition_option_display_name ?? undefined,
      description: `仕入れ値：${product.mean_wholesale_price}円`,
      quantity: product.item_count ?? null,
      maxQuantity: product.max_count ?? null,
      processId: product.processId,
      specialty__display_name: product.specialty__display_name ?? null,
    }));

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 2,
      }}
    >
      {cardDataArray.map((cardData) => (
        <QuantityControlCard
          key={cardData.id}
          cardData={cardData}
          onQuantityChange={(newQuantity) =>
            updateQuantity(cardData.id, cardData.processId, newQuantity)
          }
        />
      ))}
    </Box>
  );
};
