import { BackendAPI } from '@/api/backendApi/main';
import {
  ConditionOptionHandle,
  Item_Category_Condition_Option,
  ItemCategoryHandle,
  Prisma,
  Product,
  SpecialtyHandle,
} from '@prisma/client';
import { ApiResponse, getEcItemApi } from 'api-generator';
import { BackendApiMycaAppService } from '@/api/backendApi/services/mycaApp/main';
import { mycaItem } from '@/app/api/store/[store_id]/myca-item/api';
import { PrismaUtil } from 'backend-core';
import { ecConstants } from 'common';

//@ts-expect-error for bigint
BigInt.prototype.toJSON = function () {
  return { $bigint: this.toString() };
};

//EC検索API
export const GET = BackendAPI.create(getEcItemApi, async (API, { query }) => {
  let whereQuery: Prisma.Sql = Prisma.sql``;
  let specialtyQuery: Prisma.Sql = Prisma.sql``;

  //クエリパラメータを見ていく
  for (const prop in query) {
    const key = prop as keyof typeof query;
    const value = query[key];

    switch (key) {
      case 'hasStock':
        if (value) {
          whereQuery = Prisma.sql`${whereQuery} AND Product.ec_stock_number > 0`;
        }
        break;

      case 'itemCategory': {
        const categories = (value as string).split(',');
        if (categories.length) {
          const thisQuery = PrismaUtil.stringInRawQuery(
            categories,
            ItemCategoryHandle,
          );
          whereQuery = Prisma.sql`${whereQuery} AND Item_Category.handle IN ${thisQuery}`;
        }
        break;
      }

      case 'conditionOption': {
        //状態
        const options = (value as string).split(',');
        if (options.length) {
          const thisQuery = PrismaUtil.stringInRawQuery(
            options,
            ConditionOptionHandle,
          );
          whereQuery = Prisma.sql`${whereQuery} AND Item_Category_Condition_Option.handle IN ${thisQuery}`;
        }
        break;
      }

      case 'specialty': {
        const specialties = (value as string).split(',');
        if (specialties.length) {
          specialtyQuery = Prisma.sql`LEFT JOIN Specialty ON Specialty.id = Product.specialty_id`;
          const thisQuery = PrismaUtil.stringInRawQuery(
            specialties,
            SpecialtyHandle,
          );
          whereQuery = Prisma.sql`${whereQuery} AND Specialty.handle IN ${thisQuery}`;
        }
        break;
      }

      case 'itemGenre': //ジャンル
        whereQuery = Prisma.sql`${whereQuery} AND Item_Genre.handle = ${value}`;
        break;

      case 'store_id': {
        if (!value) break;

        const storeIds = (value as string).split(',').map((id) => Number(id));
        whereQuery = Prisma.sql`${whereQuery} AND Item.store_id IN (${Prisma.join(
          storeIds,
        )})`;
        break;
      }

      case 'rarity': //レアリティなど
      case 'expansion':
      case 'cardnumber':
      case 'cardseries':
      case 'card_type':
      case 'option1':
      case 'option2':
      case 'option3':
      case 'option4':
      case 'option5':
      case 'option6':
      case 'release_date':
      case 'displaytype1':
      case 'displaytype2': {
        const columnName = Prisma.raw(`Item.${prop}`);
        if (!value) break;

        const values = (value as string).split(',');

        const likeConditions = values.map(
          (v) => Prisma.sql`${columnName} LIKE ${v}`,
        );
        whereQuery = Prisma.sql`${whereQuery} AND (${Prisma.join(
          likeConditions,
          ' OR ',
        )})`;

        break;
      }

      case 'name': {
        if (!value) break;

        //スペースで区切る
        const values = (value as string).split(' ');

        whereQuery = Prisma.sql`${whereQuery} AND ${Prisma.join(
          values.map((v) => Prisma.sql`Item.search_keyword LIKE ${`%${v}%`}`),
          ' OR ',
        )}`;
        break;
      }

      case 'id': {
        //ID
        const ids = (value as string).split(',').map((e) => Number(e));
        whereQuery = Prisma.sql`${whereQuery} AND Item.myca_item_id IN (${Prisma.join(
          ids,
        )})`;
        break;
      }

      //封入パック
      case 'myca_primary_pack_id': {
        if (!value) break;

        whereQuery = Prisma.sql`${whereQuery} AND Item.myca_primary_pack_id = ${value}`;
        break;
      }
    }
  }

  const selectRes = await API.readDb.$queryRaw<
    Array<{
      myca_item_id: mycaItem['id'];
      id: Product['id'];
      actual_ec_sell_price: Product['id'];
      condition_option_handle: Item_Category_Condition_Option['handle'];
      product_count: number;
      ec_stock_number: number;
    }>
  >`
    WITH Base AS (
      SELECT
        Item.myca_item_id,
        Product.id,
        Product.actual_ec_sell_price,
        Product.ec_stock_number,
        CASE WHEN Product.ec_stock_number > 0 THEN 1 ELSE 0 END AS has_stock,
        Item_Category_Condition_Option.handle AS condition_option_handle
      FROM
        Item
      INNER JOIN Product 
        ON Product.item_id = Item.id
      INNER JOIN Store
        ON Product.store_id = Store.id
      INNER JOIN Item_Category_Condition_Option 
        ON Product.condition_option_id = Item_Category_Condition_Option.id
      INNER JOIN Item_Category ON Item_Category.id = Item.category_id
      INNER JOIN Item_Genre ON Item_Genre.id = Item.genre_id
      ${specialtyQuery}
      WHERE
        Store.mycalinks_ec_enabled = 1 AND
        Item.myca_item_id IS NOT NULL AND
        Item.status = 'PUBLISH' AND
        (
          Item.release_at IS NULL OR
          Item.release_at <= CURRENT_TIMESTAMP
        ) AND
        Item_Category.ec_enabled = 1 AND
        Item_Genre.ec_enabled = 1 AND
        Product.mycalinks_ec_enabled = 1 AND
        Product.actual_ec_sell_price IS NOT NULL AND
        Product.actual_ec_sell_price > 0 AND
        Product.deleted = 0 AND
        Item_Category_Condition_Option.handle IN ${PrismaUtil.stringInRawQuery(
          [...Object.keys(ecConstants.ecConditionOptionHandleDict)],
          ConditionOptionHandle,
        )}
        ${whereQuery}
    ),
    RankedProducts AS (
      SELECT
        *,
        COUNT(*) OVER(PARTITION BY myca_item_id) AS product_count,
        ROW_NUMBER() OVER (
          PARTITION BY myca_item_id 
          ORDER BY
            has_stock DESC,
            condition_option_handle ASC,
            actual_ec_sell_price ASC
        ) AS row_num
      FROM Base
    )
    SELECT *
    FROM RankedProducts
    WHERE row_num = 1
    ${
      API.orderByQuery?.length
        ? Prisma.sql`${API.orderByQueryRaw}, myca_item_id DESC, id ASC`
        : Prisma.sql`ORDER BY myca_item_id DESC, id ASC`
    }
    ${API.limitQueryRaw}
    `;

  //全てのmycaItemを取得していく
  const mycaAppService = new BackendApiMycaAppService(API);
  const mycaItems = selectRes.length
    ? await mycaAppService.core.item.getAllDetail(
        {
          id: selectRes.map((e) => e.myca_item_id),
        },
        {
          detail: 1,
        },
      )
    : [];

  const items = selectRes
    .map((posProduct) => {
      const mycaItem = mycaItems.find((e) => e.id == posProduct.myca_item_id);

      if (!mycaItem) return null;

      return {
        ...mycaItem,
        productCount: posProduct.product_count,
        topPosProduct: {
          id: posProduct.id,
          condition_option_handle: posProduct.condition_option_handle,
          actual_ec_sell_price: posProduct.actual_ec_sell_price,
          ec_stock_number: posProduct.ec_stock_number,
        },
      };
    })
    .filter(Boolean) as ApiResponse<typeof getEcItemApi>['items'];

  return {
    items,
  };
});
