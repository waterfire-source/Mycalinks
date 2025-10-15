import { Tooltip, IconButton, SxProps, Theme, Link } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface HelpIconProps {
  helpArchivesNumber: number;
  sx?: SxProps<Theme>;
}

const HELP_BASE_URL = 'https://pos.mycalinks.info/archives/';

/**
 * ヘルプリンク付きのアイコンを表示する再利用可能なコンポーネント
 * @param helpArchivesNumber - 必須。クリック時に開くURLの末尾Number
 * @param sx - 任意。IconButtonのスタイルをカスタマイズ
 */
export const HelpIcon = ({ helpArchivesNumber, sx }: HelpIconProps) => {
  const handleHelpClick = () => {
    window.open(
      `${HELP_BASE_URL}${helpArchivesNumber}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const tooltipContent = (
    <Link
      href={`${HELP_BASE_URL}${helpArchivesNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      sx={{ color: 'inherit', textDecoration: 'underline' }}
    >
      {HELP_BASE_URL}
      {helpArchivesNumber}
    </Link>
  );

  return (
    <Tooltip title={tooltipContent} arrow>
      <IconButton
        onClick={handleHelpClick}
        size="small"
        sx={{
          padding: '4px',
          color: 'text.secondary',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
          ...sx,
        }}
      >
        <HelpOutlineIcon sx={{ fontSize: 20, color: 'primary.main' }} />
      </IconButton>
    </Tooltip>
  );
};
