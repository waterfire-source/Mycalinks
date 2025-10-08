import { CustomTable, ColumnDef } from '@/components/tables/CustomTable';
import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import {
  ReceptionsSearchState,
  ReservationReceptionType,
  ReceptionStatus,
} from '@/feature/booking';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { ReservationStatusReceptionTableSearch } from '@/feature/booking/component/product/modal/reservationStatusModal/ReservationStatusReceptionTableSearch';
import { Store } from '@prisma/client';
import { useMemo } from 'react';

interface Props {
  receptions: ReservationReceptionType[];
  isLoading: boolean;
  handleOpenReceptionDetailModal: (reception: ReservationReceptionType) => void;
  store: Store;
  fetchCustomerByMycaID: (
    storeID: number,
    mycaID?: number,
    mycaBarCode?: string,
  ) => Promise<void>;
  receptionsSearchState: ReceptionsSearchState;
  handleChangeReservationId: (newValue: number) => void;
  handleChangeCustomerName: (newValue: string) => void;
  handleChangeStatus: (newValue: ReceptionStatus) => void;
  handleChangeOrderBy: (newValue: string) => void;
  handleResetSearch: () => void;
}

export const ReservationStatusReceptionTable = ({
  receptions,
  isLoading,
  handleOpenReceptionDetailModal,
  store,
  fetchCustomerByMycaID,
  receptionsSearchState,
  handleChangeReservationId,
  handleChangeCustomerName,
  handleChangeStatus,
  handleChangeOrderBy,
  handleResetSearch,
}: Props) => {
  // ------------------- カラム定義 -------------------
  const columns: ColumnDef<ReservationReceptionType>[] = [
    {
      header: '予約番号',
      render: (item) => item.reservation_reception_id,
    },
    {
      header: '受付日時',
      render: (item) => {
        return (
          <Box display="flex" flexDirection="column" alignItems="flex-start">
            <Typography>
              {dayjs(item.created_at).format('YYYY/MM/DD')}
            </Typography>
            <Typography sx={{ fontSize: '12px' }}>
              {dayjs(item.created_at).format('HH:mm')}
            </Typography>
          </Box>
        );
      },
    },
    {
      header: '受け渡し日時',
      render: (item) => {
        return (
          <>
            {item.status === 'RECEIVED' && (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="flex-start"
              >
                <Typography>
                  {dayjs(item.updated_at).format('YYYY/MM/DD')}
                </Typography>
                <Typography sx={{ fontSize: '12px' }}>
                  {dayjs(item.updated_at).format('HH:mm')}
                </Typography>
              </Box>
            )}
          </>
        );
      },
    },
    {
      header: 'お客様氏名',
      render: (item) => item.customer?.full_name,
    },
    {
      header: 'フリガナ',
      render: (item) => item.customer?.full_name_ruby,
    },
    {
      header: '会員・非会員',
      render: (item) => {
        return item.customer?.myca_user_id ? '会員' : '非会員';
      },
    },
    {
      header: '連絡先',
      render: (item) => item.customer?.phone_number,
    },
    {
      header: '予約数',
      render: (item) => item.item_count,
    },
    {
      header: '',
      render: (item) => (
        <SecondaryButtonWithIcon
          onClick={() => handleOpenReceptionDetailModal(item)}
        >
          詳細
        </SecondaryButtonWithIcon>
      ),
      sx: { width: '150px' },
    },
  ];

  const filteredAndSortedReceptions = useMemo(() => {
    return receptions
      .filter((reception) => {
        const { reservationId, customerId, customerName, status } =
          receptionsSearchState;

        if (
          reservationId &&
          reception.reservation_reception_id !== reservationId
        )
          return false;
        if (customerId && reception.customer_id !== customerId) return false;

        if (customerName) {
          const fullName = reception.customer?.full_name ?? '';
          const fullNameRuby = reception.customer?.full_name_ruby ?? '';

          if (
            !fullName.includes(customerName) &&
            !fullNameRuby.includes(customerName)
          ) {
            return false;
          }
        }

        if (status !== ReceptionStatus.ALL) {
          if (
            status === ReceptionStatus.PENDING &&
            !['CREATED', 'DEPOSITED'].includes(reception.status)
          ) {
            return false;
          }

          if (
            status === ReceptionStatus.RECEIVED &&
            reception.status !== 'RECEIVED'
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const { orderBy } = receptionsSearchState;

        switch (orderBy) {
          case 'created_at_asc':
            return (a.created_at ?? '').localeCompare(b.created_at ?? '');
          case 'created_at_desc':
            return (b.created_at ?? '').localeCompare(a.created_at ?? '');
          default:
            return 0;
        }
      });
  }, [receptions, receptionsSearchState]);

  return (
    <Box
      sx={{
        borderTop: '8px solid',
        borderTopColor: 'primary.main',
        width: '100%',
      }}
    >
      <ReservationStatusReceptionTableSearch
        store={store}
        fetchCustomerByMycaID={fetchCustomerByMycaID}
        receptionsSearchState={receptionsSearchState}
        handleChangeReservationId={handleChangeReservationId}
        handleChangeCustomerName={handleChangeCustomerName}
        handleChangeStatus={handleChangeStatus}
        handleChangeOrderBy={handleChangeOrderBy}
        handleResetSearch={handleResetSearch}
      />
      <CustomTable<ReservationReceptionType>
        columns={columns}
        rows={filteredAndSortedReceptions}
        rowKey={(item) => item.id}
        isLoading={isLoading}
        sx={{
          borderBottomRightRadius: '8px',
          borderBottomLeftRadius: '8px',
        }}
      />
    </Box>
  );
};
