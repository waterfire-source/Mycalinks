import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { InquiryStatusSelectBox } from '@/feature/ec/inquiry/components/InquiryStatusSelectBox';
import { Inquiry } from '@/feature/ec/inquiry/hooks/useInquiry';
import { Box, Typography } from '@mui/material';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentStatus: Inquiry['orderContacts'][0]['status'];
  setCurrentStatus: React.Dispatch<
    React.SetStateAction<Inquiry['orderContacts'][0]['status']>
  >;
  isLoading?: boolean;
}

export const ReplyConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  currentStatus,
  setCurrentStatus,
  isLoading = false,
}: Props) => {
  return (
    <>
      <ConfirmationDialog
        open={open}
        onClose={onClose}
        title="返信確認"
        message="お客様に送信されます。本当によろしいでしょうか？\n
        ステータスを変更する場合は以下から選択してください。"
        content={
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 2,
              alignItems: 'center',
            }}
          >
            <Typography>ステータス：</Typography>
            <InquiryStatusSelectBox
              currentStatus={currentStatus}
              setCurrentStatus={setCurrentStatus}
            />
          </Box>
        }
        onConfirm={onConfirm}
        confirmButtonText="返信する"
        isLoading={isLoading}
      />
    </>
  );
};
