import { useEffect, useState } from 'react';
import {
  ConsignmentClient,
  useConsignment,
} from '@/feature/consign/hooks/useConsignment';
import { ConsignmentClientTableContent } from '@/app/auth/(dashboard)/stock/consign/components/ConsignmentClientTableContent';

type SearchQuery = {
  productName?: string;
  consignmentUser?: string;
};

interface Props {
  searchQuery: SearchQuery;
  onOpenSalesHistory: (client: ConsignmentClient) => void;
  onOpenProductDetail: (client: ConsignmentClient) => void;
  onSearch: () => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export function ConsignmentClientTable({
  searchQuery,
  onOpenSalesHistory,
  onOpenProductDetail,
  onSearch,
  currentPage,
  setCurrentPage,
}: Props) {
  // ページング関連
  const [pageSize, setPageSize] = useState(20);

  const {
    isLoading,
    consignmentClients,
    fetchConsignmentClients,
    totalCountClients,
  } = useConsignment();

  // 初期データ取得
  useEffect(() => {
    fetchConsignmentClients({ enabled: true, includesSummary: true });
  }, [fetchConsignmentClients]);

  const productName =
    searchQuery.productName === '' ? undefined : searchQuery.productName;
  const consignmentClientFullName =
    searchQuery.consignmentUser === ''
      ? undefined
      : searchQuery.consignmentUser;

  // 検索実行（親から呼ばれる）
  useEffect(() => {
    fetchConsignmentClients({
      enabled: true,
      includesSummary: true,
      productName,
      consignmentClientFullName,
      take: pageSize,
      skip: 0,
    });
  }, [searchQuery.productName, searchQuery.consignmentUser]); // onSearchが変更されたときに実行

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchConsignmentClients({
      enabled: true,
      includesSummary: true,
      productName,
      consignmentClientFullName,
      take: pageSize,
      skip: (newPage - 1) * pageSize,
    });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    fetchConsignmentClients({
      enabled: true,
      includesSummary: true,
      productName,
      consignmentClientFullName,
      take: newPageSize,
      skip: 0,
    });
  };

  return (
    <ConsignmentClientTableContent
      data={consignmentClients || []}
      isLoading={isLoading}
      onOpenSalesHistory={onOpenSalesHistory}
      onOpenProductDetail={onOpenProductDetail}
      currentPage={currentPage}
      pageSize={pageSize}
      totalItems={totalCountClients}
      totalPages={Math.ceil(totalCountClients / pageSize)}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
    />
  );
}
