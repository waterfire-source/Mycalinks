import { Tooltip, Typography, Zoom } from '@mui/material';

interface Props {
  text: string;
  wrap?: boolean;
  sx?: object;
}
export const ItemText = ({ text, wrap = true, sx }: Props) => {
  return (
    <Tooltip
      title={<Typography>{text}</Typography>}
      arrow
      TransitionComponent={Zoom}
      enterTouchDelay={0}
    >
      <Typography
        sx={{
          textAlign: 'left',
          maxWidth: '100%',
          whiteSpace: wrap ? 'break-words' : 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          ...sx,
        }}
      >
        {text}
      </Typography>
    </Tooltip>
  );
};
