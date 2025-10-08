import { AuthorityIsEnable } from '@/feature/settings/authority/components/Authority/AuthorityItem';
import { ColumnDef } from '@/components/tables/CustomTable';
import {
  AuthorityItem,
  authorityItems,
} from '@/feature/settings/authority/utils/useForm';
import {
  Paper,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
} from '@mui/material';

export const AuthorityList = () => {
  const columns: ColumnDef<AuthorityItem>[] = [
    {
      header: '画面',
      render: (row) => row.screen,
    },
    {
      header: '操作内容',
      render: (row) => row.action,
    },
    {
      header: '可否',
      render: (row) => <AuthorityIsEnable property={row.id} />,
    },
  ];

  return (
    <TableContainer
      component={Paper}
      sx={{
        maxHeight: '500px',
        overflow: 'auto',
        '& .MuiTableHead-root': {
          position: 'sticky',
          top: 0,
          zIndex: 1,
        },
      }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((column, index) => (
              <TableCell
                key={index}
                sx={{
                  backgroundColor: 'grey.700',
                  color: 'common.white',
                  textAlign: 'center',
                  py: 1,
                  borderTop: '5px solid',
                  borderTopColor: 'primary.main',
                  borderBottom: '1px solid',
                  borderBottomColor: 'divider',
                }}
              >
                {column.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {authorityItems.map((row) => (
            <TableRow key={row.id}>
              <TableCell sx={{ textAlign: 'center' }}>{row.screen}</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>{row.action}</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                <AuthorityIsEnable property={row.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
