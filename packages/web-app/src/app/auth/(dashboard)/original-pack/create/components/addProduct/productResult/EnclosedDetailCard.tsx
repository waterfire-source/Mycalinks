import { useEffect, useRef } from 'react';
import { DetailCard } from '@/components/cards/DetailCard';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { Stack } from '@mui/material';
import { CancelButton } from '@/components/buttons/CancelButton';
import { EnclosedProductView } from '@/app/auth/(dashboard)/original-pack/create/components/addProduct/productResult/EnclosedProductView';
import { EnclosedProduct } from '@/app/auth/(dashboard)/original-pack/create/components/addProduct/enclosedProduct/EnclosedSelectModal';
import { SetStateAction } from 'react';
import { Dispatch } from 'react';
import { useSearchParams } from 'next/navigation';

interface Props {
  selectedProducts: EnclosedProduct[];
  setSelectedProducts: Dispatch<SetStateAction<EnclosedProduct[]>>;
  onClose: () => void;
}
export const EnclosedDetailCard = ({
  selectedProducts,
  setSelectedProducts,
  onClose,
}: Props) => {
  // 封入商品の合計点数
  const totalCount = selectedProducts.reduce(
    (sum, p) => sum + (p.item_count ?? 0),
    0,
  );
  // 封入商品の商品数
  const productCount = selectedProducts.length;

  // 商品追加時のオートフォーカス処理
  const lastItemRef = useRef<HTMLDivElement | null>(null);
  const prevLengthRef = useRef<number>(selectedProducts.length);
  useEffect(() => {
    // 商品の削除時には発火しないように、直前の商品リストの数と比較して増えている場合のみ下までスクロールする
    if (
      selectedProducts.length > prevLengthRef.current &&
      lastItemRef.current
    ) {
      lastItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    prevLengthRef.current = selectedProducts.length; // 比較用に現在の商品リスト数を保存
  }, [selectedProducts.length]);

  const searchParams = useSearchParams();
  const isReplenishment = searchParams.get('replenishment') === 'true';
  return (
    <DetailCard
      title={isReplenishment ? '補充商品' : '封入商品'}
      titleDetail={`${totalCount}点${productCount}商品`}
      content={
        <Stack gap="12px">
          {selectedProducts.map((product, index) => (
            <div
              key={product.id}
              ref={index === selectedProducts.length - 1 ? lastItemRef : null}
            >
              <EnclosedProductView
                key={product.id}
                product={product}
                setSelectedProducts={setSelectedProducts}
              />
            </div>
          ))}
        </Stack>
      }
      bottomContent={
        <Stack
          direction="row"
          justifyContent="flex-end"
          width="100%"
          gap="12px"
        >
          <CancelButton onClick={() => setSelectedProducts([])}>
            登録内容を破棄
          </CancelButton>
          <PrimaryButton onClick={onClose}>
            {isReplenishment ? '上記商品を補充' : '上記商品を封入'}
          </PrimaryButton>
        </Stack>
      }
    ></DetailCard>
  );
};
