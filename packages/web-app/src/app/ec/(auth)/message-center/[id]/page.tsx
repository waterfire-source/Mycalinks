'use client';

import React, { useState, useEffect } from 'react';
import {
  Typography,
  Stack,
  Container,
  CircularProgress,
  Box,
  Paper,
} from '@mui/material';
import { PATH } from '@/app/ec/(core)/constants/paths';
import {
  useEcMessageCenter,
  MessageCenter as MessageCenterType,
} from '@/app/ec/(core)/hooks/useEcMessageCenter';
import MessageIcon from '@mui/icons-material/Message';
import dayjs from 'dayjs';
import Link from 'next/link';

interface MessageDetailProps {
  params: { id: string };
}

const MessageDetail: React.FC<MessageDetailProps> = ({ params }) => {
  const { getMessageDetail } = useEcMessageCenter();
  const [message, setMessage] = useState<MessageCenterType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMessageDetail = async () => {
      setLoading(true);
      try {
        const messageData = await getMessageDetail(Number(params.id));
        if (messageData) {
          setMessage(messageData);
        }
      } catch (error) {
        console.error('メッセージの取得に失敗しました', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessageDetail();
  }, [params.id, getMessageDetail]);

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
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ p: 2 }}>
      <Stack spacing={3}>
        {/* ヘッダー */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            sx={{ mb: 1 }}
          >
            {message.title}
          </Typography>
          {message.order_store && (
            <Typography variant="body1" color="text.secondary">
              {message.order_store.store.display_name}
            </Typography>
          )}
          {message.order_store?.code && (
            <Typography
              variant="body2"
              color="grey.600"
              sx={{ fontWeight: 'bold' }}
            >
              注文番号: {message.order_store.code}
            </Typography>
          )}
          <Typography variant="body2" color="grey.600">
            {dayjs(message.created_at).format('YYYY年MM月DD日 HH:mm')}
          </Typography>
        </Box>

        {/* メッセージ内容 */}
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
          <Typography
            variant="body1"
            sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}
          >
            {message.content || 'メッセージ内容がありません'}
          </Typography>
        </Paper>

        {/* 注文履歴リンク */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Link
            href={PATH.ORDER.history.root}
            style={{
              textDecoration: 'none',
            }}
          >
            <Typography
              variant="body2"
              component="span"
              sx={{
                cursor: 'pointer',
                color: 'primary.main',
                textDecoration: 'underline',
                '&:hover': {
                  opacity: 0.7,
                },
              }}
            >
              注文履歴を見る
            </Typography>
          </Link>
        </Box>
      </Stack>
    </Container>
  );
};

export default MessageDetail;
