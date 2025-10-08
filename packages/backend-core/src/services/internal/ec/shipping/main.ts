//GMO関連

import {
  Ec_Setting,
  Item,
  Shipping_Method,
  Shipping_Region,
  Shipping_Weight,
} from '@prisma/client';
import { BackendService } from '@/services/internal/main';
import { BackendCoreError } from '@/error/main';
import { customDayjs, getJapaneseDay, shippingConstants } from 'common';

/**
 * ECの配送方法
 */
export class BackendCoreEcShippingService extends BackendService {
  private config = {
    nationalArea: '全国一律',
  };
  public targetObject?: Shipping_Method & {
    regions: Array<Shipping_Region>;
    weights: Array<
      Shipping_Weight & {
        regions: Array<Shipping_Region>;
      }
    >;
  };

  // public set existingObj(obj: NonNullable<typeof this.obj>) {
  //   this.obj = obj;
  // }

  public get existingObj() {
    return (async () => {
      //あったらそれを変えす
      if (this.targetObject) return this.targetObject;

      //取得する
      if (!this.ids.shippingMethodId)
        throw new BackendCoreError({
          internalMessage: 'shipping_method_idが指定されていません',
          externalMessage: 'shipping_method_idが指定されていません',
        });

      const obj = await this.db.shipping_Method.findUnique({
        where: {
          id: this.ids.shippingMethodId,
        },
        include: {
          weights: {
            include: {
              regions: true,
            },
          },
          regions: true,
        },
      });

      if (!obj)
        throw new BackendCoreError({
          internalMessage: '指定された配送方法が見つかりません',
          externalMessage: '指定された配送方法が見つかりません',
        });

      this.targetObject = obj;

      return obj;
    })();
  }

  constructor(specificShippingMethodId?: Shipping_Method['id']) {
    super();
    this.setIds({
      shippingMethodId: specificShippingMethodId,
    });
  }

  //配送無料かどうか 必要に応じて重量なども入力
  @BackendService.WithIds(['shippingMethodId'])
  public async judgeFreeShipping({
    totalPrice,
    freeShippingPrice,
  }: {
    totalPrice?: number;
    freeShippingPrice?: number;
  }) {
    const obj = await this.existingObj;

    if (freeShippingPrice && totalPrice) {
      if (totalPrice >= freeShippingPrice) {
        return true;
      }
    }

    //一旦重量別だったら無視する
    if (obj.weights.length) {
      return false;
    }

    //地域別だったら全国一律が無料かどうか見る
    if (obj.regions.length) {
      const nationalArea = obj.regions.find(
        (e) => e.region_handle == this.config.nationalArea,
      );
      if (nationalArea && nationalArea.fee == 0) return true;
    }

    return false;
  }

  //地域別料金を取得する
  private findRegionalFee(regions: Array<Shipping_Region>, prefecture: string) {
    //所属エリアが含まれている定義を見つける
    const thisPrefectureInfo = shippingConstants.prefectureAreaDef.find(
      (e) => e.name == prefecture,
    );

    if (!thisPrefectureInfo)
      throw new BackendCoreError({
        internalMessage: '指定された都道府県を扱うことはできません',
        externalMessage: '指定された都道府県を扱うことはできません',
      });

    const candidate = regions.find((e) =>
      thisPrefectureInfo.belongsTo.includes(e.region_handle),
    );

    if (!candidate) return false;

    return candidate.fee;
  }

  public judgeValidShippingMethod = (
    shippingMethod: ShippingMethodDef[number],
    weight: number,
    prefecture: string,
  ) => {
    //地域別かどうかを判断
    const isRegional = !shippingMethod.weights.length;

    //地域別だったら
    if (isRegional) {
      //所属エリアが含まれている定義を見つける
      const fee = this.findRegionalFee(shippingMethod.regions, prefecture);
      if (fee === false) return null;

      return {
        id: shippingMethod.id,
        display_name: shippingMethod.display_name,
        fee,
      };
    }
    //重量別だったら
    else {
      //定義が軽い順に取得
      const weights = shippingMethod.weights.sort(
        (a, b) => a.weight_gte - b.weight_gte,
      );

      for (const shippingWeight of weights) {
        //与えられた重量に対して適切かどうか判断する
        if (
          !(
            shippingWeight.weight_gte <= weight &&
            shippingWeight.weight_lte >= weight
          )
        ) {
          return null;
        }

        //地域を判断
        const fee = this.findRegionalFee(shippingWeight.regions, prefecture);
        if (fee === false) return null;

        return {
          id: shippingMethod.id,
          display_name: shippingMethod.display_name,
          fee,
        };
      }

      return null;
    }
  };

