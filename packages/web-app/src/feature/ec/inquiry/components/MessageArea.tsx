import { Conversation } from '@/feature/ec/inquiry/components/Conversation';
import { MessageHeader } from '@/feature/ec/inquiry/components/MessageHeader';
import { Inquiry } from '@/feature/ec/inquiry/hooks/useInquiry';
import { Box, TextField } from '@mui/material';

interface Props {
  inquiry: Inquiry['orderContacts'][0];
  replyMessage: string;
  onReplyMessageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentStatus: Inquiry['orderContacts'][0]['status'];
  setCurrentStatus: React.Dispatch<
    React.SetStateAction<Inquiry['orderContacts'][0]['status']>
  >;
}

export const MessageArea = ({
  inquiry,
  replyMessage,
  onReplyMessageChange,
  currentStatus,
  setCurrentStatus,
}: Props) => {
  return (
    <Box
      sx={{
        height: '100%',
        overflow: 'auto',
        gap: 2,
        display: 'flex',
        flexDirection: 'column',
        mx: 2,
      }}
    >
      <MessageHeader
        inquiry={inquiry}
        currentStatus={currentStatus}
        setCurrentStatus={setCurrentStatus}
      />
      <Box
        sx={{
          flexGrow: 1,
          minHeight: 0,
          overflow: 'auto',
        }}
      >
        <Conversation inquiry={inquiry} />
      </Box>
      <TextField
        fullWidth
        multiline
        minRows={1}
        maxRows={4}
        onChange={onReplyMessageChange}
        value={replyMessage}
        sx={{ backgroundColor: 'white' }}
      />
    </Box>
  );
};
