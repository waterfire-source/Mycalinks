import { Box, SxProps } from '@mui/material';

interface Props {
  sx?: SxProps;
}
export const UnderTableCard = ({ sx }: Props) => {
  return <Box sx={{ height: '50px', backgroundColor: 'white', ...sx }} />;
};
