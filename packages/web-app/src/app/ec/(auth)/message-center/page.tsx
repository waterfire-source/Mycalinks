'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  Paper,
  ListItem,
  Button,
  Chip,
  Container,
  CircularProgress,
} from '@mui/material';
import { PATH } from '@/app/ec/(core)/constants/paths';
import { useRouter } from 'next/navigation';
import {
  useEcMessageCenter,
  MessageCenter as MessageCenterType,
} from '@/app/ec/(core)/hooks/useEcMessageCenter';
import { getOrderContactKindValue } from '@/app/ec/(core)/constants/orderContactKInd';
import MessageIcon from '@mui/icons-material/Message';
import dayjs from 'dayjs';

const MessageCenter = () => {
  const [messages, setMessages] = useState<MessageCenterType[]>([]);
  const { loading, getMessageCenters, markAsRead } = useEcMessageCenter();

  useEffect(() => {
    const fetchMessages = async () => {
      const result = await getMessageCenters({
        id: undefined,
        take: 50,
        skip: 0,
      });
      if (result) {
        setMessages(result);
      }
    };

    fetchMessages();
  }, [getMessageCenters]);

  const router = useRouter();

  const handleViewDetails = async (message: MessageCenterType) => {
    // メッセージを既読にする
    await markAsRead(message.id);
    // メッセージ詳細画面に遷移
    if (message.kind != 'MAIL' && message.order_store?.code) {
      // コードがある場合は新しい[id]/[code]ルートを使用
      router.push(
        PATH.MESSAGE_CENTER.detailWithCode(
          message.id.toString(),
          message.order_store.code,
        ),
      );
    } else {
      // コードがない場合は従来の[id]ルートを使用
      router.push(PATH.MESSAGE_CENTER.detail(message.id.toString()));
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
  if (!messages.length) {
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
    <Box
      sx={{ maxWidth: '100%', bgcolor: '#f5f5f5', minHeight: '100vh', pb: 2 }}
    >
      <Typography
        variant="h3"
        component="h1"
        sx={{
          p: 2,
          textAlign: 'center',
        }}
      >
        メッセージセンター
      </Typography>

      <List sx={{ px: 1, py: 0 }}>
        {messages.map((message) => (
          <Paper
            key={message.id}
            sx={{
              mb: 2,
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <ListItem
              alignItems="flex-start"
              sx={{
                flexDirection: 'column',
                p: 2,
                pb: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                {!message.read_at && (
                  <Chip
                    label="未読"
                    size="small"
                    sx={{
                      bgcolor: '#d32f2f',
                      color: 'white',
                      fontSize: '0.75rem',
                      height: 24,
                      mr: 1,
                      borderRadius: 0.5,
                    }}
                  />
                )}
                <Typography variant="body2" component="span" fontWeight="bold">
                  {message.title}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: '100%',
                  mb: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  {message.order_store && (
                    <Typography variant="body2">
                      {message.order_store.store.display_name}
                    </Typography>
                  )}
                  <Typography variant="body2" color="grey.600">
                    {dayjs(message.created_at).format('YYYY/MM/DD HH:mm')}
                  </Typography>
                  {message.kind && (
                    <Typography variant="body2" color="grey.600">
                      {message.kind === 'MAIL'
                        ? 'メール'
                        : getOrderContactKindValue(message.kind)}
                    </Typography>
                  )}
                </Box>
                <Box
                  sx={{
                    width: '100px',
                    mt: 'auto',
                    ml: 'auto',
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleViewDetails(message)}
                    sx={{
                      borderRadius: 2,
                      px: 1.5,
                      fontSize: '0.75rem',
                      borderColor: '#ddd',
                      color: '#333',
                      whiteSpace: 'nowrap',
                      '&:hover': {
                        borderColor: '#bbb',
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    詳細を見る
                  </Button>
                </Box>
              </Box>
            </ListItem>
          </Paper>
        ))}
      </List>
    </Box>
  );
};

export default MessageCenter;
