'use client';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { StoreShipmentTabTableContent } from '@/app/auth/(dashboard)/store-shipment/components/StoreShipmentTabTableContent';
import {
  ShipmentInfo,
  useGetShipmentInfo,
} from '@/app/auth/(dashboard)/store-shipment/hooks/useGetShipmentInfo';
import { ShipmentProduct } from '@/app/auth/(dashboard)/store-shipment/register/page';
import { useGetAllStore } from '@/app/auth/(dashboard)/store-shipment/hooks/useGetAllStore';
import { useStoreShipmentFilter } from '@/app/auth/(dashboard)/store-shipment/hooks/useStoreShipmentFilter';
import { useParamsAsState } from '@/hooks/useParamsAsState';
import { customDayjs } from 'common';

type Props = {
  storeShipments: ShipmentInfo['storeShipments'];
  setWhichStoreShipmentDetailIsOpen: Dispatch<
    SetStateAction<number | undefined>
  >;
};

export const StoreShipmentTabTable = ({
  storeShipments,
  setWhichStoreShipmentDetailIsOpen,
}: Props) => {
  const { apiProductToShipmentProduct } = useGetShipmentInfo();
  const { fetchAllStores, allStores } = useGetAllStore();
  const { startDate, endDate, staffAccountId } = useStoreShipmentFilter();
  const [sortOrder] = useParamsAsState('sort_order');

  const [rows, setRows] = useState<ShipmentInfo['storeShipments']>([]);
  const [allProducts, setAllProducts] = useState<ShipmentProduct[]>([]);

  const handleClickRow = (shipmentId: number) => {
    setWhichStoreShipmentDetailIsOpen(shipmentId);
  };

  const fetchAllProducts = async () => {
    const allProductsApiData = storeShipments.flatMap((s) => s.products);
    const allProducts = await apiProductToShipmentProduct(allProductsApiData);

    setAllProducts(allProducts || []);
  };

  const applyFilters = (shipments: ShipmentInfo['storeShipments']) => {
    let filteredShipments = [...shipments];

    // 日付フィルタ（出荷日）
    if (startDate) {
      const startDateObj = customDayjs(startDate).startOf('day').toDate();
      filteredShipments = filteredShipments.filter(
        (shipment) =>
          customDayjs(shipment.shipment_date).toDate() >= startDateObj,
      );
    }

    if (endDate) {
      const endDateObj = customDayjs(endDate).endOf('day').toDate();
      filteredShipments = filteredShipments.filter(
        (shipment) =>
          customDayjs(shipment.shipment_date).toDate() <= endDateObj,
      );
    }

    if (staffAccountId) {
      const staffId = parseInt(staffAccountId, 10);
      filteredShipments = filteredShipments.filter(
        (shipment) => shipment.staff_account_id === staffId,
      );
    }

    return filteredShipments;
  };

  useEffect(() => {
    const filteredData = applyFilters(storeShipments);
    // sort_orderパラメータに基づいてソート
    const sortedData = filteredData.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      
      if (sortOrder === 'asc') {
        return dateA - dateB; // 昇順（古い順）
      } else {
        return dateB - dateA; // 降順（新しい順）- デフォルト
      }
    });
    setRows(sortedData);
    fetchAllStores();
    fetchAllProducts();
  }, [storeShipments, startDate, endDate, staffAccountId, sortOrder]);

  return (
    <StoreShipmentTabTableContent
      rows={rows}
      allProducts={allProducts}
      allStores={allStores}
      handleClickRow={handleClickRow}
    />
  );
};
