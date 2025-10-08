//バリデータまとめ

export class Validation {
  //メールアドレスのバリデーション
  public static email(v: string) {
    return /.+@.+\..+/.test(v);
  }

  //パスワードの長さ
  public static password(v: string) {
    return v.length > 8;
  }
}
