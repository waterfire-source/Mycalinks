import { EcAPIRes } from '@/api/frontend/ec/api';
import { CustomError } from '@/api/implement';

export interface MessageDetail {
  sender: string;
  timestamp: string;
  content: string;
}

export interface MessageSummary {
  id: string;
  orderNumber: string;
  shopName: string;
  lastUpdate: string;
  kind: string;
  isRead?: boolean;
  details: MessageDetail[];
  subject?: string;
}

const formatDateToCustomFormat = (date: Date | null): string => {
  if (!date) return '';
  return date
    .toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    .replace(',', '');
};

export const transformEcOrderContact = (
  orderContact: EcAPIRes['getEcOrderContact']['ecOrderContacts'][0],
): MessageSummary => {
  const {
    order_store: orderStore,
    messages,
    last_sent_at,
    kind,
    myca_user_last_read_at,
  } = orderContact;

  const shopName = orderStore.store.display_name || 'カードショップMycalinks';

  const convertedMessages: MessageDetail[] = messages.map((message) => ({
    sender: message.myca_user_id ? 'あなた' : shopName,
    timestamp: formatDateToCustomFormat(new Date(message.created_at)),
    content: message.content || '',
  }));

  const lastSentDate = new Date(last_sent_at || 0);
  const lastReadDate = myca_user_last_read_at
    ? new Date(myca_user_last_read_at)
    : null;
  const isRead = lastReadDate ? lastSentDate <= lastReadDate : false;

  return {
    id: orderStore.code,
    orderNumber: orderStore.order.code,
    shopName,
    lastUpdate: formatDateToCustomFormat(lastSentDate),
    kind,
    isRead,
    details: convertedMessages,
  };
};

export const isValidOrderContactResponse = (
  response: EcAPIRes['getEcOrderContact'] | CustomError | null,
): response is EcAPIRes['getEcOrderContact'] => {
  return (
    response !== null &&
    !(response instanceof CustomError) &&
    Array.isArray(response.ecOrderContacts)
  );
};
