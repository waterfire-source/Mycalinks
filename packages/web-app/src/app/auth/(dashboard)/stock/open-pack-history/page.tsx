'use client';

import { useState } from 'react';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { OpenPackHistoryTable } from '@/app/auth/(dashboard)/stock/open-pack-history/components/OpenPackHistoryTable';

export default function OpenPackHistoryPage() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  return (
    <ContainerLayout title="パック開封履歴">
      <OpenPackHistoryTable
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
      ></OpenPackHistoryTable>
    </ContainerLayout>
  );
}
