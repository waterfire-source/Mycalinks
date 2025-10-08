'use client';

import { Grid } from '@mui/material';
import { ConsignmentProductSearchType } from '@/feature/consign/components/register/searchModal/type';
import { ConsignmentClient } from '@/feature/consign/hooks/useConsignment';
import { ConsignmentProductAddModal } from '@/feature/consign/components/register/searchModal/Modal';
import { ProductSection } from '@/app/auth/(dashboard)/stock/consign/register/components/ProductSection';
import { ConsignorSummarySection } from '@/app/auth/(dashboard)/stock/consign/register/components/ConsignorSummarySection';

interface ConsignmentRegisterContentProps {
  products: ConsignmentProductSearchType[];
  selectedConsignmentClient: ConsignmentClient | null;
  isSubmitting: boolean;
  isModalOpen: boolean;
  consignmentClients: ConsignmentClient[] | undefined;
  onEdit: (
    id: string,
    key: 'consignmentPrice' | 'consignmentCount',
    value: number,
  ) => void;
  onDelete: (id: string) => void;
  onAddProduct: () => void;
  onCloseModal: () => void;
  onConfirmOrder: () => Promise<void>;
  onConsignmentClientChange: (client: ConsignmentClient | null) => void;
  setProducts: React.Dispatch<
    React.SetStateAction<ConsignmentProductSearchType[]>
  >;
}

export function ConsignmentRegisterContent({
  products,
  selectedConsignmentClient,
  isSubmitting,
  isModalOpen,
  consignmentClients,
  onEdit,
  onDelete,
  onAddProduct,
  onCloseModal,
  onConfirmOrder,
  onConsignmentClientChange,
  setProducts,
}: ConsignmentRegisterContentProps) {
  return (
    <>
      <Grid container spacing={2} sx={{ height: '100%', overflow: 'hidden' }}>
        <Grid
          item
          xs={12}
          md={7}
          sx={{ height: 'calc(100% - 40px)' }}
          mt="40px"
        >
          <ProductSection
            products={products}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddProduct={onAddProduct}
          />
        </Grid>

        <Grid
          item
          xs={12}
          md={5}
          sx={{ height: 'calc(100% - 40px)' }}
          mt="40px"
        >
          <ConsignorSummarySection
            products={products}
            selectedConsignmentClient={selectedConsignmentClient}
            consignmentClients={consignmentClients}
            isSubmitting={isSubmitting}
            onConfirmOrder={onConfirmOrder}
            onConsignmentClientChange={onConsignmentClientChange}
          />
        </Grid>
      </Grid>

      {/* 商品追加モーダル */}
      <ConsignmentProductAddModal
        open={isModalOpen}
        onClose={onCloseModal}
        setProducts={setProducts}
      />
    </>
  );
}
