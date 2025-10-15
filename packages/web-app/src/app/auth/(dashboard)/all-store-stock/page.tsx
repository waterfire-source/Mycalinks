'use client';

import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { AllStoreStockTable } from '@/app/auth/(dashboard)/all-store-stock/components/AllStoreStockTable';

const AllProductPage = () => {
  return (
    <ContainerLayout title="全店舗在庫">
      <AllStoreStockTable />
    </ContainerLayout>
  );
};

export default AllProductPage;
