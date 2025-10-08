import { SaleAPI } from '@/api/frontend/sale/api';
import { CustomError, customFetch, METHOD } from '@/api/implement';
import { BackendSaleAPI } from '@/app/api/store/[store_id]/sale/api';

export const saleImplement = () => {
  return {
    // セール作成
    createSale: async (
      request: SaleAPI['createSale']['request'],
    ): Promise<SaleAPI['createSale']['response']> => {
      const body = {
        display_name: request.body.displayName,
        transaction_kind: request.body.transactionKind,
        start_datetime: request.body.startDatetime,
        discount_amount: request.body.discountAmount,
        end__datetime: request.body.endDatetime,
        end__total_item_count: request.body.endTotalItemCount,
        end__unit_item_count: request.body.endUnitItemCount,
        repeat_cron_rule: request.body.repeatCronRule,
        sale_end_datetime: request.body.saleEndDatetime,
        products: request.body.products.map((p) => ({
          product_id: p.productId,
          rule: p.rule,
        })),
        departments: request.body.departments.map((d) => ({
          item_category_id: d.itemCategoryId,
          item_genre_id: d.itemGenreId,
          rule: d.rule,
        })),
        on_pause: request.body.onPause,
      };
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/sale`,
        body,
      })();
    },

    // セール更新
    updateSale: async (
      request: SaleAPI['updateSale']['request'],
    ): Promise<SaleAPI['updateSale']['response']> => {
      const body = {
        id: request.body.id,
        display_name: request.body.displayName,
        transaction_kind: request.body.transactionKind,
        start_datetime: request.body.startDatetime,
        discount_amount: request.body.discountAmount,
        end__datetime: request.body.endDatetime,
        end__total_item_count: request.body.endTotalItemCount,
        end__unit_item_count: request.body.endUnitItemCount,
        repeat_cron_rule: request.body.repeatCronRule,
        sale_end_datetime: request.body.saleEndDatetime,
        products: request.body.products.map((p) => ({
          product_id: p.productId,
          rule: p.rule,
        })),
        departments: request.body.departments.map((d) => ({
          item_category_id: d.itemCategoryId,
          item_genre_id: d.itemGenreId,
          rule: d.rule,
        })),
        on_pause: request.body.onPause,
      };
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/sale`,
        body,
      })();
    },

    deleteSale: async (
      request: SaleAPI['deleteSale']['request'],
    ): Promise<SaleAPI['deleteSale']['response']> => {
      return await customFetch({
        method: METHOD.DELETE,
        url: `/api/store/${request.storeID}/sale/${request.saleID}`,
      })();
    },

    getSales: async (
      request: SaleAPI['getSales']['request'],
    ): Promise<SaleAPI['getSales']['response']> => {
      const params = request.query
        ? {
            id: request.query.id,
            status: request.query.status,
            on_pause: request.query.onPause,
          }
        : undefined;

      const response = await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeID}/sale`,
        params,
      })();

      if (response instanceof CustomError) {
        return response;
      } else {
        const sales =
          response.sales as BackendSaleAPI['2']['response']['200']['sales'];
        return {
          sales: sales.map((sale) => ({
            id: sale.id,
            storeId: sale.store_id,
            status: sale.status,
            onPause: sale.on_pause,
            displayName: sale.display_name,
            transactionKind: sale.transaction_kind,
            startDatetime: sale.start_datetime,
            discountAmount: sale.discount_amount,
            endDatetime: sale.end__datetime,
            endTotalItemCount: sale.end__total_item_count,
            endUnitItemCount: sale.end__unit_item_count,
            repeatCronRule: sale.repeat_cron_rule,
            saleEndDatetime: sale.sale_end_datetime,
            createdAt: sale.created_at,
            updatedAt: sale.updated_at,
            products: sale.products.map((product) => ({
              rule: product.rule,
              productId: product.product_id,
              productName: product.product_name,
              productDisplayNameWithMeta: product.product__displayNameWithMeta,
              productItemRarity: product.product__item__rarity,
              productItemCardNumber: product.product__item__card_number,
              productItemExpansion: product.product__item__expansion,
            })),
            departments: sale.departments.map((department) => ({
              rule: department.rule,
              itemGenreId: department.item_genre__id,
              itemGenreDisplayName: department.item_genre__display_name,
              itemCategoryId: department.item_category__id,
              itemCategoryDisplayName: department.item_category__display_name,
            })),
          })),
        };
      }
    },
  };
};
