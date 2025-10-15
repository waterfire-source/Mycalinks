//価格関係のユーティリティ

export class PriceUtil extends Number {
  constructor(price: any) {
    super(price);
  }

  //割引を適用させる
  applyDiscount(discountAmount: string | null) {
    if (!discountAmount) return Number(this.valueOf());

    //%だったら
    if (discountAmount.includes('%')) {
      const rate = parseInt(discountAmount) / 100;

      return Number(this.valueOf() * rate);
    } else {
      const discountPrice = parseInt(discountAmount);

      return Number(this.valueOf() + discountPrice);
    }
  }
}

export enum DiscountUnit {
  JPY = '円',
  PERCENT = '%',
}

// 割引の数値、割引方法を与えることでAPIに渡すためのデータに変換する
export const convertDiscount = (
  discountAmount: number,
  discountUnit: DiscountUnit,
) => {
  switch (discountUnit) {
    case DiscountUnit.JPY:
      return `-${discountAmount}`;
    case DiscountUnit.PERCENT:
      return `${100 - discountAmount}%`;
  }
};
