'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Typography,
  Button,
  Stack,
  Container,
  CircularProgress,
  Box,
  Divider,
  Chip,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { PATH } from '@/app/ec/(core)/constants/paths';
import { useEcOrderContact } from '@/app/ec/(core)/hooks/useEcOrderContact';
import { useEcOrder } from '@/app/ec/(core)/hooks/useEcOrder';
import {
  transformEcOrder,
  TransformedEcOrder,
} from '@/app/ec/(core)/utils/transformEcOrder';
import { CommonModal } from '@/app/ec/(core)/components/modals/CommonModal';
import {
  MessageSummary,
  transformEcOrderContact,
  isValidOrderContactResponse,
} from '@/app/ec/(core)/utils/transformEcOrderContact';
import type { MessageDetail } from '@/app/ec/(core)/utils/transformEcOrderContact';
import { getOrderContactKindValue } from '@/app/ec/(core)/constants/orderContactKInd';
import MessageIcon from '@mui/icons-material/Message';
import {
  cardCondition,
  boxCondition,
} from '@/app/ec/(core)/constants/condition';
import { MessageDetailItem } from '@/app/ec/(core)/feature/message-center/MessageDetailItem';

// カード状態をハンドルから日本語表示に変換する関数
const getConditionLabel = (conditionHandle: string): string => {
  // カード状態をチェック
  const cardMatch = cardCondition.find(
    (condition) => condition.value === conditionHandle,
  );
  if (cardMatch) {
    return cardMatch.label;
  }

  // ボックス状態をチェック
  const boxMatch = boxCondition.find(
    (condition) => condition.value === conditionHandle,
  );
  if (boxMatch) {
    return boxMatch.label;
  }

  // 何も見つからない場合はそのまま返す
  return conditionHandle;
};

interface MessageDetailProps {
  params: { id: string; code: string };
}

