'use client';
import { useParamsAsState } from '@/hooks/useParamsAsState';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useEffect, useState } from 'react';
import { createClientAPI } from '@/api/implement';
import { CustomError } from '@/api/implement';
import { useStore } from '@/contexts/StoreContext';

type StaffInfo = {
  id: number;
  display_name: string;
};

export const StaffFilter = () => {
  const { store } = useStore();
  const [staffAccountId, setStaffAccountId] = useParamsAsState('staff_account_id');
  const [staffList, setStaffList] = useState<StaffInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const apiClient = createClientAPI();

  const fetchStaffList = async () => {
    try {
      setLoading(true);
      // 店舗のスタッフ一覧を取得するAPIを呼び出し
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

  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel
        id="staff-filter-label"
        sx={{ color: 'black' }}
      >
        担当者
      </InputLabel>
      <Select
        labelId="staff-filter-label"
        label="担当者"
        value={staffAccountId ?? ''}
        onChange={(e) => setStaffAccountId(e.target.value || '')}
        disabled={loading}
        sx={{
          '& .MuiInputBase-input': {
            color: 'black',
          },
        }}
      >
        <MenuItem value="">
          すべて
        </MenuItem>
        {staffList.map((staff) => (
          <MenuItem key={staff.id} value={staff.id.toString()}>
            {staff.display_name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};