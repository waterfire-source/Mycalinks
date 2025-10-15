import { Card, Stack, Typography } from '@mui/material';

interface ConditionSectionProps {
  title: string;
  children: React.ReactNode;
}

export const ConditionSection = ({
  title,
  children,
}: ConditionSectionProps) => {
  return (
    <Stack direction="column" spacing={2}>
      <Typography variant="h4">{title}</Typography>
      <Card sx={{ padding: 2 }}>{children}</Card>
    </Stack>
  );
};