const MessageDetail: React.FC<MessageDetailProps> = ({
  params,
}: {
  params: { id: string; code: string };
}) => {
  const router = useRouter();
  const { getOrderContact } = useEcOrderContact();
  const { getCartContents } = useEcOrder();
  const [message, setMessage] = useState<MessageSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderData, setOrderData] = useState<TransformedEcOrder | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);

  const fetchOrderData = async () => {
    if (!message?.orderNumber) return;
    setOrderLoading(true);
    try {
      const cartData = await getCartContents(message.orderNumber);
      if (cartData) {
        const transformedOrders = transformEcOrder(cartData);
        const order = transformedOrders.find(
          (order) => order.storeOrderCode.toString() == params.code,
        );
        if (order) {
          setOrderData(order);
        }
      }
    } catch (error) {
      console.error('注文データの取得に失敗しました', error);
    } finally {
      setOrderLoading(false);
    }
  };

  const handleOpenOrderModal = () => {
    fetchOrderData();
    setIsOrderModalOpen(true);
  };

  const handleCloseOrderModal = () => {
    setIsOrderModalOpen(false);
  };

  useEffect(() => {
    const fetchMessageDetail = async () => {
      setLoading(true);
      try {
        // codeパラメータを使用してメッセージを取得
        const orderContacts = await getOrderContact(params.code, {
          includesMessages: true,
        });
        if (isValidOrderContactResponse(orderContacts)) {
          const targetContact = orderContacts.ecOrderContacts.find(
            (contact) => contact.order_store.code === params.code,
          );
          if (targetContact) {
            const convertedMessage = transformEcOrderContact(targetContact);
            setMessage(convertedMessage);
          }
        }
      } catch (error) {
        console.error('メッセージの取得に失敗しました', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessageDetail();
  }, [params.code, getOrderContact]);

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const navigateToContact = (code: string, kind?: string, title?: string) => {
    const contactUrl = PATH.ORDER.contact(code);
    const params = new URLSearchParams();

    if (kind) {
      params.append('kind', kind);
    }
    if (title) {
      params.append('title', title);
    }

    if (params.toString()) {
      router.push(`${contactUrl}?${params.toString()}`);
    } else {
      router.push(contactUrl);
    }
  };

  if (loading) {
    return (
      <Container
        maxWidth="md"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (!message) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          p: 3,
        }}
      >
        <MessageIcon sx={{ fontSize: 60, color: 'grey.600', mb: 1 }} />
        <Typography variant="body2" color="grey.600" align="center">
          メッセージが見つかりません
        </Typography>
        <Typography variant="body2" color="grey.600" align="center">
          新しいメッセージが届くとここに表示されます
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ p: 2 }}>
      <Stack justifyContent="center" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          ご注文番号 #{params.code}
        </Typography>
        <Typography variant="body2">{message.shopName}</Typography>
      </Stack>
      <Stack
        alignItems="center"
        justifyContent="space-between"
        direction="row"
        mb={2}
      >
        <Typography variant="body2" fontWeight="bold">
          {getOrderContactKindValue(message.kind)}
        </Typography>
        <Typography
          variant="body2"
          fontWeight="bold"
          color="text.secondary"
          sx={{
            backgroundColor: '#808080',
            padding: '2px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          onClick={handleOpenOrderModal}
        >
          ご注文内容
        </Typography>
      </Stack>

      {message.details.map((detail, index) => (
        <MessageDetailItem
          key={index}
          detail={detail}
          expanded={expandedIndex === index}
          onToggle={() => toggleAccordion(index)}
        />
      ))}

      <Button
        variant="contained"
        fullWidth
        sx={{
          mt: 2,
          py: 1.5,
          borderRadius: 1,
        }}
        onClick={() =>
          navigateToContact(
            params.code,
            message.kind,
            `Re: ${message.subject || 'お問い合わせの件'}`,
          )
        }
      >
        この注文について問い合わせを送る
      </Button>

      <CommonModal
        isOpen={isOrderModalOpen}
        onClose={handleCloseOrderModal}
        title="ご注文内容"
        isCancel={false}
        submitLabel="戻る"
        onSubmit={handleCloseOrderModal}
      >
        {orderLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : orderData ? (
          <Box sx={{ py: 2, px: 0 }}>
            {/* 注文ヘッダー */}
            <Stack direction="column" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                ご注文番号 #{orderData.storeOrderCode}
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {orderData.shopName}
              </Typography>
            </Stack>
            {/* 注文情報 */}
            <Stack
              direction="row"
              justifyContent="space-between"
              width={2 / 3}
              sx={{ mb: 1 }}
            >
              <Stack>
                <Typography variant="caption">ご注文日</Typography>
                <Typography variant="body2">
                  {orderData.orderDate
                    ? new Date(orderData.orderDate).toLocaleDateString(
                        'ja-JP',
                        {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        },
                      )
                    : ''}
                </Typography>
              </Stack>
              <Stack>
                <Typography variant="caption">合計</Typography>
                <Typography variant="body2">
                  {(
                    (orderData.shippingFee || 0) + (orderData.subtotal || 0)
                  )?.toLocaleString() || '000,000'}
                  円
                </Typography>
              </Stack>
            </Stack>
            {/* 配送方法 */}
            <Stack sx={{ mb: 1 }}>
              <Typography variant="caption">配送方法</Typography>
              <Typography variant="body2">
                {orderData.shippingMethod}
              </Typography>
            </Stack>
            {/* お届け先住所 */}
            <Stack sx={{ mb: 2 }}>
              <Typography variant="caption">お届け先</Typography>
              <Typography variant="body2">
                {orderData.shippingAddress}
              </Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            {/* 注文アイテム */}
            <Stack spacing={2}>
              {orderData.items.map((item: any, index: number) => (
                <Stack key={index} direction="row" spacing={2}>
                  <Box
                    sx={{
                      width: 60,
                      height: 90,
                      position: 'relative',
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src={item.imageUrl || '/sample.png'}
                      alt={item.name}
                      fill
                      sizes="60px"
                      style={{ objectFit: 'contain' }}
                    />
                  </Box>
                  <Stack justifyContent="space-between" sx={{ flex: 1, p: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {item.name}
                    </Typography>
                    {item.expansion && (
                      <Typography variant="body2">{item.expansion}</Typography>
                    )}
                    {item.rarity && (
                      <Typography variant="body2">{item.rarity}</Typography>
                    )}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{ mt: 0 }}
                    >
                      <Stack direction="row" alignItems="center">
                        <Chip
                          label={getConditionLabel(item.condition)}
                          variant="outlined"
                          size="small"
                          sx={{
                            borderRadius: '0.25rem',
                            fontSize: '0.5rem',
                            padding: '0',
                            width: '40px',
                          }}
                        />
                        <Typography
                          variant="caption"
                          fontWeight="bold"
                          sx={{ ml: 1 }}
                        >
                          {(item.price || 0).toLocaleString() || '00,000'}円
                        </Typography>
                      </Stack>
                      <Typography
                        variant="caption"
                        fontWeight="bold"
                        sx={{ mt: 0.5 }}
                      >
                        ご注文数：{item.quantity || '00'}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Box>
        ) : (
          <Typography align="center" sx={{ p: 3 }}>
            注文データが見つかりませんでした
          </Typography>
        )}
      </CommonModal>
    </Container>
  );
};

export default MessageDetail;
