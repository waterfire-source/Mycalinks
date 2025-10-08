import { Box, Grid, Typography } from '@mui/material';
import { CardDetailItem } from '@/feature/stock/components/register/pack/CardDetailItem';

//パックの戻り値の型定義
export interface PackItem {
  product_id: number;
  myca_item_id?: number;
  image_url?: string;
  genre_name?: string;
  display_name: string;
  displayNameWithMeta: string;
  cardnumber?: string;
  cardseries?: string;
  expansion?: string;
  rarity?: string;
  myca_pack_id?: number;
  pos_item_id?: number;
  quantity: number; // 追加する数量
  max_quantity?: number; //最大数量
}

type Props = {
  items: PackItem[];
  updateItemQuantity: (id: number, newQuantity: number) => void;
  useProductId?: boolean; //数量の判定でproductIDを使用するかどうか
};

export const StockRegisterList = ({
  items,
  updateItemQuantity,
  useProductId = false,
}: Props) => {
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'grey.700',
          padding: '10px',
        }}
      >
        <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
          カード一覧
        </Typography>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          maxHeight: '620px',
          overflow: 'auto',
          border: '1px solid grey',
          p: 2,
        }}
      >
        <Grid container spacing={1} justifyContent="start">
          {items.map((item, index) => (
            <Grid item xs={6} sm={4} md={1.2} key={index}>
              <CardDetailItem
                cardData={item}
                quantity={item.quantity}
                max_quantity={item.max_quantity}
                onQuantityChange={(newQuantity) =>
                  updateItemQuantity(
                    useProductId ? item.product_id : item.myca_item_id,
                    newQuantity,
                  )
                }
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};
