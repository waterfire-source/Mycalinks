import { MessageArea } from '@/feature/ec/inquiry/components/MessageArea';
import { OrderDetail } from '@/feature/ec/inquiry/components/OrderDetail';
import { Inquiry } from '@/feature/ec/inquiry/hooks/useInquiry';
import { Box } from '@mui/material';
import React from 'react';

interface Props {
  inquiry: Inquiry['orderContacts'][0];
  replyMessage: string;
  onReplyMessageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentStatus: Inquiry['orderContacts'][0]['status'];
  setCurrentStatus: React.Dispatch<
    React.SetStateAction<Inquiry['orderContacts'][0]['status']>
  >;
}

export const InquiryModalContent = ({
  inquiry,
  replyMessage,
  onReplyMessageChange,
  currentStatus,
  setCurrentStatus,
}: Props) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexGrow: 1,
        overflowY: 'auto',
        flex: '1',
        gap: '10px',
        height: '100%',
      }}
    >
      <Box width="60%">
        <MessageArea
          inquiry={inquiry}
          replyMessage={replyMessage}
          onReplyMessageChange={onReplyMessageChange}
          currentStatus={currentStatus}
          setCurrentStatus={setCurrentStatus}
        />
      </Box>
      <Box width="40%">
        <OrderDetail inquiry={inquiry} />
      </Box>
    </Box>
  );
};
