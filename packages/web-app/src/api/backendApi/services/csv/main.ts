import { BackendAPI } from '@/api/backendApi/main';
import { BackendCoreCsvService, CsvTemplateType } from 'backend-core';
import { BackendApiService } from '@/api/backendApi/services/main';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiFileService } from '@/api/backendApi/services/file/main';

/**
 * CSV関連
 */
export class BackendApiCsvService<
  TemplateName extends keyof CsvTemplateType,
  T extends CsvTemplateType[TemplateName],
> extends BackendApiService {
  declare core: BackendCoreCsvService<TemplateName, T>;

  public data: Array<T> = [];

  constructor(API: BackendAPI<any>, templateName?: TemplateName) {
    super(API);
    this.addCore(new BackendCoreCsvService<TemplateName, T>(templateName));
  }

  /**
   * パースするだけ
   */
  public readFile(fileKind: string) {
    const fileService = new BackendApiFileService(this.API);
    const thisFileData = fileService.getFileData(fileKind);

    if (!thisFileData) {
      throw new ApiError({
        status: 400,
        messageText: `ファイルが見つかりません`,
      });
    }

    return this.core.parseCsv(thisFileData.fsData);
  }

  /**
   * テンプレートの名前、バージョン、変数、データをパースする関数
   * @param fileKind - クライアントからアップロードされたファイルの、BackendAPI上でのハンドル名、通常 'file'
   * @returns - パースした情報
   */
  public parser(fileKind: string): {
    data: Array<T>;
  } {
    const parsed = this.readFile(fileKind);
    const dataStartKeyword = this.core.rule.keywords.dataStart;
    const indexKeyword = this.core.rule.keywords.handleStart;

    const belowIndex = parsed.findIndex(
      (e: Array<any>) => e.length && e[0] == dataStartKeyword,
    );

    const indexIndex = parsed.findIndex(
      (e: Array<any>) => e.length && e[0] == indexKeyword,
    );

    const rawData: Array<Array<string>> =
      belowIndex > -1 ? parsed.slice(belowIndex + 1) : parsed;

    let returnData: Array<T> = [];

    if (indexIndex > -1) {
      const columns = parsed[indexIndex + 1];

      returnData = rawData
        //何もないデータは取り除く
        .filter((row: Array<string>) => row.some((e) => e != ''))
        .map((row: Array<string>) => {
          const thisRowData: Record<string, string> = {};

          columns.forEach((col, i) => {
            thisRowData[col] = row[i];
          });

          return thisRowData as unknown as T;
        });
    }

    this.data = returnData;

    if (!this.data.length) {
      throw new ApiError({
        status: 400,
        messageText: `
CSVファイルの中身を1行も読み取れませんでした
エンコード方式が間違っている可能性があります
`,
      });
    }

    return {
      data: this.data,
    };
  }

  /**
   * 1行ずつCSVの処理を行う時に、エラーをわかりやすくするラッパー
   */
  public processRow = async ({
    data,
    ignoreError,
    callback,
  }: {
    data?: Array<T>;
    ignoreError?: boolean; //エラーを無視して、まとめる
    callback: (row: T) => Promise<void>;
  }) => {
    if (!data) {
      data = this.data;
    }

    const errorInfo: {
      rows: Array<T>;
      successCount: number;
      errorCount: number;
    } = {
      rows: [],
      successCount: 0,
      errorCount: 0,
    };

    for (const [index, row] of data.entries()) {
      try {
        await callback(row);
        errorInfo.successCount++;
      } catch (e) {
        console.log(`CSV処理中にエラーが発生しました`, row);

        if (ignoreError) {
          errorInfo.rows.push({
            ...row,
            upload_error: e instanceof Error ? e.message : JSON.stringify(e),
          });
          errorInfo.errorCount++;
          continue;
        }

        throw new ApiError({
          status: 400,
          messageText: `
CSV処理中にエラーが発生しました
行番号:${index + 1}
行内容:${JSON.stringify(row)}
エラー:${e instanceof Error ? e.message : JSON.stringify(e)}
`,
        });
      }
    }

    return {
      errorInfo,
    };
  };
}
