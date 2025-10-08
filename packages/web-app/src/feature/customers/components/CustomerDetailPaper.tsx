'use client';
import { Table, TableContainer, Box } from '@mui/material';
import dayjs from 'dayjs';
import { CustomerData } from '@/app/auth/(dashboard)/customers/page';
import { DetailInformationTable } from '@/components/tables/DetailInformationTable';
import { TransactionKind } from '@prisma/client';
import TagLabel from '@/components/common/TagLabel';

interface Props {
  customer: CustomerData;
  transactionCounts: TransactionCounts;
  totalAmount: TotalAmount;
  stats: {
    groupByItemGenreTransactionKind?: Array<DepartmentTransactionKind>;
  };
}

export interface TransactionCounts {
  visit: number;
  sell: number;
  buy: number;
}

export interface TotalAmount {
  buy: number;
  sell: number;
}

export interface DepartmentTransactionKind {
  transaction_kind: TransactionKind;
  genre_display_name: string | null;
  total_count: number; //合計数
}

// 顧客の詳細情報を表示する部分
export const CustomerDetailPaper = ({
  customer,
  transactionCounts,
  totalAmount,
  stats,
}: Props) => {
  const transactionGenreTag = (item: DepartmentTransactionKind) => {
    return (
      <TagLabel
        backgroundColor={
          item.transaction_kind === 'sell' ? 'secondary.main' : 'primary.main'
        }
        color="white"
        width="50px"
        height="80%"
        fontSize="0.875rem"
        borderRadius="8px"
      >
        {item.transaction_kind === 'sell' ? '販売' : '買取'}
      </TagLabel>
    );
  };
  return (
    <Box sx={{ width: '100%', flexGrow: 1, overflow: 'auto' }}>
      <TableContainer
        sx={{
          height: 'calc(100% - 80px)',
          width: '90%',
          my: 5,
          mx: '5%',
        }}
      >
        <Table stickyHeader>
          <DetailInformationTable
            headerBackgroundColor="grey"
            headerTextColor="white"
            attributeBackgroundColor="grey"
            attributeTextColor="white"
            header="基本情報"
            attributes={[
              '会員番号',
              '氏名',
              'フリガナ',
              '生年月日',
              '郵便番号',
              '住所',
              '電話番号',
              '所有ポイント数',
            ]}
            displayValues={[
              customer.myca_user_id ? customer.id : '非会員',
              customer.full_name,
              customer.full_name_ruby,
              customer.birthday
                ? `${dayjs(customer.birthday).format(
                    'YYYY/MM/DD',
                  )} (${dayjs().diff(customer.birthday, 'year')})`
                : null,
              customer.zip_code
                ? `${customer.zip_code.slice(0, 3)}-${customer.zip_code.slice(
                    3,
                  )}`
                : null,
              customer.address,
              customer.phone_number,
              customer.owned_point,
            ]}
          />
          <DetailInformationTable
            headerBackgroundColor="grey"
            headerTextColor="white"
            attributeBackgroundColor="grey"
            attributeTextColor="white"
            header="来店情報"
            attributes={[
              '最終来店日時',
              '来店回数',
              '販売回数',
              '買取回数',
              '総販売額',
              '総買取額',
            ]}
            displayValues={[
              customer.lastUsedDate
                ? dayjs(customer.lastUsedDate).format('YYYY/MM/DD HH:mm')
                : null,
              transactionCounts.visit,
              transactionCounts.sell,
              transactionCounts.buy,
              totalAmount.sell
                ? `${totalAmount.sell.toLocaleString()}円`
                : '0円',
              totalAmount.buy ? `${totalAmount.buy.toLocaleString()}円` : '0円',
            ]}
          />
          <DetailInformationTable
            headerBackgroundColor="grey"
            headerTextColor="white"
            attributeBackgroundColor="grey"
            attributeTextColor="white"
            header="取引種類"
            attributes={
              stats.groupByItemGenreTransactionKind &&
              stats.groupByItemGenreTransactionKind.length > 0
                ? stats.groupByItemGenreTransactionKind
                    .sort((a, b) => b.total_count - a.total_count)
                    .map((item) => {
                      return (
                        <>
                          {item.genre_display_name} {transactionGenreTag(item)}
                        </>
                      );
                    })
                : ['-']
            }
            displayValues={
              stats.groupByItemGenreTransactionKind &&
              stats.groupByItemGenreTransactionKind.length > 0
                ? stats.groupByItemGenreTransactionKind
                    .sort((a, b) => b.total_count - a.total_count)
                    .map((item) => {
                      return `${item.total_count}回`;
                    })
                : ['-']
            }
          />
        </Table>
      </TableContainer>
    </Box>
  );
};
