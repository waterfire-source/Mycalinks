'use client';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from '@mui/material';
import SecondaryButton from '@/components/buttons/SecondaryButton';

interface ConnectionData {
  [key: string]: string | null;
}

interface ExternalPlatformCardProps {
  title: string;
  isLoading: boolean;
  isConnected: boolean;
  connectionData?: ConnectionData;
  onConnect: () => void;
  children?: React.ReactNode; // プラットフォーム固有の表示内容
}

export function ExternalPlatformCard({
  title,
  isLoading,
  isConnected,
  connectionData,
  onConnect,
  children,
}: ExternalPlatformCardProps) {
  return (
    <>
      <Typography variant="h3" sx={{ p: 1 }}>
        {title}
      </Typography>
      <Card sx={{ border: '1px solid #ccc', minHeight: '100px', mb: 3 }}>
        <CardContent
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: '100%',
          }}
        >
          {isLoading ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '150px',
                width: '100%',
              }}
            >
              <CircularProgress />
            </Box>
          ) : isConnected ? (
            <Box sx={{ p: 1, width: '100%' }}>
              {children}
              <SecondaryButton
                sx={{ width: '120px', mt: 2 }}
                onClick={onConnect}
              >
                再連携
              </SecondaryButton>
            </Box>
          ) : (
            <Box sx={{ p: 1 }}>
              <SecondaryButton sx={{ width: '120px' }} onClick={onConnect}>
                連携する
              </SecondaryButton>
            </Box>
          )}
        </CardContent>
      </Card>
    </>
  );
}
