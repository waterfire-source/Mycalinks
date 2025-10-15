'use client';

import { useEffect, useState, useRef } from 'react';
import { Box } from '@mui/material';
import { useStore } from '@/contexts/StoreContext';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { useAccount } from '@/feature/account/hooks/useAccount';
import { useRegister } from '@/feature/register/hooks/useRegister';
import { useRegisterSettlement } from '@/feature/register/hooks/useRegisterSettlement';
import { RegisterAPIRes } from '@/api/frontend/register/api';
import { CheckHistoryDetailModal } from '@/app/auth/(dashboard)/register/checkHistory/components/CheckHistoryDetailModal';
import { CheckHistoryTable } from '@/app/auth/(dashboard)/register/checkHistory/components/CheckHistoryTable';
import { PaginationNav } from '@/components/pagination/PaginationNav';
import { useErrorAlert } from '@/hooks/useErrorAlert';

export type registerSettlementType =
  RegisterAPIRes['listRegisterSettlement']['settlements'][0];

export default function RegisterCheckHistoryPage() {
  const { store } = useStore();
  const { fetchAllAccounts } = useAccount();
  const { registers, fetchRegisterList } = useRegister();
  const { fetchRegisterSettlement } = useRegisterSettlement();
  const [accountMap, setAccountMap] = useState<Map<number, string>>(new Map());
  const [registerMap, setRegisterMap] = useState<Map<number, string>>(
    new Map(),
  );

  const [rows, setRows] = useState<registerSettlementType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<registerSettlementType | null>(
    null,
  );
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { handleError } = useErrorAlert();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // レジ一覧の取得
  useEffect(() => {
    if (!store?.id) return;
    fetchRegisterList(store.id, undefined, undefined);
  }, [fetchRegisterList, store?.id]);

  // 担当者名マッピング用Mapの作成
  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      const accounts = await fetchAllAccounts();
      if (Array.isArray(accounts)) {
        const map = new Map<number, string>();
        accounts.forEach((account) => {
          map.set(account.id, account.display_name ?? '');
        });
        setAccountMap(map);
      }
      setIsLoading(false);
    };
    fetch();
  }, [fetchAllAccounts]);

  // レジ名マッピング用Mapの作成
  useEffect(() => {
    const fetch = async () => {
      if (Array.isArray(registers)) {
        const map = new Map<number, string>();
        registers.forEach((reg) => {
          map.set(reg.id, reg.display_name ?? '');
        });
        setRegisterMap(map);
      }
    };
    fetch();
  }, [registers]);

  // 初回のtotalCount取得（フィルター条件変更時のみ）
  useEffect(() => {
    const fetchTotalCount = async () => {
      try {
        if (!store?.id) return;
        const res = await fetchRegisterSettlement(
          store.id,
          undefined, // kind
          undefined, // register_id
          undefined, // today
          1, // 最小取得数
          0, // skip
        );
        if (res && typeof res === 'object' && 'settlements' in res) {
          setTotalCount(res.totalCount);
        }
      } catch (error) {
        handleError(error);
      }
    };
    fetchTotalCount();
  }, [fetchRegisterSettlement, store.id]);

  // レジ点検一覧の取得
  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        if (!store?.id) {
          setRows([]);
          return;
        }
        const take = pageSize;
        const skip = (page - 1) * pageSize;

        const res = await fetchRegisterSettlement(
          store.id,
          undefined, // kind
          undefined, // register_id
          undefined, // today
          take,
          skip,
        );

        if (res && typeof res === 'object' && 'settlements' in res) {
          setRows(res.settlements);
        } else {
          setRows([]);
        }
      } catch (error) {
        handleError(error);
        setRows([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [fetchRegisterSettlement, store.id, page, pageSize]);

  useEffect(() => {
    if (tableContainerRef.current) {
      const scrollableElement = tableContainerRef.current.querySelector('.MuiTableContainer-root');
      if (scrollableElement) {
        scrollableElement.scrollTop = 0;
      }
    }
  }, [page]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <ContainerLayout title="レジ点検履歴">
      <Box
        ref={tableContainerRef}
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <CheckHistoryTable
          rows={rows}
          isLoading={isLoading}
          registerMap={registerMap}
          accountMap={accountMap}
          onRowClick={(row) => {
            setSelectedRow(row);
          }}
        />
        <PaginationNav
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalCount}
          onPageChange={(newPage) => {
            setPage(newPage);
          }}
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setPage(1);
          }}
        />

        <CheckHistoryDetailModal
          open={!!selectedRow}
          onClose={() => setSelectedRow(null)}
          settlement={selectedRow}
        />
      </Box>
    </ContainerLayout>
  );
}
