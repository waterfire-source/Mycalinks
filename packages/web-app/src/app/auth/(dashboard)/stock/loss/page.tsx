'use client';

import { useState, useEffect } from 'react';
import { Box, Stack } from '@mui/material';
import DataTable from '@/components/tables/DataTable';
import { GridColDef } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';
import LossClassificationModal from '@/feature/products/loss/components/LossClassificationModal';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { PATH } from '@/constants/paths';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { useLossGenres } from '@/feature/products/loss/hooks/useListLossGenres';
import { useLossItems } from '@/feature/products/loss/hooks/useLossItems';
import { StaffFilter } from '@/app/auth/(dashboard)/stock/loss/components/StaffFilter';
import { LossGenreFilter } from '@/app/auth/(dashboard)/stock/loss/components/LossGenreFilter';
import { SortFilter } from '@/app/auth/(dashboard)/stock/loss/components/SortFilter';
import { DateRangeFilter } from '@/app/auth/(dashboard)/stock/loss/components/DateRangeFilter';
import LossSearchField from '@/app/auth/(dashboard)/stock/loss/components/LossSearchField';
import { useAccount } from '@/feature/account/hooks/useAccount';
import { BackendAccountAPI } from '@/app/api/account/api';
import { ItemText } from '@/feature/item/components/ItemText';
import dayjs from 'dayjs';
import { MycaPosApiClient } from 'api-generator/client';
import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { CustomError } from '@/api/implement';
import { CsvDownloadModal } from '@/app/auth/(dashboard)/stock/loss/components/CsvDownloadModal';
import { customDayjs } from 'common';

const columns: GridColDef[] = [
  {
    field: 'image',
    headerName: '画像',
    minWidth: 60,
    flex: 0.1,
    renderCell: (params) => <ItemImage fill imageUrl={params.value} />,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'displayNameWithMeta',
    headerName: '商品名',
    minWidth: 200,
    flex: 0.2,
    headerAlign: 'left',
    align: 'left',
    renderCell: (params) => <ItemText text={params.value} />,
  },
  {
    field: 'conditionOptionDisplayName',
    headerName: '状態',
    minWidth: 100,
    flex: 0.2,
    headerAlign: 'left',
    align: 'left',
  },
  {
    field: 'lossGenreDisplayName',
    headerName: 'ロス区分',
    minWidth: 150,
    flex: 0.2,
    headerAlign: 'left',
    align: 'left',
  },
  {
    field: 'itemCount',
    headerName: '数量',
    type: 'number',
    minWidth: 70,
    flex: 0.1,
    headerAlign: 'left',
    align: 'left',
  },
  {
    field: 'datetime',
    headerName: '発生日',
    minWidth: 150,
    flex: 0.1,
    headerAlign: 'left',
    align: 'left',
    valueFormatter: (params: string | Date) => {
      return dayjs(params).format('YYYY/MM/DD');
    },
  },
  {
    field: 'staffAccountDisplayName',
    headerName: '担当者',
    minWidth: 120,
    flex: 0.1,
    headerAlign: 'left',
    align: 'left',
  },
  {
    field: 'reason',
    headerName: '理由',
    minWidth: 200,
    flex: 0.1,
    headerAlign: 'left',
    align: 'left',
  },
];

