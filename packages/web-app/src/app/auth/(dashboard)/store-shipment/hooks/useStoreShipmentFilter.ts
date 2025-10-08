'use client';
import { createClientAPI } from '@/api/implement';
import { CustomError } from '@/api/implement';
import { useStore } from '@/contexts/StoreContext';
import { useParamsAsState } from '@/hooks/useParamsAsState';
import { useEffect, useState } from 'react';

type StaffInfo = {
  id: number;
  display_name: string;
};

export const useStoreShipmentFilter = () => {
  const { store } = useStore();
  const [startDate, setStartDate] = useParamsAsState('shipment_date_gte');
  const [endDate, setEndDate] = useParamsAsState('shipment_date_lt');
  const [staffAccountId, setStaffAccountId] = useParamsAsState('staff_account_id');
  
  const [staffList, setStaffList] = useState<StaffInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const apiClient = createClientAPI();

  const fetchStaffList = async () => {
    try {
      setLoading(true);
      const res = await apiClient.account.listAllAccounts();

      if (res instanceof CustomError) throw res;

      // 現在の店舗に関連するスタッフのみをフィルタ
      const storeStaff = res.filter(account => 
        account.stores.some(s => s.store_id === store.id)
      );

      setStaffList(storeStaff.map(account => ({
        id: account.id,
        display_name: account.display_name || account.email
      })));
    } catch (err) {
      console.error('Staff list fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (store.id) {
      fetchStaffList();
    }
  }, [store.id]);

  return {
    // 日付フィルタ
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    // スタッフフィルタ
    staffAccountId,
    setStaffAccountId,
    staffList,
    loading,
  };
};