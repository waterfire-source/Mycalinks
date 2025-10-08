import { DepartmentTransactionKind } from '@/feature/customers/components/CustomerDetailPaper';
import { Box, Stack, Typography } from '@mui/material';

interface Props {
  stats: {
    groupByItemGenreTransactionKind?: Array<DepartmentTransactionKind>;
  };
}

export const CustomerTransactionInformation = ({ stats }: Props) => {
  return (
    <Box mt={2}>
      <Typography>取引情報</Typography>
      <Box ml={2}>
        {stats.groupByItemGenreTransactionKind ? (
          stats.groupByItemGenreTransactionKind.length > 0 ? (
            Object.entries(
              stats.groupByItemGenreTransactionKind
                .sort((a, b) => b.total_count - a.total_count)
                .reduce(
                  (
                    acc: Record<
                      string,
                      (typeof stats.groupByItemGenreTransactionKind)[0][]
                    >,
                    item,
                  ) => {
                    const key = item.genre_display_name;
                    if (key) {
                      if (!acc[key]) acc[key] = [];
                      acc[key].push(item);
                    }

                    return acc;
                  },
                  {},
                ),
            ).map(([genre, items]) => (
              <Stack
                key={genre}
                direction="row"
                justifyContent="space-between"
                spacing={2}
                sx={{
                  mt: 2,
                }}
              >
                {items.map((item, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    flex={1}
                    justifyContent="space-between"
                    sx={{ borderBottom: '1px solid', borderColor: 'grey.300' }}
                  >
                    <Typography>
                      {item.genre_display_name}
                      {item.transaction_kind === 'sell' ? '販売' : '買取'}
                    </Typography>
                    <Typography>{item.total_count}回</Typography>
                  </Stack>
                ))}
                {items.length === 1 && <Stack flex={1} />}
                {/* genre_display_name が1つの場合に空の Stack を追加 */}
              </Stack>
            ))
          ) : (
            <Typography>-</Typography>
          )
        ) : (
          <Typography>-</Typography>
        )}
      </Box>
    </Box>
  );
};