export default function LossPage() {
  const router = useRouter();
  const { store } = useStore();
  const { lossGenres, fetchLossGenres } = useLossGenres();
  const { fetchAllAccounts } = useAccount();
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();
  const {
    lossItems,
    fetchLossItems,
    setLossGenreId,
    setStaffAccountId,
    setDatetimeGte,
    setDatetimeLte,
    updateOrderBy,
    executeSearch,
    reason,
    displayName,
    setReason,
    setDisplayName,
    paginationModel,
    setPaginationModel,
    handlePaginationModelChange,
    totalCount,
  } = useLossItems();

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLossGenre, setSelectedLossGenre] = useState<number | null>(
    null,
  );
  const [accounts, setAccounts] =
    useState<BackendAccountAPI[0]['response']['accounts']>();
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
  const [selectedDatetimeGte, setSelectedDatetimeGte] = useState<Date | null>(
    null,
  );
  const [selectedDatetimeLte, setSelectedDatetimeLte] = useState<Date | null>(
    null,
  );
  const [selectedSortOption, setSelectedSortOption] =
    useState<string>('-datetime');

  // CSVダウンロード
  const [isDownloading, setIsDownloading] = useState(false);
  // CSV種類選択用のstate
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  // CSVダウンロード選択画面を開く
  const handleClickDownload = () => {
    setCsvDialogOpen(true);
  };

  const mycaPosApiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });

  const handleDownloadCsv = async () => {
    try {
      setLoading(true);

      const res = await mycaPosApiClient.loss.getLossCsv({
        storeId: store.id,
        staffId: selectedStaff || undefined,
        targetDayGte: selectedDatetimeGte
          ? customDayjs(selectedDatetimeGte).tz().startOf('day').utc().format()
          : '',
        targetDayLte: selectedDatetimeLte
          ? customDayjs(selectedDatetimeLte).tz().endOf('day').utc().format()
          : '',
        lossGenreId: selectedGenreId || undefined,
        lossCategoryId: selectedCategoryId || undefined,
      });

      if (res instanceof CustomError) throw res;

      setAlertState({
        message: 'CSVダウンロードが完了しました',
        severity: 'success',
      });

      router.push(res.fileUrl);
      setCsvDialogOpen(false);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLossGenreChange = (lossGenreId: number | null) => {
    setSelectedLossGenre(lossGenreId);
    setLossGenreId(lossGenreId);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleStaffChange = (staffId: number | null) => {
    setSelectedStaff(staffId);
    setStaffAccountId(staffId);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleDatetimeGteChange = (date: Date | null) => {
    setSelectedDatetimeGte(date);
    setDatetimeGte(date);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleDatetimeLteChange = (date: Date | null) => {
    setSelectedDatetimeLte(date);
    setDatetimeLte(date);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleSearch = (searchParams: {
    reason: string;
    displayName: string;
  }) => {
    executeSearch(searchParams);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  // 並べ替え
  const handleSortChange = (sortOption: string | null) => {
    if (sortOption === null) {
      const defaultSortOption = '';
      setSelectedSortOption(defaultSortOption);
      updateOrderBy('datetime', 'desc');
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
      return;
    }

    setSelectedSortOption(sortOption);

    // `-` がついているかで昇順降順を判断
    const key = sortOption.replace(/^-/, '');
    const mode = sortOption.startsWith('-') ? 'desc' : 'asc';
    updateOrderBy(key, mode);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  // 初期データ取得
  useEffect(() => {
    fetchLossGenres();
  }, [fetchLossGenres]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const accounts = await fetchAllAccounts();
      setAccounts(accounts);
    };
    fetchAccounts();
  }, [fetchAllAccounts]);

  // データ取得 - 検索条件またはページネーション変更時
  useEffect(() => {
    fetchLossItems();
  }, [
    selectedLossGenre,
    selectedStaff,
    selectedDatetimeGte,
    selectedDatetimeLte,
    selectedSortOption,
    fetchLossItems,
    paginationModel.page,
    paginationModel.pageSize,
  ]);

  return (
    <ContainerLayout
      title="ロス一覧"
      helpArchivesNumber={728}
      actions={
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'left',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: '20px',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <SecondaryButtonWithIcon
              onClick={handleClickDownload}
              loading={loading}
            >
              CSVダウンロード
            </SecondaryButtonWithIcon>
            <SecondaryButtonWithIcon onClick={() => setIsModalOpen(true)}>
              ロス区分追加・編集
            </SecondaryButtonWithIcon>
            <PrimaryButtonWithIcon
              sx={{ width: '150px' }}
              onClick={() => router.push(PATH.STOCK.loss.register)}
            >
              新規登録
            </PrimaryButtonWithIcon>
          </Box>
        </Box>
      }
    >
      <Box
        sx={{
          gap: '10px',
          flexGrow: 1,
          borderTop: '8px solid #b82a2a',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            backgroundColor: 'white',
          }}
        >
          <Stack
            direction="row"
            sx={{
              width: '100%',
              p: '12px',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Stack direction="column" sx={{ width: '100%', gap: 2 }}>
              {/* 第1行: 検索フィールド（商品名・ロス理由・検索ボタン） */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  width: '100%',
                  alignItems: 'center',
                }}
              >
                <LossSearchField
                  onSearch={handleSearch}
                  initialReason={reason}
                  initialDisplayName={displayName}
                  sx={{ flexGrow: 1 }}
                />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  width: '100%',
                  alignItems: 'center',
                }}
              >
                {/* 第2行: ロス区分、担当者、発生日 */}
                <LossGenreFilter
                  selectedLossGenre={selectedLossGenre}
                  lossGenres={lossGenres}
                  onChange={handleLossGenreChange}
                />
                <StaffFilter
                  selectedStaff={selectedStaff}
                  accounts={accounts}
                  onChange={handleStaffChange}
                />
                <DateRangeFilter
                  selectedDatetimeGte={selectedDatetimeGte}
                  selectedDatetimeLte={selectedDatetimeLte}
                  onGteChange={handleDatetimeGteChange}
                  onLteChange={handleDatetimeLteChange}
                />
              </Box>
            </Stack>
            <Box sx={{ width: '200px', height: '100%' }}>
              <SortFilter
                selectedSortOption={selectedSortOption}
                onChange={handleSortChange}
              />
            </Box>
          </Stack>
        </Box>
        {/* テーブル */}
        <DataTable
          columns={columns}
          rows={lossItems}
          sx={{
            width: '100%',
            flexGrow: 1,
            alignSelf: 'center',
            minHeight: 400,
          }}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          totalCount={totalCount}
        />
      </Box>

      <LossClassificationModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        updateLossGenres={fetchLossGenres}
      />

      {/* CSV種類選択モーダル */}
      <CsvDownloadModal
        open={csvDialogOpen}
        onClose={() => setCsvDialogOpen(false)}
        onDownload={handleDownloadCsv}
        selectedGenreId={selectedGenreId}
        setSelectedGenreId={setSelectedGenreId}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
        isDownloading={isDownloading}
      />
    </ContainerLayout>
  );
}
