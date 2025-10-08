import {
  Store,
  Sale,
  SaleStatus,
  TransactionKind,
  SaleRule,
} from '@prisma/client';

import { CustomError } from '@/api/implement';
export interface SaleAPI {
  createSale: {
    request: {
      storeID: number;
      body: {
        displayName: string;
        transactionKind: TransactionKind;
        startDatetime: Date;
        discountAmount: string | null;
        endDatetime: Date | null;
        endTotalItemCount?: number | null;
        endUnitItemCount?: number | null;
        repeatCronRule?: string | null;
        saleEndDatetime?: Date | null;
        products: Array<{
          productId: number;
          rule: SaleRule;
        }>;
        departments: Array<{
          itemCategoryId: number | null;
          itemGenreId: number | null;
          rule: SaleRule;
        }>;
        onPause?: boolean;
      };
    };
    response: { id: number } | CustomError;
  };
  updateSale: {
    request: {
      storeID: number;
      body: {
        id: number;
        displayName: string;
        transactionKind: TransactionKind;
        startDatetime: Date;
        discountAmount: string | null;
        endDatetime: Date | null;
        endTotalItemCount?: number | null;
        endUnitItemCount?: number | null;
        repeatCronRule?: string | null;
        saleEndDatetime?: Date | null;
        products: Array<{
          productId: number;
          rule: SaleRule;
        }>;
        departments: Array<{
          itemCategoryId: number | null;
          itemGenreId: number | null;
          rule: SaleRule;
        }>;
        onPause?: boolean;
      };
    };
    response: { id: number } | CustomError;
  };

  deleteSale: {
    request: {
      storeID: Store['id'];
      saleID: Sale['id'];
    };
    response: { ok: string } | CustomError;
  };

  getSales: {
    request: {
      storeID: Store['id'];
      query?: {
        id?: Sale['id'];
        status?: SaleStatus;
        onPause?: Sale['on_pause'];
      };
    };
    response:
      | {
          sales: Array<{
            id: number;
            storeId: number;
            status: SaleStatus;
            onPause: boolean;
            displayName: string;
            transactionKind: TransactionKind;
            startDatetime: Date;
            discountAmount: string | null;
            endDatetime: Date | null;
            endTotalItemCount: number | null;
            endUnitItemCount: number | null;
            repeatCronRule: string | null;
            saleEndDatetime: Date | null;
            createdAt: Date;
            updatedAt: Date;
            products: Array<{
              rule: SaleRule;
              productId: number;
              productName: string;
              productDisplayNameWithMeta: string;
            }>;
            departments: Array<{
              rule: SaleRule;
              itemGenreId: number;
              itemGenreDisplayName: string;
              itemCategoryId: number;
              itemCategoryDisplayName: string;
            }>;
          }>;
        }
      | CustomError;
  };
}
