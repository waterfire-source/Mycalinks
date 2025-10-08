'use client';
import { ReservationViewList } from '@/app/mycalinks/(core)/components/ReservationView/ReservationViewList';
import {
  ViewConfig,
  ViewTypes,
} from '@/app/mycalinks/(core)/types/MembershipCardContent';
import { ReservationViewDetail } from '@/app/mycalinks/(core)/components/ReservationView/ReservationViewDetail';
import { Box } from '@mui/material';
import { useReservationView } from '@/app/mycalinks/(core)/components/ReservationView/useReservationView';
import { useEffect } from 'react';
import { PosCustomerInfo } from '@/app/mycalinks/(core)/types/customer';

interface Props {
  onBack: () => void;
  handleChangeView: (viewType: ViewTypes, id?: number) => void;
  currentView: ViewConfig;
  selectedStore: PosCustomerInfo | null;
  posCustomerStoresInfos: PosCustomerInfo['store'][] | null;
}

export const ReservationViewContainer = ({
  currentView,
  onBack,
  handleChangeView,
  selectedStore,
  posCustomerStoresInfos,
}: Props) => {
  const { reservations, isLoading, fetchReservations } = useReservationView();

  const handleDetailClick = (viewType: ViewTypes, id: number) => {
    handleChangeView(viewType, id);
  };

  // 予約一覧表示時のみフェッチ
  useEffect(() => {
    if (currentView.type === ViewTypes.RESERVATION_LIST) {
      fetchReservations(selectedStore?.store_id);
    }
  }, [currentView.type, fetchReservations, selectedStore?.store_id]);

  return (
    <Box sx={{ px: 2 }}>
      {currentView.type === ViewTypes.RESERVATION_LIST && (
        <ReservationViewList
          isLoading={isLoading}
          onBack={onBack}
          onDetailClick={handleDetailClick}
          reservations={reservations}
          posCustomerStoresInfos={posCustomerStoresInfos || []}
        />
      )}
      {currentView.type === ViewTypes.RESERVATION_DETAIL &&
        currentView.detailId != null && (
          <ReservationViewDetail
            onBack={() => handleChangeView(ViewTypes.RESERVATION_LIST)}
            reservations={reservations}
            reservationId={currentView.detailId}
            posCustomerStoresInfos={posCustomerStoresInfos || []}
          />
        )}
    </Box>
  );
};
