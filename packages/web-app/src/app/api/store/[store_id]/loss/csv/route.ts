import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiCsvService } from '@/api/backendApi/services/csv/main';
import { BackendApiFileService } from '@/api/backendApi/services/file/main';
import { getLossCsvApi } from 'api-generator';
import { customDayjs } from 'common';

export const GET = BackendAPI.create(
  getLossCsvApi,
  async (API, { params, query }) => {
    const {
      staff_id,
      loss_genre_id,
      loss_category_id,
      target_day_gte,
      target_day_lte,
    } = query;

    const whereQuery: any = { store_id: Number(params.store_id) };
    if (staff_id) whereQuery.staff_account_id = Number(staff_id);

    // 商品条件を構築
    const productWhereQuery: any = {};
    const itemWhereQuery: any = {};

    if (loss_genre_id) {
      itemWhereQuery.genre_id = Number(loss_genre_id);
    }
    if (loss_category_id) {
      itemWhereQuery.category_id = Number(loss_category_id);
    }

    if (Object.keys(itemWhereQuery).length > 0) {
      productWhereQuery.item = itemWhereQuery;
    }

    const selectRes = await API.db.loss_Product.findMany({
      where: {
        loss: {
          ...whereQuery,
          datetime: {
            gte: target_day_gte
              ? customDayjs(target_day_gte).tz().toDate()
              : undefined,
            lte: target_day_lte
              ? customDayjs(target_day_lte).tz().toDate()
              : undefined,
          },
        },
        ...(Object.keys(productWhereQuery).length > 0 && {
          product: productWhereQuery,
        }),
      },
      select: {
        item_count: true,
        sell_price: true,
        loss: {
          select: {
            reason: true,
            datetime: true,
            staff_account: { select: { display_name: true } },
            loss_genre: { select: { display_name: true } },
          },
        },
        product: {
          select: {
            specialty: true,
            condition_option: { select: { display_name: true } },
            display_name: true,
            average_wholesale_price: true,

            item: {
              select: {
                expansion: true,
                cardnumber: true,
                rarity: true,
                genre: { select: { display_name: true } },
                category: { select: { display_name: true } },
              },
            },
          },
        },
      },
    });

    const csvData = selectRes.map((r) => {
      return {
        日付: customDayjs(r.loss.datetime).tz().format('YYYY/MM/DD'),
        商品名: r.product.display_name || '',
        エキスパンション: r.product.item?.expansion || '',
        カード番号: r.product.item?.cardnumber || '',
        レアリティ: r.product.item?.rarity || '',
        ジャンル: r.product.item?.genre?.display_name || '',
        カテゴリ: r.product.item?.category.display_name || '',
        状態: r.product.condition_option?.display_name || '',
        特殊状態: r.product.specialty?.display_name || '',
        個数: r.item_count,
        原価: r.product.average_wholesale_price || 0,
        販売価格: r.sell_price || 0,
        ロス区分: r.loss.loss_genre?.display_name || '',
        ロス理由: r.loss.reason || '',
        担当者: r.loss.staff_account?.display_name || '',
      };
    });

    const csvService = new BackendApiCsvService(API);
    const fileService = new BackendApiFileService(API);

    const timestamp = customDayjs().tz().format('YYYY-MM-DD_HH-mm-ss');
    const uploadRes = await fileService.uploadCsvToS3({
      dirKind: 'loss',
      fileName: `loss_product_${timestamp}`,
      writer: async (passThrough) => {
        csvService.core.passThrough = passThrough;

        //@ts-expect-error テンプレート管理外
        await csvService.core.maker(csvData);
      },
    });

    return { fileUrl: uploadRes };
  },
);
