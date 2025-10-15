'use client';

import { useEffect, useState } from 'react';
import { OriginalPackCreateAddProductView } from '@/app/auth/(dashboard)/original-pack/create/components/addProduct/OriginalPackCreateAddProductView';
import { OriginalPackCreateConfirmView } from '@/app/auth/(dashboard)/original-pack/create/components/list/OriginalPackCreateConfirmView';
import { EnclosedProductProvider } from '@/app/auth/(dashboard)/original-pack/create/context/EnclosedProductContext';
import { useSearchParams } from 'next/navigation';

//オリパを作成する画面
export default function OriginalPackCreatePage() {
  // useEffect(() => {
  //   const fetchPrices = async () => {
  //     // products を適切な形式に整形
  //     const formattedProducts = products.map((product) => ({
  //       product_id: product.id, // product.id を product_id にマッピング
  //       stock_number: product.stock_number, // stock_number はそのまま
  //     }));

  //     const total = await fetchTotalWholesalePrice(store.id, formattedProducts);
  //     setTotalWholesalePrice(total || 0);
  //   };

  //   if (products.length > 0) {
  //     fetchPrices();
  //   }
  // }, [store.id, products, fetchTotalWholesalePrice]);

  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [view, setView] = useState<'addProduct' | 'confirm'>('addProduct');
  // urlにidがあったらConfirmViewから始める
  useEffect(() => {
    if (id) {
      setView('confirm');
    }
  }, [id]);

  return (
    <EnclosedProductProvider>
      {view === 'addProduct' && (
        <OriginalPackCreateAddProductView
          onConfirm={() => setView('confirm')}
        />
      )}
      {view === 'confirm' && (
        <OriginalPackCreateConfirmView onBack={() => setView('addProduct')} />
      )}
    </EnclosedProductProvider>
  );
}
