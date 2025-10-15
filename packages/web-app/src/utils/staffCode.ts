// 従業員コードはcookieで取り扱うため、このutilで管理をする
export class StaffCode {
  public static readonly COOKIE_NAME = 'staffCode';
  // private static readonly COOKIE_EXPIRATION_TIME = 1 * 60 * 60 * 1000; // 1時間
  private static readonly COOKIE_EXPIRATION_TIME =
    process.env.NEXT_PUBLIC_ORIGIN === 'https://pos.mycalinks.io' ||
    process.env.NEXT_PUBLIC_ORIGIN === 'https://staging.pos.mycalinks.io' ||
    process.env.NEXT_PUBLIC_ORIGIN === 'http://localhost:3020'
      ? 1 * 60 * 3 * 1000 //myca店舗なら 3分
      : 1 * 60 * 60 * 1000; // 60分

  // private static readonly COOKIE_EXPIRATION_TIME = 30 * 1000; // 30秒

  private static readonly STAFF_CODE_LENGTH = [6, 7];

  private static setCookie(staffCode: number, expirationMs: number | null) {
    const date = new Date();
    if (expirationMs) {
      date.setTime(date.getTime() + expirationMs);
    }
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${this.COOKIE_NAME}=${staffCode}; path=/; ${expires};`;
  }

  public static isStaffCode(staffCode: number) {
    return this.STAFF_CODE_LENGTH.includes(staffCode.toString().length);
  }

  public static setStaffCode(
    staffCode: number,
    expirationMinutes: number | null,
  ) {
    this.setCookie(
      staffCode,
      expirationMinutes
        ? expirationMinutes * 60 * 1000
        : this.COOKIE_EXPIRATION_TIME,
    );
  }

  public static getStaffCode() {
    const cookie = document.cookie;
    const staffCode = cookie
      .split('; ')
      .find((row) => row.startsWith(this.COOKIE_NAME));
    return staffCode ? parseInt(staffCode.split('=')[1]) : null;
  }

  // Cookieの期限をリセットする
  public static resetCookieExpirationTime(expirationMinutes: number | null) {
    const staffCode = this.getStaffCode();
    // 従業員バーコードがない場合はスキップ
    if (staffCode === null) {
      return;
    }
    this.setCookie(
      staffCode,
      expirationMinutes
        ? expirationMinutes * 60 * 1000
        : this.COOKIE_EXPIRATION_TIME,
    );
  }

  // localStorageのvalueは変えずに有効期限を無限にする
  public static setStaffCodeInfiniteExpirationTime() {
    const staffCode = this.getStaffCode();
    // 従業員バーコードがない場合はスキップ
    if (staffCode === null) {
      return;
    }
    const date = new Date();
    date.setFullYear(date.getMonth() + 1);
    document.cookie = `${
      this.COOKIE_NAME
    }=${staffCode}; path=/; ${date.toUTCString()}`;
  }

  public static deleteStaffCode() {
    document.cookie = `${this.COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}
