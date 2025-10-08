import { useState } from 'react';
import React from 'react';
import { TableRow, TableCell, Typography, Stack, Box } from '@mui/material';
import {
  ArrivalItemType,
  ArrivalProductSearchType,
} from '@/feature/arrival/register/searchModal/type';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ArrivalProductRow } from '@/feature/arrival/register/searchModal/contents/table/ProductRow';
import { ItemText } from '@/feature/item/components/ItemText';

interface Props {
  item: ArrivalItemType;
  handleAdd: (
    product: ArrivalProductSearchType,
    arrivalCount: number,
    arrivalPrice: number,
  ) => Promise<void>;
  enableManagementNumber: boolean;
  selectedSpecialtyId?: number;
}

export const ArrivalItemTableRow: React.FC<Props> = ({
  item,
  handleAdd,
  enableManagementNumber,
  selectedSpecialtyId,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const handleToggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  // 状態をキーにしたproductのmapを作成
  const productMap = new Map<number, ArrivalProductSearchType>();
  const specialtyProducts = item.products.filter(
    (p) => p.specialty_id === selectedSpecialtyId,
  );
  // 管理番号が付いていないかつ、特殊状態が結びついていないかつ特価じゃない商品(状態の順番を保つためにnormalProductsでforEachする必要あり)
  const normalProducts = item.products.filter(
    (p) => !p.specialty_id && !p.management_number,
  );
  normalProducts.forEach((product) => {
    if (selectedSpecialtyId) {
      const targetSpecialtyProduct = specialtyProducts.find(
        (p) => p.condition_option_id === product.condition_option_id,
      );
      if (targetSpecialtyProduct) {
        productMap.set(
          product.condition_option_id ?? 0,
          targetSpecialtyProduct,
        );
        return;
      }
    }
    // 状態が同じ特殊商品がない場合は普通の商品をset
    productMap.set(product.condition_option_id ?? 0, product);
  });

  const productsToDisplay = isExpanded
    ? Array.from(productMap.values())
    : Array.from(productMap.values()).slice(0, 1);

  return (
    <>
      {productsToDisplay.map((product, index) => {
        const isLastProduct = index === productsToDisplay.length - 1;
        return (
          <TableRow
            key={`${item.id}-${product.id}`}
            sx={{ verticalAlign: 'top' }}
          >
            {index === 0 && (
              <>
                <TableCell
                  rowSpan={productsToDisplay.length}
                  sx={{ verticalAlign: 'top' }}
                >
                  <Stack height="100%" justifyContent="center">
                    <Box height={80} width={60}>
                      <ItemImage imageUrl={item.image_url} height={80} />
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell
                  rowSpan={productsToDisplay.length}
                  sx={{ maxWidth: '250px' }}
                >
                  <Stack
                    direction="column"
                    height="100%"
                    justifyContent="center"
                  >
                    <ItemText
                      text={item.products[0]?.displayNameWithMeta}
                      sx={{ wordBreak: 'break-word' }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ wordBreak: 'break-word' }}
                    >
                      {item.cardnumber}
                    </Typography>
                  </Stack>
                </TableCell>
              </>
            )}
            <ArrivalProductRow
              item={item}
              product={product}
              index={index}
              handleAdd={handleAdd}
              isExpanded={isExpanded}
              handleToggleExpand={handleToggleExpand}
              isLastRow={isLastProduct}
              selectedSpecialtyId={selectedSpecialtyId}
            />
          </TableRow>
        );
      })}
    </>
  );
};
