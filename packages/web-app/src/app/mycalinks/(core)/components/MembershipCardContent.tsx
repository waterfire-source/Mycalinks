'use client';

import { PosCustomerInfo } from '@/app/mycalinks/(core)/types/customer';
import {
  ViewTypes,
  ViewConfig,
} from '@/app/mycalinks/(core)/types/MembershipCardContent';
import { StoreMenuContainer } from '@/app/mycalinks/(core)/components/StoreMenu/StoreMenuContainer';
import { PointCardContainer } from '@/app/mycalinks/(core)/components/PointCardContainer';
import { useMemo, useState } from 'react';
import { ReservationViewContainer } from '@/app/mycalinks/(core)/components/ReservationView/ReservationViewContainer';
import { PurchaseInfoContainer } from '@/app/mycalinks/(core)/components/PurchaseInfo/PurchaseInfoContainer';

interface MembershipCardContentProps {
  barcodeValue: string;
  posCustomerInfo: PosCustomerInfo[];
  selectedStore: PosCustomerInfo | null;
  getBarcodeToken: () => void;
}

export const MembershipCardContent = ({
  barcodeValue,
  posCustomerInfo,
  selectedStore,
  getBarcodeToken,
}: MembershipCardContentProps) => {
  const [currentView, setCurrentView] = useState<ViewConfig>({
    type: ViewTypes.TOP,
  });
  const handleChangeView = (viewType: ViewTypes, id?: number) => {
    setCurrentView({ type: viewType, detailId: id });
  };

  const handleBack = () => {
    setCurrentView({ type: ViewTypes.TOP });
  };

  // 顧客が持つ店舗情報(id,name,url)
  const posCustomerStoresInfos: NonNullable<PosCustomerInfo['store']>[] =
    useMemo(
      () =>
        posCustomerInfo
          .map((p) => p.store)
          .filter((s): s is NonNullable<PosCustomerInfo['store']> =>
            Boolean(s?.id),
          ),
      [posCustomerInfo],
    );

  return (
    <>
      {/* TOP */}
      {currentView.type === ViewTypes.TOP && (
        <>
          {/* ポイントカード */}
          <PointCardContainer
            barcodeValue={barcodeValue}
            posCustomerInfo={posCustomerInfo}
            selectedStore={selectedStore}
            getBarcodeToken={getBarcodeToken}
          />

          {/* 店舗メニュー */}
          <StoreMenuContainer onMenuClick={handleChangeView} />
        </>
      )}

      {/* 予約 */}
      {(currentView.type === ViewTypes.RESERVATION_LIST ||
        currentView.type === ViewTypes.RESERVATION_DETAIL) && (
        <ReservationViewContainer
          currentView={currentView}
          onBack={handleBack}
          handleChangeView={handleChangeView}
          selectedStore={selectedStore}
          posCustomerStoresInfos={posCustomerStoresInfos}
        />
      )}

      {/* 買取情報 */}
      {currentView.type === ViewTypes.PURCHASE_INFO && (
        <PurchaseInfoContainer
          onBack={handleBack}
          currentView={currentView}
          posCustomerStoresInfos={posCustomerStoresInfos}
          selectedStoreId={selectedStore?.store_id || null}
        />
      )}
    </>
  );
};
