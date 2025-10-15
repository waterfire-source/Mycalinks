import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiCsvService } from '@/api/backendApi/services/csv/main';
import { BackendApiFileService } from '@/api/backendApi/services/file/main';
import { getStockingCsvApi } from 'api-generator';
import { customDayjs } from 'common';

export const GET = BackendAPI.create(
  getStockingCsvApi,
  async (Api, { params, query }) => {
    let whereQuery: any = {
      stocking: {
        store_id: Number(params.store_id),
        from_store_shipment: null, // 仕入先からの発注のみ（店舗間移動を除外）
      },
    };
    if (query.gte) {
      whereQuery.stocking.planned_date = {
        ...whereQuery.stocking.planned_date,
        gte: new Date(query.gte),
      };
    }
    if (query.lte) {
      whereQuery.stocking.planned_date = {
        ...whereQuery.stocking.planned_date,
        lte: new Date(query.lte),
      };
    }
    if (query.status) {
      whereQuery.stocking.status = query.status;
    }

    const allResults = await Api.db.stocking_Product.findMany({
      where: whereQuery,
      orderBy: [{ stocking_id: 'desc' }, { id: 'desc' }],
      take: 300000, //最大300000件
      select: {
        id: true,
        planned_item_count: true,
        stocking_id: true,
        unit_price: true,
        unit_price_without_tax: true,
        stocking: {
          select: {
            planned_date: true,
            created_at: true,
            supplier: { select: { display_name: true } },
          },
        },
        product: {
          select: {
            display_name: true,
            condition_option: { select: { display_name: true } },
            management_number: true,
            specialty: { select: { display_name: true } },
            item: {
              select: { expansion: true, cardnumber: true, rarity: true },
            },
          },
        },
      },
    });

    if (allResults.length === 0) {
      throw new ApiError('notExist');
    }

    const csvData = allResults.map((s) => {
      return {
        納品日: customDayjs(s.stocking.planned_date).tz().format('YYYY/MM/DD'),
        作成日: customDayjs(s.stocking.created_at).tz().format('YYYY/MM/DD'),
        発注番号: s.stocking_id,
        仕入れ商品: s.product.display_name,
        エキスパンション: s.product.item.expansion,
        カード番号: s.product.item.cardnumber,
        レアリティ: s.product.item.rarity,
        特殊状態: s.product.specialty?.display_name || '',
        状態: s.product.condition_option?.display_name || '',
        管理番号: s.product.management_number,
        仕入個数: s.planned_item_count,
        仕入価格: s.unit_price || s.unit_price_without_tax,
        仕入先: s.stocking.supplier?.display_name || '',
      };
    });

    const csvService = new BackendApiCsvService(Api);
    const fileService = new BackendApiFileService(Api);

    const fileName = `発注管理${customDayjs()
      .tz()
      .format('YYYYMMDD_HHmmss')}.csv`;

    const uploadRes = await fileService.uploadCsvToS3({
      dirKind: 'stocking',
      fileName,
      writer: async (passThrough) => {
        return new Promise<void>((resolve, reject) => {
          try {
            const headers = Object.keys(csvData[0]);

            csvService.core.passThrough = passThrough;

            // BOM書き込み
            if (!csvService.core.writingStarted) {
              csvService.core.passThrough.write(csvService.core.rule.bom.utf8);
              csvService.core.writingStarted = true;
            }

            // ヘッダー書き込み
            passThrough.write(headers.join(',') + '\n');

            const WRITE_CHUNK_SIZE = 1000;
            let currentIndex = 0;

            const writeNextChunk = () => {
              if (currentIndex >= csvData.length) {
                resolve();
                return;
              }

              const chunkEnd = Math.min(
                currentIndex + WRITE_CHUNK_SIZE,
                csvData.length,
              );
              let chunkString = '';

              for (let j = currentIndex; j < chunkEnd; j++) {
                const row = headers
                  .map((header) => {
                    const value = (csvData[j] as any)[header];
                    return typeof value === 'string' && value.includes(',')
                      ? `"${value}"`
                      : value || '';
                  })
                  .join(',');
                chunkString += row + '\n';
              }

              const canContinue = passThrough.write(chunkString);
              currentIndex = chunkEnd;

              if (canContinue) {
                setImmediate(writeNextChunk);
              } else {
                passThrough.once('drain', writeNextChunk);
              }
            };

            writeNextChunk();
          } catch (error) {
            reject(error);
          }
        });
      },
    });

    return { fileUrl: uploadRes };
  },
);
