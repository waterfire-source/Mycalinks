import { LocationReleaseProductTableContent } from '@/app/auth/(dashboard)/location/[locationId]/release/components/LocationReleaseProductTableContent';
import { LocationProduct } from '@/app/auth/(dashboard)/location/register/page';
import { useState } from 'react';

type Props = { releaseProducts: LocationProduct[] };

export const LocationReleaseProductTable = ({ releaseProducts }: Props) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(30);

  // ページネーションハンドラー
  const handleRowPerPageChange = (newRowPerPage: number) => {
    setRowsPerPage(newRowPerPage);
    setCurrentPage(0); // ページサイズ変更時は先頭に戻る
  };

  const handlePrevPagination = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPagination = () => {
    setCurrentPage((prev) => prev + 1);
  };

  return (
    <LocationReleaseProductTableContent
      releaseProducts={releaseProducts}
      currentPage={currentPage}
      rowPerPage={rowsPerPage}
      handleRowPerPageChange={handleRowPerPageChange}
      handlePrevPagination={handlePrevPagination}
      handleNextPagination={handleNextPagination}
    />
  );
};
