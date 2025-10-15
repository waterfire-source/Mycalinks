import { Box, Typography, Paper, Select, MenuItem } from '@mui/material';
import { OrderDetail } from '@/components/modals/ec/OrderDetailModal';

interface InfoSection {
  label: string;
  value: string | React.ReactNode;
}
// 情報セクショングループ
interface SectionProps {
  title: string;
  sections: InfoSection[];
}
const InfoSectionGroup = ({ title, sections }: SectionProps) => (
  <>
    <Typography variant="body2" sx={{ color: 'grey.700', fontWeight: 'bold' }}>
      {title}
    </Typography>
    <Paper sx={{ p: 1, boxShadow: 'none', mb: 2 }}>
      {sections.map((section, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            mb: index < sections.length - 1 ? 1 : 0,
            alignItems: 'center',
          }}
        >
          <Typography
            variant="body2"
            sx={{ width: '120px', textAlign: 'right' }}
          >
            {section.label}：
          </Typography>
          <Box sx={{ ml: 1 }}>
            {typeof section.value === 'string' ? (
              <Typography variant="body2">{section.value}</Typography>
            ) : (
              section.value
            )}
          </Box>
        </Box>
      ))}
    </Paper>
  </>
);

// メインコンポーネント
interface Props {
  orderDetail: OrderDetail;
  isEditable?: boolean;
  onDeliveryMethodChange?: (method: string) => void;
  showSections?: {
    shipping?: boolean;
    billing?: boolean;
    payment?: boolean;
    receipt?: boolean;
  };
}

export const OrderDetailSidePanel = ({
  orderDetail,
  isEditable = false,
  onDeliveryMethodChange,
  showSections = {
    shipping: true,
    billing: true,
    payment: true,
    receipt: true,
  },
}: Props) => {
  const deliveryMethods = ['指定なし', 'ヤマト運輸', '佐川急便', '日本郵便'];

  const shippingInfo = [
    { label: '郵便番号', value: orderDetail?.shippingInfo?.postalCode },
    { label: '住所', value: orderDetail?.shippingInfo?.address },
    { label: '氏名', value: orderDetail?.shippingInfo?.name },
    { label: 'シメイ', value: orderDetail?.shippingInfo?.fullNameRuby },
    { label: '電話番号', value: orderDetail?.shippingInfo?.phone },
    {
      label: '配送方法',
      value: isEditable ? (
        <Select
          size="small"
          value={orderDetail?.deliveryMethod || '指定なし'}
          onChange={(e) => onDeliveryMethodChange?.(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          {deliveryMethods.map((method) => (
            <MenuItem key={method} value={method}>
              {method}
            </MenuItem>
          ))}
        </Select>
      ) : (
        orderDetail?.deliveryMethod
      ),
    },
    { label: '配送希望日', value: orderDetail?.deliveryDate },
  ];

  const billingInfo = [
    { label: '郵便番号', value: orderDetail?.billingInfo?.postalCode },
    { label: '住所', value: orderDetail?.billingInfo?.address },
    { label: '氏名', value: orderDetail?.billingInfo?.name },
    { label: 'シメイ', value: orderDetail?.billingInfo?.fullNameRuby },
    { label: '電話番号', value: orderDetail?.billingInfo?.phone },
  ];

  const receiptInfo = [
    {
      label: '商品の小計',
      value: `¥${orderDetail?.payment?.total.toLocaleString()}`,
    },
    {
      label: '配送料・手数料',
      value: `¥${orderDetail?.payment?.shippingFee.toLocaleString()}`,
    },
    {
      label: '注文合計',
      value: `¥${orderDetail?.payment?.grandTotal.toLocaleString()}`,
    },
    {
      label: 'ご請求額',
      value: `¥${orderDetail?.payment?.grandTotal.toLocaleString()}`,
    },
  ];

  return (
    <Box sx={{ flex: 1 }}>
      {showSections.shipping && (
        <InfoSectionGroup title="配送情報" sections={shippingInfo} />
      )}

      {showSections.billing && (
        <InfoSectionGroup title="請求先情報" sections={billingInfo} />
      )}

      {showSections.payment && (
        <>
          <Typography
            variant="body2"
            sx={{ color: 'grey.700', fontWeight: 'bold' }}
          >
            支払方法
          </Typography>
          <Paper sx={{ p: 1, boxShadow: 'none', mb: 2 }}>
            <Typography variant="body2">
              {orderDetail?.payment?.method}
            </Typography>
          </Paper>
        </>
      )}

      {showSections.receipt && (
        <InfoSectionGroup title="領収書/購入明細書" sections={receiptInfo} />
      )}
    </Box>
  );
};
