import {
  getLabelFromSortValue,
  OrderKindSortOptions,
} from '@/feature/ec/inquiry/const';
import { InquiryStatusSelectBox } from '@/feature/ec/inquiry/components/InquiryStatusSelectBox';
import { Inquiry } from '@/feature/ec/inquiry/hooks/useInquiry';
import theme from '@/theme';
import { Box, Typography } from '@mui/material';

interface Props {
  inquiry: Inquiry['orderContacts'][0];
  currentStatus: Inquiry['orderContacts'][0]['status'];
  setCurrentStatus: React.Dispatch<
    React.SetStateAction<Inquiry['orderContacts'][0]['status']>
  >;
}

export const MessageHeader = ({
  inquiry,
  currentStatus,
  setCurrentStatus,
}: Props) => {
  return (
    <Box
      sx={{
        borderBottom: '2px solid',
        borderBottomColor: theme.palette.grey[300],
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 1,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography>
          種類：
          {getLabelFromSortValue(inquiry.kind as OrderKindSortOptions)}
        </Typography>
        <Typography>件名： {inquiry.title}</Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography>ステータス： </Typography>
        <InquiryStatusSelectBox
          currentStatus={currentStatus}
          setCurrentStatus={setCurrentStatus}
        />
      </Box>
    </Box>
  );
};
