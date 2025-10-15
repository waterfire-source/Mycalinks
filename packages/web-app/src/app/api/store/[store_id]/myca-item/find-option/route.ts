// MycaのfindOptionを取得する

import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiMycaAppService } from '@/api/backendApi/services/mycaApp/main';
import {
  ApiResponse,
  getMycaItemFindOptionApi,
  getMycaItemFindOptionByStoreIdApi,
} from 'api-generator';
import { MycaItem } from 'backend-core';

export const GET = BackendAPI.create(
  getMycaItemFindOptionByStoreIdApi,
  async (API, { params, query }) => {
    //選択肢を取得する
    const mycaAppService = new BackendApiMycaAppService(API);
    const constants = await mycaAppService.core.getConstants();

    //ジャンルとカテゴリの情報を取得
    const [genreInfo, categoryInfo] = await Promise.all([
      API.db.item_Genre.findUnique({
        where: {
          id: query.genreId!,
          store_id: params.store_id,
        },
      }),
      API.db.item_Category.findUnique({
        where: {
          id: query.categoryId!,
          store_id: params.store_id,
        },
      }),
    ]);

    if (!genreInfo || !categoryInfo) {
      return {
        searchElements: [],
      };
    }

    //このジャンルの情報を取得する
    const thisGenreInfo = constants.GenreList.find(
      (each) => each.label === genreInfo.handle,
    );

    if (!thisGenreInfo) {
      return {
        searchElements: [],
      };
    }

    //サーチエレメントを取得
    const categoryHandle =
      categoryInfo.handle == 'CARD' ? 'カード' : 'ボックス';

    const thisGenreSearchElements = thisGenreInfo.searchType.find(
      (each) => each.type === categoryHandle,
    )?.searchElements;

    if (!thisGenreSearchElements) {
      return {
        searchElements: [],
      };
    }

    const targetSearchElements = thisGenreSearchElements.filter(
      (e) => e.inputType == 'picker',
    );

    const searchElements = (await Promise.all(
      targetSearchElements.map(async (e) => {
        if (e.columnOnItems == 'pack') {
          //パックだった場合取得方法は特別
          const optionsList = (await mycaAppService.core.item.getAllDetail(
            {
              genre: thisGenreInfo.genre,
              displaytype1: `${thisGenreInfo.init}カード`,
            },
            {
              options: 1,
              pack: 1,
            },
          )) as unknown as Array<{
            label: string;
            value: number;
          }>;

          const columnOnPosItem =
            mycaAppService.core.item.toPosColumn('cardpackid');

          return {
            metaLabel: e.label,
            columnOnPosItem,
            options: optionsList
              .filter((e) => e.value)
              .map((e) => ({
                label: e.label,
                value: e.value,
              })),
          };
        } else {
          const options = await mycaAppService.core.item.getFindOptions({
            genreId: thisGenreInfo.genre,
            kindLabel: e.label,
            itemType: categoryInfo.handle == 'CARD' ? 'card' : 'box',
          });

          if (!options || !options.options) return null;

          let columnOnMycaItem: string = '';
          if (options.options.length) {
            const sample = options.options[0];
            columnOnMycaItem = sample.kind;
          }

          const columnOnPosItem = mycaAppService.core.item.toPosColumn(
            (columnOnMycaItem || e.columnOnItems) as keyof MycaItem,
          );

          return {
            metaLabel: e.label,
            columnOnPosItem,
            options: (options?.options ?? []).map((o) => ({
              label: o.name,
              value: e.matchPolicy == 'partial' ? `%${o.value}%` : o.value,
            })),
          };
        }
      }),
    )) as ApiResponse<typeof getMycaItemFindOptionApi>['searchElements'];

    return {
      searchElements: searchElements.filter(Boolean),
    };
  },
);
