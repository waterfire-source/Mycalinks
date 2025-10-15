import { LocationTableContent } from '@/app/auth/(dashboard)/location/components/LocationTableContent';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { useStore } from '@/contexts/StoreContext';
import { Location, useLocation } from '@/feature/location/hooks/useLocation';
import { Box } from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

type Props = {
  setSelectedLocation: Dispatch<SetStateAction<Location | undefined>>;
};

export const LocationTable = ({ setSelectedLocation }: Props) => {
  const { store } = useStore();
  const { locations, totalCount, getLocation, loading } = useLocation();

  const [whichLocationDeleteModalIsOpen, setWhichLocationDeleteModalIsOpen] =
    useState<Location | undefined>(undefined);
  // ページネーション状態
  const [currentPage, setCurrentPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(30);

  // ページネーションハンドラー
  const handleRowPerPageChange = (newRowPerPage: number) => {
    setRowPerPage(newRowPerPage);
    setCurrentPage(0); // ページサイズ変更時は先頭に戻る
  };

  const handlePrevPagination = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPagination = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const onClickRow = (location: Location) => {
    setSelectedLocation(location);
  };


  //キャンセル処理は一旦未定
  const release = () => {
    // releaseLocation(location.id, { products: location.products });
  };

  useEffect(() => {
    getLocation({
      take: rowPerPage,
      skip: currentPage * rowPerPage,
    });
  }, [store.id, currentPage, rowPerPage]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <LocationTableContent
        locations={locations}
        currentPage={currentPage}
        rowPerPage={rowPerPage}
        totalRow={totalCount}
        handleRowPerPageChange={handleRowPerPageChange}
        handlePrevPagination={handlePrevPagination}
        handleNextPagination={handleNextPagination}
        setWhichLocationDeleteModalIsOpen={setWhichLocationDeleteModalIsOpen}
        onClickRow={onClickRow}
        fetching={loading}
      />
      <ConfirmationDialog
        open={!!whichLocationDeleteModalIsOpen}
        onClose={() => setWhichLocationDeleteModalIsOpen(undefined)}
        title="ロケーションを破棄する"
        content="ロケーションに含まれている在庫を全て元の状態に戻し、ロケーションを破棄します。"
        onConfirm={release}
        confirmButtonText="破棄する"
        cancelButtonText="破棄しない"
      />
    </Box>
  );
};
