import { BackendAPI } from '@/api/backendApi/main';
import { getInventoryProductsApi } from 'api-generator';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { Prisma } from '@prisma/client';

//棚卸の商品情報を取得するAPI
export const GET = BackendAPI.create(
  getInventoryProductsApi,
  async (API, { params, query }) => {
    // WHERE条件を構築
    const whereConditions: string[] = [
      `ip.inventory_id = ${Number(params.inventory_id)}`,
      `i.store_id = ${Number(params.store_id)}`,
    ];

    if (query.shelfId) {
      whereConditions.push(`ip.shelf_id = ${Number(query.shelfId)}`);
    }

    if (query.isInjectedWholesalePrice !== undefined) {
      if (query.isInjectedWholesalePrice === null) {
        whereConditions.push(`ip.wholesale_price_injected IS NULL`);
      } else {
        const boolValue = query.isInjectedWholesalePrice ? 1 : 0;
        whereConditions.push(`ip.wholesale_price_injected = ${boolValue}`);
      }
    }

    if (query.genre_id) {
      whereConditions.push(`item.genre_id = ${Number(query.genre_id)}`);
    }

    if (query.category_id) {
      whereConditions.push(`item.category_id = ${Number(query.category_id)}`);
    }

    if (query.condition_option_name) {
      whereConditions.push(
        `co.display_name = '${query.condition_option_name}'`,
      );
    }

    // 差分フィルタリング条件
    if (query.diff_filter && query.diff_filter !== 'all') {
      switch (query.diff_filter) {
        case 'hasDiff':
          whereConditions.push(
            `(ip.item_count - COALESCE(ip.current_stock_number, 0)) != 0`,
          );
          break;
        case 'noDiff':
          whereConditions.push(
            `(ip.item_count - COALESCE(ip.current_stock_number, 0)) = 0`,
          );
          break;
        case 'plus':
          whereConditions.push(
            `(ip.item_count - COALESCE(ip.current_stock_number, 0)) > 0`,
          );
          break;
        case 'minus':
          whereConditions.push(
            `(ip.item_count - COALESCE(ip.current_stock_number, 0)) < 0`,
          );
          break;
      }
    }

    const whereClause = whereConditions.join(' AND ');

    // 並び替え設定
    let orderByClause = '';
    if (query.orderBy && query.orderDirection) {
      const direction = query.orderDirection.toUpperCase();
      switch (query.orderBy) {
        case 'stock_count':
          orderByClause = `ORDER BY p.stock_number ${direction}`;
          break;
        case 'item_count':
          orderByClause = `ORDER BY ip.item_count ${direction}`;
          break;
        case 'diff_count':
          orderByClause = `ORDER BY (ip.item_count - COALESCE(ip.current_stock_number, 0)) ${direction}`;
          break;
        case 'average_price':
          orderByClause = `ORDER BY p.average_wholesale_price ${direction}`;
          break;
      }
    } else {
      orderByClause = 'ORDER BY ip.shelf_id ASC, ip.product_id ASC';
    }

    // 総件数取得
    const countQuery = Prisma.sql`
      SELECT COUNT(*) as total
      FROM Inventory_Products ip
      INNER JOIN Inventory i ON ip.inventory_id = i.id
      INNER JOIN Product p ON ip.product_id = p.id
      INNER JOIN Item item ON p.item_id = item.id
      LEFT JOIN Item_Category ic ON item.category_id = ic.id
      LEFT JOIN Item_Genre ig ON item.genre_id = ig.id
      LEFT JOIN Item_Category_Condition_Option co ON p.condition_option_id = co.id
      LEFT JOIN Specialty s ON p.specialty_id = s.id
      WHERE ${Prisma.raw(whereClause)}
    `;

    const countResult = await API.db.$queryRaw<[{ total: bigint }]>(countQuery);
    const totalCount = Number(countResult[0].total);

    // メインクエリ
    const { skip, take } = API.limitQuery;
    const limitClause = take ? `LIMIT ${take}` : '';
    const offsetClause = skip ? `OFFSET ${skip}` : '';

    const mainQuery = Prisma.sql`
      SELECT 
        ip.inventory_id,
        ip.staff_account_id,
        ip.shelf_id,
        ip.shelf_name,
        ip.product_id,
        ip.item_count,
        ip.unit_price,
        ip.current_stock_number,
        ip.wholesale_price_injected,
        ip.wholesale_price_history_id,
        ip.average_wholesale_price,
        ip.input_total_wholesale_price,
        ip.minimum_wholesale_price,
        ip.maximum_wholesale_price,
        ip.total_wholesale_price,
        (ip.item_count - COALESCE(ip.current_stock_number, 0)) as diff_count,
        p.id as p_id,
        p.item_id as p_item_id,
        p.display_name as p_display_name,
        p.sell_price,
        p.specific_sell_price,
        p.condition_option_id as p_condition_option_id,
        p.specialty_id as p_specialty_id,
        p.image_url,
        p.management_number,
        p.created_at,
        p.updated_at,
        p.deleted,
        p.store_id as p_store_id,
        item.id as i_id,
        item.display_name as i_display_name,
        item.genre_id,
        item.category_id,
        item.expansion,
        item.cardnumber,
        item.rarity,
        ic.id as category_id, ic.display_name as category_display_name,
        ic.created_at as category_created_at, ic.updated_at as category_updated_at,
        ic.store_id as category_store_id, ic.handle as category_handle,
        ic.hidden as category_hidden, ic.deleted as category_deleted,
        ic.ec_enabled as category_ec_enabled, ic.order_number as category_order_number,
        ig.id as genre_id, ig.display_name as genre_display_name,
        ig.description as genre_description, ig.created_at as genre_created_at,
        ig.updated_at as genre_updated_at, ig.store_id as genre_store_id,
        ig.handle as genre_handle, ig.auto_update as genre_auto_update,
        ig.hidden as genre_hidden, ig.deleted as genre_deleted,
        ig.ec_enabled as genre_ec_enabled, ig.order_number as genre_order_number,
        co.id as condition_option_id, co.display_name as condition_display_name,
        co.created_at as condition_created_at, co.description as condition_description,
        co.item_category_id as condition_item_category_id, co.handle as condition_handle,
        co.deleted as condition_deleted, co.order_number as condition_order_number,
        s.id as specialty_id, s.display_name as specialty_display_name,
        s.created_at as specialty_created_at, s.updated_at as specialty_updated_at,
        s.store_id as specialty_store_id, s.handle as specialty_handle,
        s.deleted as specialty_deleted, s.order_number as specialty_order_number,
        s.kind as specialty_kind
      FROM Inventory_Products ip
      INNER JOIN Inventory i ON ip.inventory_id = i.id
      INNER JOIN Product p ON ip.product_id = p.id
      INNER JOIN Item item ON p.item_id = item.id
      LEFT JOIN Item_Category ic ON item.category_id = ic.id
      LEFT JOIN Item_Genre ig ON item.genre_id = ig.id
      LEFT JOIN Item_Category_Condition_Option co ON p.condition_option_id = co.id
      LEFT JOIN Specialty s ON p.specialty_id = s.id
      WHERE ${Prisma.raw(whereClause)}
      ${Prisma.raw(orderByClause)}
      ${Prisma.raw(limitClause)}
      ${Prisma.raw(offsetClause)}
    `;

    const rawResults = await API.db.$queryRaw<any[]>(mainQuery);

    // 結果をレスポンス形式に変換
    const products = rawResults.map((row) => {
      const productModel = new BackendApiProductService(API);

      // Productオブジェクトを再構築
      const product = {
        id: Number(row.p_id),
        item_id: Number(row.p_item_id),
        display_name: row.p_display_name || '',
        sell_price: Number(row.sell_price) || 0,
        specific_sell_price: row.specific_sell_price
          ? Number(row.specific_sell_price)
          : null,
        condition_option_id: row.p_condition_option_id
          ? Number(row.p_condition_option_id)
          : null,
        specialty_id: row.p_specialty_id ? Number(row.p_specialty_id) : null,
        image_url: row.image_url || null,
        management_number: row.management_number || null,
        created_at: row.created_at || new Date(),
        updated_at: row.updated_at || new Date(),
        deleted: Boolean(row.deleted),
        store_id: Number(row.p_store_id),
        item: {
          id: Number(row.i_id),
          display_name: row.i_display_name || '',
          expansion: row.expansion || null,
          cardnumber: row.cardnumber || null,
          rarity: row.rarity || null,
          genre: {
            id: Number(row.genre_id),
            display_name: row.genre_display_name || '',
            description: row.genre_description || null,
            created_at: row.genre_created_at || new Date(),
            updated_at: row.genre_updated_at || new Date(),
            store_id: Number(row.genre_store_id),
            handle: row.genre_handle || null,
            auto_update: Boolean(row.genre_auto_update),
            hidden: Boolean(row.genre_hidden),
            deleted: Boolean(row.genre_deleted),
            ec_enabled: Boolean(row.genre_ec_enabled),
            order_number: Number(row.genre_order_number),
          },
          category: {
            id: Number(row.category_id),
            display_name: row.category_display_name || '',
            created_at: row.category_created_at || new Date(),
            updated_at: row.category_updated_at || new Date(),
            store_id: Number(row.category_store_id),
            handle: row.category_handle || null,
            hidden: Boolean(row.category_hidden),
            deleted: Boolean(row.category_deleted),
            ec_enabled: Boolean(row.category_ec_enabled),
            order_number: Number(row.category_order_number),
          },
        },
        condition: {
          id: Number(row.p_condition_option_id),
          display_name: row.condition_display_name || '',
          created_at: row.condition_created_at || new Date(),
          description: row.condition_description || null,
          item_category_id: Number(row.condition_item_category_id),
          handle: row.condition_handle || null,
          deleted: Boolean(row.condition_deleted),
          order_number: Number(row.condition_order_number),
        },
        specialty: row.p_specialty_id
          ? {
              id: Number(row.p_specialty_id),
              display_name: row.specialty_display_name || '',
              created_at: row.specialty_created_at || new Date(),
              updated_at: row.specialty_updated_at || new Date(),
              store_id: Number(row.specialty_store_id),
              handle: row.specialty_handle || null,
              deleted: Boolean(row.specialty_deleted),
              order_number: row.specialty_order_number
                ? Number(row.specialty_order_number)
                : null,
              kind: row.specialty_kind || 'NORMAL',
            }
          : null,
      };

      const displayNameWithMeta =
        productModel.core.getProductNameWithMeta(product);

      return {
        inventory_id: Number(row.inventory_id),
        staff_account_id: Number(row.staff_account_id),
        shelf_id: Number(row.shelf_id),
        shelf_name: (row.shelf_name as string) || null,
        product_id: Number(row.product_id),
        item_count: Number(row.item_count),
        unit_price: row.unit_price ? Number(row.unit_price) : null,
        current_stock_number: row.current_stock_number
          ? Number(row.current_stock_number)
          : null,
        wholesale_price_injected:
          row.wholesale_price_injected === null
            ? null
            : Boolean(row.wholesale_price_injected),
        wholesale_price_history_id: row.wholesale_price_history_id
          ? Number(row.wholesale_price_history_id)
          : null,
        average_wholesale_price: row.average_wholesale_price
          ? Number(row.average_wholesale_price)
          : null,
        input_total_wholesale_price: row.input_total_wholesale_price
          ? Number(row.input_total_wholesale_price)
          : null,
        minimum_wholesale_price: row.minimum_wholesale_price
          ? Number(row.minimum_wholesale_price)
          : null,
        maximum_wholesale_price: row.maximum_wholesale_price
          ? Number(row.maximum_wholesale_price)
          : null,
        total_wholesale_price: row.total_wholesale_price
          ? Number(row.total_wholesale_price)
          : null,
        product: {
          ...product,
          displayNameWithMeta,
        },
      };
    });

    return {
      products,
      total_count: totalCount,
    };
  },
);
