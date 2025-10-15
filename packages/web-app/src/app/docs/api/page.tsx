'use client';

import { Box, Link, Typography, useTheme } from '@mui/material';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { RedocStandalone } from 'redoc';
import { useState } from 'react';

export default function ApiDocsPage() {
  const [mode, setMode] = useState<'swagger' | 'redoc'>('swagger');

  const theme = useTheme();

  return (
    <Box sx={{ mt: 3 }}>
      <Link
        sx={{ textAlign: 'center' }}
        href="#"
        onClick={() => setMode(mode === 'swagger' ? 'redoc' : 'swagger')}
      >
        <Typography>{mode === 'swagger' ? 'Redoc' : 'Swagger UI'}版</Typography>
      </Link>
      {mode === 'swagger' ? (
        <SwaggerUI url="/api/system/docs/openapi" />
      ) : (
        <RedocStandalone
          specUrl="/api/system/docs/openapi"
          options={{
            theme: {
              colors: {
                primary: { main: theme.palette.primary.main },
              },
            },
            expandResponses: '200',
            jsonSampleExpandLevel: Infinity,
            labels: {
              deprecated: '廃止予定',
            },
            showExtensions: true,
          }}
        />
      )}
    </Box>
  );
}
