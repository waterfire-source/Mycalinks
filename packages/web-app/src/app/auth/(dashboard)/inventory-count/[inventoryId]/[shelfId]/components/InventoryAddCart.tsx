import { CartItem } from '@/app/auth/(dashboard)/inventory-count/[inventoryId]/[shelfId]/components/InventoryAddModal';
import { InventoryProductDetail } from '@/app/auth/(dashboard)/inventory-count/[inventoryId]/[shelfId]/components/InventoryProductDetail';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { DetailCard } from '@/components/cards/DetailCard';
import { Divider, Grid, Stack, Typography } from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';

interface Props {
  addCart: CartItem[];
  setAddCart: Dispatch<SetStateAction<CartItem[]>>;
  handleAddShelfProduct: (products: CartItem[]) => void;
}

export const InventoryAddCart = ({
  addCart,
  setAddCart,
  handleAddShelfProduct,
}: Props) => {
  // 商品数
  const productCount = addCart.length;

  // 商品合計数
  const totalCount = addCart.reduce((sum, p) => sum + (p.count ?? 0), 0);

  // 販売価格合計
  const totalPrice = addCart.reduce(
    (sum, p) => sum + (p.sell_price ?? 0) * p.count,
    0,
  );

  // 商品追加時のオートフォーカス処理
  const lastProductRef = useRef<HTMLDivElement | null>(null);
  const prevLengthRef = useRef<number>(addCart.length);
  useEffect(() => {
    // 商品の削除時には発火しないように、直前の商品リストの数と比較して増えている場合のみ下までスクロールする
    if (addCart.length > prevLengthRef.current && lastProductRef.current) {
      lastProductRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    prevLengthRef.current = addCart.length; // 比較用に現在の商品リスト数を保存
  }, [addCart.length]);

  return (
    <DetailCard
      title="発注商品"
      titleDetail={`${productCount.toLocaleString()}商品${totalCount.toLocaleString()}点 ${totalPrice.toLocaleString()}円`}
      contentSx={{ px: 0 }}
      content={
        addCart.length === 0 ? (
          <Stack
            height="100%"
            width="100%"
            justifyContent="center"
            alignItems="center"
          >
            <Typography variant="body1">商品を追加してください</Typography>
          </Stack>
        ) : (
          <Stack
            gap={1}
            sx={{
              width: '100%',
            }}
          >
            {addCart.map((p, index) => (
              <div
                key={index}
                ref={index === addCart.length - 1 ? lastProductRef : null}
              >
                <InventoryProductDetail cartItem={p} setAddCart={setAddCart} />
                {index < addCart.length - 1 && <Divider />}
              </div>
            ))}
          </Stack>
        )
      }
      bottomContent={
        <Grid direction="row" sx={{ justifyContent: 'center' }}>
          <PrimaryButton onClick={() => handleAddShelfProduct(addCart)}>
            商品を登録
          </PrimaryButton>
        </Grid>
      }
      bottomContentSx={{ display: 'flex', justifyContent: 'right' }}
    />
  );
};
