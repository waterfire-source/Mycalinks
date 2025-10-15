'use client';

import { ECOrderTable } from '@/app/auth/(dashboard)/ec/list/components/EcOrderTable';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';

export default function ECOrderListPage() {
  return (
    <ContainerLayout title="注文一覧" helpArchivesNumber={2726}>
      <ECOrderTable />
    </ContainerLayout>
  );
}
