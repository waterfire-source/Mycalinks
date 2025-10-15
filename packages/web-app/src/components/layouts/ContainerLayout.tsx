'use client';
import { HelpIcon } from '@/components/common/HelpIcon';
import { SubscribeEventLayout } from '@/providers/SubscribeEventLayout';
import { Typography, Stack, useTheme, Box } from '@mui/material';
interface Props {
  children: React.ReactNode;
  title: string | React.ReactElement;
  actions?: React.ReactNode; // タイトルの横に表示するコンポーネント
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  showTitle?: boolean; // タイトルを非表示にするかどうか
  isFullWidthTitle?: boolean; // タイトル
  description?: string; // タイトルの横に表示するテキスト
  descriptionAlign?: 'left' | 'right';
  helpArchivesNumber?: number;
}
export const ContainerLayout = ({
  children,
  title,
  actions,
  alignItems = 'center',
  showTitle = true,
  isFullWidthTitle = true,
  description,
  descriptionAlign = 'right',
  helpArchivesNumber,
}: Props) => {
  const theme = useTheme();
  return (
    <SubscribeEventLayout>
      <Stack
        sx={{
          backgroundColor: theme.palette.background.default,
          width: '100%',
          p: '24px',
          gap: '24px',
          height: 'calc(100vh - 64px)',
          justifyContent: 'space-between',
          overflow: 'auto',
          minHeight: '600px',
          flexGrow: 1,
          display: 'flex',
          direction: 'column',
        }}
      >
        <Stack
          sx={{
            width: '100%',
            gap: '6px',
            display: 'flex',
            height: '100%',
          }}
        >
          {showTitle && (
            <Stack
              direction="row"
              gap="12px"
              alignItems={alignItems}
              height={'40px'}
            >
              <Box
                sx={{
                  borderLeft: (theme) =>
                    `10px solid ${theme.palette.primary.main}`,
                  paddingLeft: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  flexGrow: isFullWidthTitle ? 1 : 0,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="start"
                  alignItems="center"
                >
                  {typeof title === 'string' ? (
                    <Typography
                      variant="h1"
                      sx={{
                        whiteSpace: 'nowrap',
                        width:
                          descriptionAlign === 'left' ? 'fit-content' : '100%',
                      }}
                    >
                      {title}
                    </Typography>
                  ) : (
                    title
                  )}
                </Stack>
                {description && (
                  <Typography
                    variant="body1"
                    sx={{
                      ml: 2,
                      whiteSpace: 'nowrap',
                      fontSize: '0.75rem',
                    }}
                  >
                    {description}
                  </Typography>
                )}
                {helpArchivesNumber && (
                  <HelpIcon helpArchivesNumber={helpArchivesNumber} />
                )}
              </Box>
              {actions}
            </Stack>
          )}

          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <Box
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              {children}
            </Box>
          </Box>
        </Stack>
      </Stack>
    </SubscribeEventLayout>
  );
};
