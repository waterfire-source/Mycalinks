import { createClientAPI, CustomError } from '@/api/implement';
import { RegisterSettlementKind } from '@prisma/client';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useMemo } from 'react';

type DrawerContent = {
  denomination: number;
  item_count: number;
};

export const useRegisterSettlement = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();

  // レジ精算の登録
  const createRegisterSettlement = useCallback(
    async (
      storeId: number,
      registerId: number,
      actualCashPrice: number,
      kind: RegisterSettlementKind,
      drawerContents: DrawerContent[],
    ) => {
      const res = await clientAPI.register.registerSettlement({
        storeId,
        registerId,
        actualCashPrice,
        kind,
        drawerContents,
      });

      if (res instanceof CustomError) {
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return null;
      }

      return res;
    },
    [clientAPI.register, setAlertState],
  );

  // レジ精算履歴一覧の取得
  const fetchRegisterSettlement = useCallback(
    async (
      storeId: number,
      kind?: RegisterSettlementKind,
      register_id?: number,
      today?: boolean,
      take?: number,
      skip?: number,
    ) => {
      const res = await clientAPI.register.listRegisterSettlement({
        storeId: storeId,
        kind: kind,
        register_id: register_id,
        today: today,
        take: take,
        skip: skip,
      });

      if (res instanceof CustomError) {
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return { settlements: [], totalCount: 0 };
      }
      return {
        settlements: res.settlements ?? [],
        totalCount: res.totalCount ?? 0,
      };
    },
    [clientAPI.register, setAlertState],
  );

  return {
    createRegisterSettlement,
    fetchRegisterSettlement,
  };
};
