import { useEffect, useRef } from 'react';
import { Typography, Stack, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useOverflowDetect } from '@/hooks/useOverflowDetect';
import { MessageDetail } from '@/app/ec/(core)/utils/transformEcOrderContact';

// Custom hook to get the previous value of a prop or state
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

// MessageDetailItemコンポーネントを定義
export const MessageDetailItem = ({
  detail,
  expanded,
  onToggle,
}: {
  detail: MessageDetail;
  expanded: boolean;
  onToggle: () => void;
}) => {
  const { ref, isOverflow } = useOverflowDetect<HTMLDivElement>([
    detail.content,
  ]);
  const prevExpanded = usePrevious(expanded);

  // The toggle should be visible if it's overflowing, expanded, or in the process of collapsing.
  const showToggle =
    isOverflow || expanded || (prevExpanded === true && expanded === false);

  return (
    <Box
      onClick={showToggle ? onToggle : undefined}
      sx={{
        mb: 2,
        p: 2,
        borderRadius: 2,
        backgroundColor: 'white',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        cursor: showToggle ? 'pointer' : 'default',
        '&:hover': showToggle
          ? {
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
            }
          : undefined,
      }}
    >
      <Stack spacing={1}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack>
            <Typography fontWeight="medium">{detail.sender}</Typography>
            <Typography variant="body2" color="grey.600">
              {detail.timestamp}
            </Typography>
          </Stack>
          {showToggle && (
            <ExpandMoreIcon
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
          )}
        </Stack>
        <Typography
          component="div"
          ref={ref}
          variant="body1"
          sx={{
            whiteSpace: expanded ? 'pre-wrap' : 'nowrap',
            overflow: 'hidden',
            textOverflow: expanded ? 'unset' : 'ellipsis',
          }}
        >
          {detail.content}
        </Typography>
      </Stack>
    </Box>
  );
};
