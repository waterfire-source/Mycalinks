import { CustomError } from '@/api/implement';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { InquiryModalContent } from '@/feature/ec/inquiry/components/InquiryModalContent';
import { ReplyConfirmationModal } from '@/feature/ec/inquiry/components/ReplyConfirmationModal';
import { Inquiry, useInquiry } from '@/feature/ec/inquiry/hooks/useInquiry';
import React, { useEffect, useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  inquiry: Inquiry['orderContacts'][0];
  setRefreshInquiry: React.Dispatch<React.SetStateAction<boolean>>;
}

export const InquiryModal = ({
  isOpen,
  onClose,
  inquiry,
  setRefreshInquiry,
}: Props) => {
  const { replyAndUpdateStatus } = useInquiry();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] =
    useState<boolean>(false);
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [currentStatus, setCurrentStatus] = useState<
    Inquiry['orderContacts'][0]['status']
  >(inquiry.status);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCurrentStatus(inquiry.status);
  }, [inquiry.status]);

  const handleConfirmationModalClose = () => {
    setIsConfirmationModalOpen(false);
  };

  const handleClose = () => {
    if (currentStatus !== inquiry.status) {
      setRefreshInquiry(true);
    }
    onClose();
  };

  const handleReplyMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReplyMessage(e.target.value);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    const response = await replyAndUpdateStatus({
      orderId: inquiry.orderId,
      content: replyMessage,
      status: currentStatus,
    });
    if (response instanceof CustomError) {
      // replyAndUpdateStatusでsetAlertが出るのでなにもしない
      setIsLoading(false);
      return;
    }
    setReplyMessage('');
    setIsLoading(false);
    setRefreshInquiry(true);
    setIsConfirmationModalOpen(false);
    onClose();
  };

  const title = `お問い合わせ（注文番号： ${inquiry.orderId}）`;

  return (
    <>
      <CustomModalWithIcon
        open={isOpen}
        onClose={handleClose}
        title={title}
        helpArchivesNumber={2884}
        width="90%"
        height="85%"
        actionButtonText="返信する"
        onActionButtonClick={() => {
          setIsConfirmationModalOpen(true);
        }}
        primaryButtonDisabled={replyMessage === ''}
        closeButtonText="返信をやめる"
        onCancelClick={onClose}
      >
        <InquiryModalContent
          inquiry={inquiry}
          replyMessage={replyMessage}
          onReplyMessageChange={handleReplyMessageChange}
          currentStatus={currentStatus}
          setCurrentStatus={setCurrentStatus}
        />
      </CustomModalWithIcon>
      <ReplyConfirmationModal
        open={isConfirmationModalOpen}
        onClose={handleConfirmationModalClose}
        onConfirm={handleConfirm}
        currentStatus={currentStatus}
        setCurrentStatus={setCurrentStatus}
        isLoading={isLoading}
      />
    </>
  );
};
