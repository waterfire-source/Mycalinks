import { DetailCard } from '@/components/cards/DetailCard';
import { ConsignmentSearchProductDetail } from '@/feature/consign/components/register/searchModal/contents/result/ProductDetail';
import { ConsignmentProductSearchType } from '@/feature/consign/components/register/searchModal/type';
import { Divider, Stack, Typography } from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';

interface Props {
  products: ConsignmentProductSearchType[];
  setProducts: Dispatch<SetStateAction<ConsignmentProductSearchType[]>>;
}

export const ConsignmentProductsResult = ({ products, setProducts }: Props) => {
  // 商品数
  const productCount = products.length;

  // 商品合計数
  const totalCount = products.reduce(
    (sum, p) => sum + (p.consignmentCount ?? 0),
    0,
  );

  // 委託価格合計
  const totalPrice = products.reduce(
    (sum, p) => sum + (p.consignmentPrice ?? 0) * (p.consignmentCount ?? 0),
    0,
  );

  // 商品追加時のオートフォーカス処理
  const lastProductRef = useRef<HTMLDivElement | null>(null);
  const prevLengthRef = useRef<number>(products.length);
  useEffect(() => {
    // 商品の削除時には発火しないように、直前の商品リストの数と比較して増えている場合のみ下までスクロールする
    if (products.length > prevLengthRef.current && lastProductRef.current) {
      lastProductRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    prevLengthRef.current = products.length; // 比較用に現在の商品リスト数を保存
  }, [products.length]);

  return (
    <DetailCard
      title="登録商品"
      titleDetail={`${productCount.toLocaleString()}商品${totalCount.toLocaleString()}点 （${totalPrice.toLocaleString()}円）`}
      contentSx={{ px: 0 }}
      content={
        products.length === 0 ? (
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
            {products.map((p, index) => (
              <div
                key={index}
                ref={index === products.length - 1 ? lastProductRef : null}
              >
                <ConsignmentSearchProductDetail
                  product={p}
                  setProducts={setProducts}
                />
                {index < products.length - 1 && <Divider />}
              </div>
            ))}
          </Stack>
        )
      }
    />
  );
};
