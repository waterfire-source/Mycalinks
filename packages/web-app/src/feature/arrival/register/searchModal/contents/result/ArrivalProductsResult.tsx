import { DetailCard } from '@/components/cards/DetailCard';
import { ArrivalSearchProductDetail } from '@/feature/arrival/register/searchModal/contents/result/ProductDetail';
import { ArrivalProductSearchType } from '@/feature/arrival/register/searchModal/type';
import { Specialties } from '@/feature/specialty/hooks/useGetSpecialty';
import { Divider, Stack, Typography } from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';

interface Props {
  products: ArrivalProductSearchType[];
  setProducts: Dispatch<SetStateAction<ArrivalProductSearchType[]>>;
  specialties: Specialties;
}

export const ArrivalProductsResult = ({
  products,
  setProducts,
  specialties,
}: Props) => {
  // 商品数
  const productCount = products.length;

  // 商品合計数
  const totalCount = products.reduce(
    (sum, p) => sum + (p.arrivalCount ?? 0),
    0,
  );

  // 仕入れ値合計
  const totalPrice = products.reduce(
    (sum, p) => sum + (p.arrivalPrice ?? 0) * (p.arrivalCount ?? 0),
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
      title="発注商品"
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
              overflowY: 'scroll',
              width: '100%',
            }}
          >
            {products.map((p, index) => (
              <div
                key={index}
                ref={index === products.length - 1 ? lastProductRef : null}
              >
                <ArrivalSearchProductDetail
                  product={p}
                  setProducts={setProducts}
                  specialties={specialties}
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
