'use client';

import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { ReservationProductUpperButtons } from '@/feature/booking/component/common';
import { useStore } from '@/contexts/StoreContext';
import { CustomerReceptionsList } from '@/feature/booking/component/bookingList';
import { CircularProgress } from '@mui/material';

const ListPage = () => {
  const { store } = useStore();
  return (
    <ContainerLayout
      title="受付済み予約一覧"
      helpArchivesNumber={2969}
      isFullWidthTitle={false}
      actions={
        <ReservationProductUpperButtons store={store} canCreate={false} />
      }
    >
      {!store ? <CircularProgress /> : <CustomerReceptionsList store={store} />}
    </ContainerLayout>
  );
};

export default ListPage;
