import { CustomTab, TabDef } from '@/components/tabs/CustomTab';
import { ColumnDef } from '@/components/tabs/CustomTabTable';
import { InquiryTabHeader } from '@/feature/ec/inquiry/components/InquiryTabHeader';
import { InquiryTabTable } from '@/feature/ec/inquiry/components/InquiryTabTable';
import { Inquiry } from '@/feature/ec/inquiry/hooks/useInquiry';
import { InquirySearchState } from '@/feature/ec/inquiry/hooks/useInquirySearch';
import { Grid, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { EcOrderContactStatus } from '@prisma/client';
import dayjs from 'dayjs';
import {
  getLabelFromSortValue,
  InquiryStatus,
  OrderKindSortOptions,
} from '@/feature/ec/inquiry/const';

interface InquiryTableProps {
  inquiries: Inquiry | undefined;
  searchState: InquirySearchState;
  setSearchState: React.Dispatch<React.SetStateAction<InquirySearchState>>;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedInquiry: React.Dispatch<
    React.SetStateAction<Inquiry['orderContacts'][0] | null>
  >;
}

export const InquiryContent = ({
  inquiries,
  searchState,
  setSearchState,
  setIsModalOpen,
  setSelectedInquiry,
}: InquiryTableProps) => {
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const orderInquiries = useMemo(() => {
    if (!inquiries) return [];
    else if (order === 'asc') return [...inquiries.orderContacts];
    return [...inquiries.orderContacts].reverse();
  }, [inquiries, order]);

  const columns: ColumnDef<Inquiry['orderContacts'][0]>[] = [
    {
      header: '注文番号',
      key: 'orderId',
      render: (row) => row.orderId,
      isSortable: true,
    },
    {
      header: 'ステータス',
      key: 'status',
      render: (row) => {
        const color = InquiryStatus[row.status].color;
        const label = InquiryStatus[row.status].label;
        return (
          <Typography sx={{ color: color, fontWeight: 'bold' }}>
            {label}
          </Typography>
        );
      },
    },
    {
      header: '種類',
      key: 'kind',
      render: (row) => {
        return getLabelFromSortValue(row.kind as OrderKindSortOptions) || '';
      },
    },
    {
      header: '件名',
      key: 'title',
      render: (row) => row.title,
    },
    {
      header: '日付',
      key: 'difference',
      render: (row) => {
        return row.lastSentAt
          ? dayjs(row.lastSentAt).format('YYYY/MM/DD HH:mm')
          : '';
      },
      isSortable: true,
    },
  ];

  const inquiryStatusTabs = Object.values(InquiryStatus).map((status) => ({
    key: status.key,
    value: status.label,
  }));

  const tabs: TabDef[] = [
    { key: 'ALL', value: 'すべて' },
    ...inquiryStatusTabs,
  ];

  const onTabChange = (value: string) => {
    setSearchState((prev) => ({
      ...prev,
      status: value === 'ALL' ? undefined : (value as EcOrderContactStatus),
    }));
    setSelectedInquiry(null);
  };

  const onRowClick = (row: Inquiry['orderContacts'][0]) => {
    setIsModalOpen(true);
    setSelectedInquiry(row);
  };

  return (
    <Grid item xs={8} sx={{ height: '100%' }}>
      <CustomTab
        tabs={tabs}
        header={
          <InquiryTabHeader
            searchState={searchState}
            setSearchState={setSearchState}
            setOrder={setOrder}
          />
        }
        content={
          <InquiryTabTable
            columns={columns}
            rows={orderInquiries || []}
            rowKey={(item) => item.id}
            onRowClick={onRowClick}
            isLoading={searchState.isLoading}
          />
        }
        onTabChange={onTabChange}
      />
    </Grid>
  );
};
