//いい加減住所情報のフォーマットを統一したいためUtilクラスを作る

export class AddressUtil {
  constructor(public info?: AddressUtil.Info) {}

  /**
   * 住所の文字列化
   */
  public toString() {
    return `${this.info?.zipCode || ''} ${this.info?.prefecture || ''} ${
      this.info?.city || ''
    } ${this.info?.address2 || ''} ${this.info?.building || ''}`;
  }
}

export namespace AddressUtil {
  export type Info = {
    zipCode: string;
    prefecture: string;
    city: string;
    address2: string;
    building: string;
    fullName: string;
    fullNameRuby: string;
    phoneNumber: string;
  };
}
