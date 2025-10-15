import { useState } from 'react';
import { Tooltip, IconButton, ClickAwayListener, Box } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

interface InfoTooltipProps {
  message: string;
  iconSize?: number;
  stopPropagation?: boolean;
}

const InfoTooltip = ({
  message,
  iconSize = 14,
  stopPropagation = false,
}: InfoTooltipProps) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  return (
    <ClickAwayListener onClickAway={() => setTooltipOpen(false)}>
      <Tooltip
        title={<Box>{message}</Box>}
        arrow
        open={tooltipOpen}
        onClose={() => setTooltipOpen(false)}
        disableFocusListener
        disableHoverListener
        disableTouchListener
      >
        <IconButton
          onClick={(e) => {
            if (stopPropagation) e.stopPropagation();
            setTooltipOpen((prev) => !prev);
          }}
          sx={{ color: 'gray' }}
        >
          <InfoIcon sx={{ fontSize: iconSize }} />
        </IconButton>
      </Tooltip>
    </ClickAwayListener>
  );
};

export default InfoTooltip;
