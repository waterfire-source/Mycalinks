'use client';
import { ReactNode } from 'react';
import { TableCell, TableHead, TableRow } from '@mui/material';

type DetailInformationTableProps = {
  headerBackgroundColor: string;
  headerTextColor: string;
  attributeBackgroundColor: string;
  attributeTextColor: string;
  header: string;
  attributes: ReactNode[];
  displayValues: (ReactNode | Date | null)[];
};

// 属性とその内容を並べて詳細表示するテーブル
export const DetailInformationTable = ({
  headerBackgroundColor,
  headerTextColor,
  attributeBackgroundColor,
  attributeTextColor,
  header,
  attributes,
  displayValues,
}: DetailInformationTableProps) => {
  // ヘッダー部分
  const tableHeader = (header: string) => {
    return (
      <TableHead>
        <TableRow>
          <TableCell
            align="center"
            colSpan={2}
            sx={{
              backgroundColor: headerBackgroundColor,
              color: headerTextColor,
              fontWeight: 'bold',
            }}
          >
            {header}
          </TableCell>
        </TableRow>
      </TableHead>
    );
  };

  //列部分
  const tableRow = (name: ReactNode, displayValue: ReactNode | Date | null) => {
    return (
      <TableRow>
        <TableCell
          align="center"
          sx={{
            backgroundColor: attributeBackgroundColor,
            color: attributeTextColor,
            width: '30%',
          }}
        >
          {name}
        </TableCell>
        <TableCell sx={{ width: '70%' }}>
          {displayValue ? (displayValue as ReactNode) : '-'}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <>
      {tableHeader(header)}
      {attributes.map((attribute, index) =>
        tableRow(attribute, displayValues[index]),
      )}
    </>
  );
};
