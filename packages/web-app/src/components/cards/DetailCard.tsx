import { Box, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface SectionContainerProps {
  title?: string | ReactNode; // タイトル
  titleDetail?: string; // タイトルの詳細
  titleTextColor?: string; // タイトルの文字色
  titleBackgroundColor?: string; // タイトルの背景色
  content?: JSX.Element; // メインコンテンツ
  bottomContent?: JSX.Element; // ボトムのコンテンツ
  titleSx?: object; // タイトル部分の sx
  contentSx?: object; // メインコンテンツ部分の sx
  bottomContentSx?: object; // ボトム部分の sx
  containerSx?: object; // DetailCard全体のコンテナのsx
  titleHidden?: boolean; // タイトルを非表示にする
  dataTestId?: string;
}

export const DetailCard: React.FC<SectionContainerProps> = ({
  title,
  titleDetail,
  titleTextColor = 'text.primary',
  titleBackgroundColor = 'common.white',
  content,
  bottomContent,
  titleSx,
  contentSx,
  bottomContentSx,
  containerSx,
  titleHidden = false,
  dataTestId,
}: SectionContainerProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #ccc',
        borderRadius: 1,
        backgroundColor: 'common.white',
        ...containerSx, // DetailCard全体のコンテナのsx
      }}
      height="100%"
      data-testid={dataTestId}
    >
      {!titleHidden && (
        <Stack
          direction="row"
          sx={{
            boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
            py: 2,
            px: 2,
            borderRadius: '4px 4px 0 0',
            backgroundColor: titleBackgroundColor,
            ...titleSx,
          }}
          justifyContent="space-between"
        >
          {typeof title === 'string' ? (
            <Typography variant="h1" color={titleTextColor}>
              {title}
            </Typography>
          ) : (
            title
          )}
          {titleDetail && (
            <Typography variant="h1" color={titleTextColor}>
              {titleDetail}
            </Typography>
          )}
        </Stack>
      )}

      {/* メインコンテンツ */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto', // スクロール可能にする
          p: 2,
          ...contentSx,
        }}
      >
        {content}
      </Box>

      {/* ボトム部分 */}
      {bottomContent && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            boxShadow: '0 -3px 6px rgba(0, 0, 0, 0.1)',
            p: 1,
            borderRadius: '0 0 4px 4px',
            ...bottomContentSx, // ボトム部分の sx
          }}
        >
          {bottomContent}
        </Box>
      )}
    </Box>
  );
};
