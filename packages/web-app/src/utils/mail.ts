//メールテンプレートとかのやつ

import { ApiError } from '@/api/backendApi/error/apiError';

export class MailUtil {
  public static config = {
    //ここでテンプレートごとにいろいろ定義したい
  };

  //テンプレートの必須パラメータがあるか確認

  //テンプレートからメールを完成させる
  //この関数の途中で必須パラメータが指定されているか確認するため、このテンプレートの形式が正しいかどうかも判断できる
  public static templateToContent<Variants extends Record<string, string>>(
    template: string,
    variants: Variants,
    requiredVariants?: Array<keyof Variants>,
  ) {
    //必須パラメータがあるか確認
    if (requiredVariants) {
      requiredVariants.forEach((v) => {
        if (!template.includes(`{${String(v)}}`))
          throw new ApiError({
            status: 400,
            messageText: `メールテンプレートに必要なパラメータが含まれていません: {${String(
              v,
            )}}`,
          });
      });
    }

    let result = template;
    //テンプレートを書き換えていく
    Object.entries(variants).forEach(([prop, value]) => {
      result = template.replaceAll(`{${prop}}`, value);
    });

    return result;
  }
}
