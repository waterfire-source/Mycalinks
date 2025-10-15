import { Box, IconButton, Stack, TextField, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Dispatch, SetStateAction, useEffect } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { CustomArrivalProductSearchType } from '@/app/auth/(dashboard)/arrival/register/page';
import { jaJP } from '@mui/x-data-grid/locales';
import { ItemText } from '@/feature/item/components/ItemText';
import Loader from '@/components/common/Loader';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { useGetSpecialty } from '@/feature/specialty/hooks/useGetSpecialty';
import { ArrivalManagementField } from '@/feature/arrival/register/arrivalRegisterItem/ArrivalManagementField';
interface Props {
  products: CustomArrivalProductSearchType[];
  setProducts: Dispatch<SetStateAction<CustomArrivalProductSearchType[]>>;
  isLoading: boolean;
}

export const CartTableComponent = ({
  products,
  setProducts,
  isLoading,
}: Props) => {
  const { fetchSpecialty } = useGetSpecialty();
  useEffect(() => {
    fetchSpecialty();
  }, [fetchSpecialty]);
  const handleEdit = <K extends keyof CustomArrivalProductSearchType>(
    customId: string,
    key: K,
    value: CustomArrivalProductSearchType[K],
  ) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.customId === customId ? { ...product, [key]: value } : product,
      ),
    );
  };

  const handleDelete = (customId: string) => {
    setProducts((prev) =>
      prev.filter((product) => product.customId !== customId),
    );
  };

  const columns: GridColDef[] = [
    {
      field: 'image_url',
      headerName: '画像',
      flex: 1,
      minWidth: 70,
      headerAlign: 'center',
      renderCell: (params) => (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="100%"
          height="100%"
        >
          <ItemImage height={65} imageUrl={params.value} fill />
        </Box>
      ),
    },
    {
      field: 'display_name',
      headerName: '商品名',
      flex: 3,
      minWidth: 140,
      renderCell: (params) => (
        <ItemText
          text={params.row.displayNameWithMeta}
          sx={{
            whiteSpace: 'break-spaces',
          }}
        />
      ),
    },
    {
      field: 'condition_option_display_name',
      headerName: '状態',
      flex: 1,
      minWidth: 100,
      maxWidth: 130,
    },
    // {
    //   field: 'specialty_id',
    //   headerName: '特殊状態',
    //   flex: 0.2,
    //   minWidth: 140,
    //   maxWidth: 170,
    //   renderCell: (params) => (
    //     <Stack
    //       sx={{
    //         width: '100%',
    //         height: '100%',
    //         alignItems: 'center',
    //         justifyContent: 'center',
    //       }}
    //     >
    //       <SpecialtySelect
    //         specialties={specialties}
    //         selectedSpecialtyId={params.row.specialty_id}
    //         onSelect={(e) => {
    //           handleEdit(
    //             params.row.customId,
    //             'specialty_id',
    //             Number(e.target.value),
    //           );
    //         }}
    //         sx={{ width: '100%' }}
    //       />
    //     </Stack>
    //   ),
    // },
    {
      field: 'arrivalPrice',
      headerName: '仕入れ値',
      flex: 2,
      minWidth: 70,
      maxWidth: 160,
      renderCell: (params) => (
        <TextField
          size="small"
          type="number"
          value={params.value || ''}
          onChange={(e) =>
            handleEdit(
              params.row.customId,
              'arrivalPrice',
              Number(e.target.value),
            )
          }
          InputProps={{
            endAdornment: <Typography>円</Typography>,
          }}
          sx={{ width: '100%' }}
        />
      ),
    },
    {
      field: 'arrivalCount',
      headerName: '発注数 / 管理番号',
      flex: 3,
      minWidth: 150,
      maxWidth: 200,
      renderCell: (params) => {
        if (params.row.management_number === null) {
          return (
            <TextField
              size="small"
              type="number"
              label="発注数"
              value={params.row.arrivalCount || ''}
              InputLabelProps={{
                shrink: true,
                sx: {
                  color: 'grey.700', // フォーカスしてないときの色
                },
              }}
              onChange={(e) =>
                handleEdit(
                  params.row.customId,
                  'arrivalCount',
                  Number(e.target.value),
                )
              }
              InputProps={{
                endAdornment: <Typography>点</Typography>,
              }}
              sx={{ width: '100%' }}
            />
          );
        } else {
          return (
            <ArrivalManagementField
              onChange={handleEdit}
              id={params.row.customId}
              initValue={params.row.management_number}
            />
          );
        }
      },
    },
    {
      field: 'actions',
      headerName: '',
      flex: 1,
      minWidth: 50,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <IconButton onClick={() => handleDelete(params.row.customId)}>
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Stack flex={1}>
      {isLoading ? (
        <Loader />
      ) : (
        <DataGrid
          rows={products}
          columns={columns}
          getRowId={(row) => row.customId}
          localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
          pageSizeOptions={[30, 50, 100]}
          rowHeight={80}
          disableColumnMenu
          disableRowSelectionOnClick
          sx={{
            height: '100%',
            width: '100%',
            backgroundColor: 'white',
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: 'white',
              position: 'relative',
              '&:before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '5px',
                backgroundColor: 'primary.main',
              },
            },
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'white',
            },
            '& .MuiDataGrid-row': {
              backgroundColor: 'white',
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: 'white',
            },
            '& .MuiDataGrid-virtualScroller': {
              backgroundColor: 'white',
            },
          }}
        />
      )}
    </Stack>
  );
};
