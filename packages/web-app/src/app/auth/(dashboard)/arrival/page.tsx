'use client';
import { RegisterStockingButton } from '@/app/auth/(dashboard)/arrival/components/RegisterStockingButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { FilterBoxComponent } from '@/feature/arrival/manage/arrivalList/FilterBoxComponent';
import { TabComponent } from '@/feature/arrival/manage/arrivalList/TabComponents';
import { TableComponent } from '@/feature/arrival/manage/arrivalList/TableComponent';
import { SearchArrival } from '@/feature/arrival/manage/header/SearchArrival';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { Stack } from '@mui/material';
import { Stocking } from '@prisma/client';
import { MycaPosApiClient } from 'api-generator/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CsvOptionModal } from '@/app/auth/(dashboard)/arrival/components/CsvOptionModal';
import { CustomError } from '@/api/implement';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { PATH } from '@/constants/paths';
import { useSaveLocalStorageRegister } from '@/app/auth/(dashboard)/arrival/register/hooks/useSaveLocalStorageRegister';

const ArrivalPage = () => {
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();
  const { store } = useStore();
  const { push } = useRouter();
  // ローカルストレージ操作
  const { removeLocalStorageItemById } = useSaveLocalStorageRegister();

  const [loading, setLoading] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [taxType, setTaxType] = useState<'include' | 'exclude'>('include');
  // 復元確認モーダル表示
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  const searchParams = useSearchParams();
  const StartDate = searchParams.get('startDate');
  const EndDate = searchParams.get('endDate');

  // FilterBoxComponentからの日付データをpage内で管理
  const [dateRange, setDateRange] = useState({
    startDate: StartDate,
    endDate: EndDate,
  });

  useEffect(() => {
    setDateRange({
      startDate: StartDate,
      endDate: EndDate,
    });
  }, [StartDate, EndDate]);

  const mycaPosApiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });

  const csvDownload = async (selectedStatus?: Stocking['status']) => {
    try {
      setLoading(true);
      const res = await mycaPosApiClient.stocking.getStockingCsv({
        storeId: store.id,
        gte: dateRange.startDate
          ? new Date(dateRange.startDate + 'T00:00:00+09:00').toISOString()
          : undefined,
        lte: dateRange.endDate
          ? new Date(dateRange.endDate + 'T23:59:59+09:00').toISOString()
          : undefined,
        status: selectedStatus || undefined,
      });

      if (res instanceof CustomError) throw res;

      if (res.fileUrl) {
        setAlertState({
          severity: 'success',
          message: 'CSVダウンロードが完了しました',
        });

        push(res.fileUrl);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
      setCsvModalOpen(false);
    }
  };

  // 復元しない
  const handleRestoreModalCancel = () => {
    removeLocalStorageItemById(-1, taxType);
    push(`${PATH.ARRIVAL.register}?tax=${taxType}`);
  };

  return (
    <>
      <ContainerLayout
        title="発注管理"
        helpArchivesNumber={1325}
        actions={
          <Stack flexDirection="row" justifyContent="flex-end">
            <SecondaryButton
              onClick={() => setCsvModalOpen(true)}
              disabled={loading}
            >
              CSVダウンロード
            </SecondaryButton>
            <RegisterStockingButton
              setTaxType={setTaxType}
              setIsRestoreModalOpen={setIsRestoreModalOpen}
            />
          </Stack>
        }
      >
        <Stack gap="12px" height="100%">
          <SearchArrival />
          <TabComponent />
          <Stack sx={{ backgroundColor: 'white', flex: 1, overflow: 'scroll' }}>
            <FilterBoxComponent />
            <TableComponent />
          </Stack>
        </Stack>

        <CsvOptionModal
          open={csvModalOpen}
          onClose={() => setCsvModalOpen(false)}
          onDownload={csvDownload}
          loading={loading}
          dateRange={dateRange}
        />
      </ContainerLayout>

      {/* 新規作成localStorage復元確認モーダル */}
      <ConfirmationDialog
        open={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        title="入力データ復元"
        message="入力中のデータがあります。復元しますか？"
        confirmButtonText="復元"
        onConfirm={() => push(`${PATH.ARRIVAL.register}?tax=${taxType}`)}
        cancelButtonText="復元しない"
        onCancel={handleRestoreModalCancel}
      />
    </>
  );
};

export default ArrivalPage;
