import { Inquiry } from '@/feature/ec/inquiry/hooks/useInquiry';
import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useRef } from 'react';

interface Props {
  inquiry: Inquiry['orderContacts'][0];
}

export const Conversation = ({ inquiry }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [inquiry.messages.length]);
  return (
    <Box
      ref={containerRef}
      sx={{
        flexGrow: 1,
        overflow: 'auto',
        pt: 1,
        maxHeight: '100%', // 必要に応じて高さ指定
      }}
    >
      {inquiry.messages
        .slice()
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )
        .map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent:
                message.mycaUserId !== null
                  ? 'flex-start'
                  : message.staffAccountId !== null
                  ? 'flex-end'
                  : 'center',
              mb: 1,
              gap: 1,
            }}
          >
            {/* 時刻とメッセージ */}
            {message.staffAccountId !== null && (
              <Typography
                variant="caption"
                sx={{ mt: 0.5, color: 'gray', alignSelf: 'flex-end' }}
              >
                {dayjs(message.createdAt).format('MM/DD HH:mm')}
              </Typography>
            )}
            <Typography
              sx={{
                backgroundColor: 'grey.400',
                p: 2,
                borderRadius: 3,
                maxWidth: '70%',
              }}
            >
              {message.content}
            </Typography>
            {message.mycaUserId !== null && (
              <Typography
                variant="caption"
                sx={{ mt: 0.5, color: 'gray', alignSelf: 'flex-end' }}
              >
                {dayjs(message.createdAt).format('MM/DD HH:mm')}
              </Typography>
            )}
          </Box>
        ))}
    </Box>
  );
};
