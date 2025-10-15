import { ItemText } from '@/feature/item/components/ItemText';
import { Box, Typography } from '@mui/material';
interface Props {
  displayName: string;
  genreDisplayName: string;
  categoryDisplayName: string;
}

export const DisplayNameCell = ({
  displayName,
  genreDisplayName,
  categoryDisplayName,
}: Props) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      maxWidth="250px"
    >
      <Box marginBottom="4px" width="100%">
        <ItemText text={displayName} />
      </Box>
      <Box
        fontSize="0.875rem"
        color="grey.600"
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 1,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'grey.300',
            color: 'black',
            borderRadius: '2px',
            p: '2px',
          }}
        >
          {genreDisplayName}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {'>'}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'grey.300',
            color: 'black',
            borderRadius: '2px',
            p: '2px',
          }}
        >
          {categoryDisplayName}
        </Typography>
      </Box>
    </Box>
  );
};
