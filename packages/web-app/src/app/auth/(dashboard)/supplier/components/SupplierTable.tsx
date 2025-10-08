// SupplierTable.tsx
'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Supplier } from '@prisma/client';

interface SupplierTableProps {
  filteredSuppliers: Supplier[];
  selectedSupplier: Supplier | null;
  setSelectedSupplier: React.Dispatch<React.SetStateAction<Supplier | null>>;
  selectedRow: number | null;
  setSelectedRow: React.Dispatch<React.SetStateAction<number | null>>;
  filterStatus: 'all' | 'enabled' | 'disabled';
}

export const SupplierTable: React.FC<SupplierTableProps> = ({
  filteredSuppliers,
  selectedSupplier,
  setSelectedSupplier,
  selectedRow,
  setSelectedRow,
  filterStatus,
}) => {
  const tableHeaderStyle = {
    backgroundColor: 'white',
    py: 1,
    color: 'grey.700',
    textAlign: 'left',
    width: '17.5%',
  };

  return (
    <TableContainer sx={{ height: '100%', backgroundColor: 'white' }}>
      <Table stickyHeader size="small" sx={{ overflow: 'scroll' }}>
        <TableHead>
          <TableRow>
            <TableCell
              align="center"
              sx={{ ...tableHeaderStyle, paddingLeft: 5, width: '30%' }}
            >
              仕入れ先名
            </TableCell>
            <TableCell align="center" sx={tableHeaderStyle}>
              電話番号
            </TableCell>
            <TableCell align="center" sx={tableHeaderStyle}>
              仕入れ先担当者名
            </TableCell>
            <TableCell align="center" sx={tableHeaderStyle}>
              発注方法
            </TableCell>
            <TableCell align="center" sx={tableHeaderStyle}>
              備考
            </TableCell>
            <TableCell align="center" sx={tableHeaderStyle}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody sx={{ backgroundColor: 'white' }}>
          {filteredSuppliers?.map((supplier) => {
            const isDisabled = !supplier.enabled && filterStatus === 'disabled';
            const isSelected = selectedRow === supplier.id;

            return (
              <TableRow
                key={supplier.id}
                onClick={() => {
                  setSelectedSupplier(supplier);
                  setSelectedRow(supplier.id);
                }}
                sx={{
                  backgroundColor: isSelected
                    ? 'rgba(255, 0, 0, 0.2)' // 選択中の行は薄い赤
                    : isDisabled
                    ? '#d3d3d3' // 無効な行は薄いグレー
                    : 'inherit',
                  cursor: 'pointer', // クリック可能なことを示す
                }}
                hover
              >
                <TableCell align="left" sx={{ paddingLeft: 5 }}>
                  {supplier.display_name}
                </TableCell>
                <TableCell align="left">{supplier.phone_number}</TableCell>
                <TableCell align="left">{supplier.staff_name}</TableCell>
                <TableCell align="left">{supplier.order_method}</TableCell>
                <TableCell align="left">{supplier.description}</TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <ChevronRightIcon sx={{ fontSize: 20, mt: 1 }} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
