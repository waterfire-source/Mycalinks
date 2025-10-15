'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  IconButton,
  styled,
  Typography,
} from '@mui/material';
import { CustomerSearchField } from '@/feature/customer/components/CustomerSearchField';
import { Store } from '@prisma/client';
import { FaTimes } from 'react-icons/fa';
import { BackendCustomerAPI } from '@/app/api/store/[store_id]/customer/api';
import { useAccountGroupContext } from '@/contexts/AccountGroupProvider';
import { OpenMemoModalButton } from '@/feature/customer/components/OpenMemoModalButton';
import { HelpIcon } from '@/components/common/HelpIcon';

interface CustomerCardProps {
  customer?:
    | BackendCustomerAPI['0']['response']['200']
    | BackendCustomerAPI['1']['response']['200'][0]
    | null;
  store: Store;
  fetchCustomerByMycaID: (
    storeID: number,
    mycaID?: number,
    mycaBarCode?: string,
  ) => Promise<void>;
  resetCustomer: () => void;
  isSale?: boolean; // 販売ページかどうか
}

const TableHeadCell = styled(TableCell)({
  height: '56px',
  padding: '0',
  textAlign: 'center',
});

const TableBodyCell = styled(TableCell)({
  height: '56px',
  padding: '0',
  textAlign: 'center',
});

export const CustomerSmallCard: React.FC<CustomerCardProps> = ({
  customer,
  store,
  fetchCustomerByMycaID,
  resetCustomer,
  isSale,
}) => {
  const { accountGroup } = useAccountGroupContext();
  const canReadCustomerInfo = accountGroup?.get_transaction_customer_info;
  return (
    <TableContainer
      component={Paper}
      sx={{ boxShadow: 3 }}
      data-testid="customer-info-table"
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell sx={{ color: 'white !important' }}>
              会員番号
            </TableHeadCell>
            <TableHeadCell sx={{ color: 'white !important' }}>
              会員名
            </TableHeadCell>
            <TableHeadCell sx={{ color: 'white !important' }}>
              フリガナ
            </TableHeadCell>
            <TableHeadCell sx={{ color: 'white !important' }}>
              利用可能ポイント
            </TableHeadCell>
            <TableHeadCell sx={{ width: '150px' }}></TableHeadCell>
            <TableHeadCell sx={{ width: '50px' }}> </TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {customer ? (
            <TableRow>
              <TableBodyCell data-testid="customer-id">
                {canReadCustomerInfo ? (
                  customer.myca_user_id ? (
                    customer.id
                  ) : (
                    <Typography color="primary">非会員</Typography>
                  )
                ) : (
                  '●●●●●●'
                )}
              </TableBodyCell>
              <TableBodyCell data-testid="customer-name">
                {customer.full_name}
              </TableBodyCell>
              <TableBodyCell data-testid="customer-furigana">
                {customer.full_name_ruby}
              </TableBodyCell>
              <TableBodyCell data-testid="customer-points">
                {canReadCustomerInfo
                  ? customer.owned_point.toLocaleString()
                  : '●●●●●●'}
                pt
              </TableBodyCell>
              <TableBodyCell sx={{ color: 'white !important' }}>
                <OpenMemoModalButton
                  customerId={customer.id}
                  storeId={store.id}
                />
              </TableBodyCell>
              <TableBodyCell>
                <IconButton onClick={resetCustomer} aria-label="リセット">
                  <FaTimes size={10} />
                </IconButton>
              </TableBodyCell>
            </TableRow>
          ) : (
            <TableRow>
              <TableBodyCell colSpan={6}>
                <Stack
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                >
                  {isSale && (
                    <HelpIcon
                      helpArchivesNumber={2400}
                      sx={{ marginRight: '8px' }}
                    />
                  )}
                  <CustomerSearchField
                    store={store}
                    fetchCustomerByMycaID={fetchCustomerByMycaID}
                    isShowInputField={true}
                  />
                </Stack>
              </TableBodyCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