  //特定のストアで利用可能な配送方法の候補を算出
  @BackendService.WithIds(['storeId'])
  public async getAvailableShippingMethods({
    weight, //合計重量
    prefecture, //配送県
    allShippingMethods,
    totalPrice,
    ecSetting,
  }: {
    weight: Item['weight'];
    prefecture: string;
    allShippingMethods?: ShippingMethodDef;
    totalPrice?: number;
    ecSetting?: {
      same_day_limit_hour: Ec_Setting['same_day_limit_hour'];
      shipping_days: Ec_Setting['shipping_days'];
      closed_day: Ec_Setting['closed_day'];
      enable_same_day_shipping: Ec_Setting['enable_same_day_shipping'];
      free_shipping_price: Ec_Setting['free_shipping_price'];
    };
  }): Promise<ShippingCandidates> {
    if (!this.ids.storeId)
      throw new BackendCoreError({
        internalMessage: 'ストアが指定されていないので配送方法を算出できません',
        externalMessage: 'ストアが指定されていないので配送方法を算出できません',
      });

    const thisPrefectureInfo = shippingConstants.prefectureAreaDef.find(
      (e) => e.name == prefecture,
    );

    if (!thisPrefectureInfo)
      throw new BackendCoreError({
        internalMessage: '指定された都道府県を扱うことはできません',
        externalMessage: '指定された都道府県を扱うことはできません',
      });

    if (!allShippingMethods) {
      allShippingMethods = await this.db.shipping_Method.findMany({
        where: {
          store_id: this.ids.storeId,
          deleted: false,
        },
        include: {
          regions: true,
          weights: {
            include: {
              regions: true,
            },
          },
        },
      });
    }

    //それぞれの配送方法が妥当か見ていく
    const candidates = (
      await Promise.all(
        allShippingMethods!.map(async (shippingMethod) => {
          let shipping_days = 0;

          const thisShippingService = new BackendCoreEcShippingService(
            shippingMethod.id,
          );
          this.give(thisShippingService);

          const checkRes = thisShippingService.judgeValidShippingMethod(
            shippingMethod,
            weight,
            prefecture,
          );
          if (checkRes) {
            //無料配送方法に対応しているかどうか
            const isFreeShipping = await thisShippingService.judgeFreeShipping({
              totalPrice,
              freeShippingPrice: ecSetting?.free_shipping_price ?? undefined,
            });
            if (isFreeShipping) {
              checkRes.fee = 0;
            }

            //発送日数を取得
            const shippingDays = this.getShippingDays({
              same_day_limit_hour: ecSetting?.same_day_limit_hour ?? null,
              shipping_days: ecSetting?.shipping_days ?? null,
              closed_day: ecSetting?.closed_day ?? '',
              enable_same_day_shipping:
                ecSetting?.enable_same_day_shipping ?? false,
            });

            shipping_days = shippingDays;
          }

          return checkRes
            ? {
                shipping_days,
                order_number: shippingMethod.order_number,
                ...checkRes,
              }
            : null;
        }),
      )
    ).filter((e) => e != null);

    //それぞれの

    //表示順に並び替えつつ、同じ表示順だったら安い順に並び替える
    candidates.sort((a, b) => {
      if (a.order_number == b.order_number) {
        return a.fee - b.fee;
      }
      return a.order_number - b.order_number;
    });

    return candidates;
  }

  /**
   * 発送までの最短日時を計算
   * @returns 最短日時 即日だったら0 設定されてなかったら-1
   */
  public getShippingDays({
    same_day_limit_hour,
    shipping_days,
    closed_day,
    enable_same_day_shipping,
  }: {
    same_day_limit_hour: Ec_Setting['same_day_limit_hour'];
    shipping_days: Ec_Setting['shipping_days'];
    closed_day: Ec_Setting['closed_day'];
    enable_same_day_shipping: Ec_Setting['enable_same_day_shipping'];
  }) {
    if (!shipping_days) return -1;

    //現在の時刻
    const now = customDayjs().tz();
    const nowHour = now.hour();
    const closedDays = closed_day.split(','); //月, 火...

    //今日から順に見ていく
    let targetDay = 0; //今日
    let loopCount = 0; //無限ループ防止用
    while (true) {
      loopCount++;

      //無限ループ防止
      if (loopCount > 100) {
        return -1;
      }

      //日付を取得
      const targetDate = now.add(targetDay, 'day');

      //閉店日だったらスキップ
      if (closedDays.includes(getJapaneseDay(targetDate))) {
        targetDay++;
        continue;
      }

      //開店日だったら、即日発送に間に合うか確認
      if (same_day_limit_hour && enable_same_day_shipping) {
        if (nowHour < same_day_limit_hour) {
          break;
        }
      }

      //即日発送ができなかったら営業日のやつを見ていく
      if (shipping_days == 0) {
        break;
      }

      shipping_days--; //営業日を減らす
      targetDay++; //日付を進める
    }

    return targetDay;
  }
}

export type ShippingCandidates = Array<{
  id: Shipping_Method['id'];
  display_name: Shipping_Method['display_name'];
  fee: Shipping_Region['fee'];
  shipping_days: number; //発送日数
}>;

export type ShippingMethodDef = Array<
  Shipping_Method & {
    regions: Array<Shipping_Region>;
    weights: Array<
      Shipping_Weight & {
        regions: Array<Shipping_Region>;
      }
    >;
  }
>;
