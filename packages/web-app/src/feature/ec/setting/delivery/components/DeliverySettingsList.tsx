import { ColumnDef, CustomTable } from '@/components/tables/CustomTable';
import { Dispatch, SetStateAction } from 'react';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { StoreAPI, StoreApiRes } from '@/api/frontend/store/api';
import theme from '@/theme';

interface Props {
  deliveryMethods: StoreApiRes['getListShippingMethod'] | undefined;
  selectedDeliveryMethod:
    | StoreAPI['updateShippingMethod']['request']['body']
    | null;
  setSelectedDeliveryMethod: Dispatch<
    SetStateAction<StoreAPI['updateShippingMethod']['request']['body'] | null>
  >;
}

export const DeliverySettingsList = ({
  deliveryMethods,
  selectedDeliveryMethod,
  setSelectedDeliveryMethod,
}: Props) => {
  const onRowClick = (
    row: StoreApiRes['getListShippingMethod']['shippingMethods'][0],
  ) => {
    setSelectedDeliveryMethod({
      id: row.id,
      displayName: row.display_name,
      enabledTracking: row.enabled_tracking,
      enabledCashOnDelivery: row.enabled_cash_on_delivery,
      orderNumber: row.order_number || 1,
      regions:
        row.regions?.length && row.weights?.length === 0
          ? row.regions?.map((region) => ({
              regionHandle: region.region_handle,
              fee: region.fee,
            }))
          : undefined,
      weights: row.weights?.length
        ? row.weights?.map((weight) => ({
            displayName: weight.display_name,
            weightGte: weight.weight_gte,
            weightLte: weight.weight_lte,
            regions:
              weight.regions?.map((region) => ({
                regionHandle: region.region_handle,
                fee: region.fee,
              })) || undefined,
          }))
        : undefined,
    });
  };

  const columns: ColumnDef<
    StoreApiRes['getListShippingMethod']['shippingMethods'][0]
  >[] = [
    {
      header: '配送方法名',
      key: 'display_name',
      render: (row) => row.display_name,
    },
    {
      header: '送料',
      key: 'deliveryFee',
      render: (row) => {
        if (row.weights?.length) {
          return 'サイズ別送料';
        } else if (row.regions?.[0]?.region_handle === '全国一律') {
          return '全国一律';
        } else if (row.regions?.length) {
          return '地域別送料';
        }
      },
    },
    {
      header: '',
      render: () => <ChevronRightIcon />,
    },
  ];
  // order_numberで昇順ソート（nullやundefinedの場合は最後に配置）
  const sortedDeliveryMethods = [
    ...(deliveryMethods?.shippingMethods ?? []),
  ].sort((a, b) => {
    const aOrder = a.order_number ?? Number.MAX_SAFE_INTEGER;
    const bOrder = b.order_number ?? Number.MAX_SAFE_INTEGER;
    return aOrder - bOrder;
  });

  return (
    <CustomTable<StoreApiRes['getListShippingMethod']['shippingMethods'][0]>
      columns={columns}
      rows={sortedDeliveryMethods}
      rowKey={(row) => row.id}
      onRowClick={onRowClick}
      selectedRowKey={selectedDeliveryMethod?.id}
      sx={{
        borderTop: `8px solid ${theme.palette.primary.main}`,
        height: '100%',
      }}
    />
  );
};
