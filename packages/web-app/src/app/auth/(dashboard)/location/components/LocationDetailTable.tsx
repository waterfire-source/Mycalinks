import { ColumnDef, CustomTable } from '@/components/tables/CustomTable';
import { Location } from '@/feature/location/hooks/useLocation';
import { ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material';
import { customDayjs } from 'common';

type Props = { selectedLocation: Location | undefined };

export const LocationDetailTable = ({ selectedLocation }: Props) => {
  const basicColumns: ColumnDef<Location>[] = [
    {
      header: 'ロケーション名',
      key: 'locationName',
      render: (location) => <Typography>{location.display_name}</Typography>,
    },
    {
      header: '作成日時',
      key: 'createdAt',
      render: (location) => (
        <Typography>
          {customDayjs(location.created_at).tz().format('YYYY/MM/DD')}
        </Typography>
      ),
    },
    {
      header: '登録商品数',
      key: 'registerCount',
      render: (location) => (
        <Typography>{location.total_item_count || 0}</Typography>
      ),
    },
    {
      header: '販売額合計',
      key: 'sellPriceSum',
      render: (location) => (
        <Typography>
          ¥{location.expected_sales?.toLocaleString() || 0}
        </Typography>
      ),
    },
    {
      header: '仕入れ値合計',
      key: 'wholesalePriceSum',
      render: (location) => (
        <Typography>
          ¥{location.total_wholesale_price?.toLocaleString() || 0}
        </Typography>
      ),
    },
    {
      header: '備考',
      key: 'description',
      render: (location) => <Typography>{location.description}</Typography>,
    },
  ];

  const salesColumns: ColumnDef<Location>[] = [
    {
      header: '解体日時',
      key: 'releasedAt',
      render: (location) => (
        <Typography>
          {customDayjs(location.finished_at).tz().format('YYYY/MM/DD')}
        </Typography>
      ),
    },
    {
      header: '売上合計',
      key: 'totalSalePrice',
      render: (location) => (
        <Typography>¥{location.actual_sales?.toLocaleString()}</Typography>
      ),
    },
    {
      header: '粗利益',
      key: 'grossProfit',
      render: (location) => (
        <Typography>
          ¥
          {(
            (location.actual_sales ?? 0) -
            (location.actual_wholesale_price ?? 0)
          ).toLocaleString()}
        </Typography>
      ),
    },
    {
      header: '粗利益率',
      key: 'grossProfitRate',
      render: (location) => {
        const actualSales = location.actual_sales ?? 0;
        const actualWholesalePrice = location.actual_wholesale_price ?? 0;
        const grossProfit = actualSales - actualWholesalePrice;
        const grossProfitRate =
          actualSales > 0
            ? Math.round((grossProfit / actualSales) * 100 * 10) / 10
            : 0;

        return <Typography>{grossProfitRate}%</Typography>;
      },
    },
  ];

  return (
    <>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>ロケーション詳細を見る</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <CustomTable
            columns={basicColumns}
            rows={selectedLocation ? [selectedLocation] : []}
            rowKey={(location) => location.id}
            hasRedLine={true}
          />
        </AccordionDetails>
      </Accordion>
      
      {selectedLocation?.status === 'FINISHED' && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>売上実績を見る</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <CustomTable
              columns={salesColumns}
              rows={[selectedLocation]}
              rowKey={(location) => location.id}
              hasRedLine={true}
            />
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
};
