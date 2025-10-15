import {
  extendZodWithOpenApi,
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi';
import { writeFileSync } from 'fs';
import { z } from 'zod';
import { defs } from '@/defs';
import { apiGeneratorConstant } from '@/generator/constant';

extendZodWithOpenApi(z);

/**
 * API定義書（def.ts）をOpenAPIのドキュメント形式に変換してJSON形式で出力する
 */
export class ApiGenerator {
  public static openapiGenerate = async (createJson: boolean = false) => {
    const registry = new OpenAPIRegistry();

    defs.forEach((def) => registry.registerPath(def));

    // OpenAPIドキュメントを生成
    const generator = new OpenApiGeneratorV3(registry.definitions);

    const document = generator.generateDocument(
      apiGeneratorConstant.globalSetting,
    );

    // JSONファイルとして保存
    if (createJson) {
      writeFileSync(
        './src/generated/openapi.json',
        JSON.stringify(document, null, 2),
      );
    }

    console.log(`OpenAPI定義書が生成されました`);

    return document;
  };
  /**
   * appCustomFetch用のOpenAPI仕様書を生成
   */
  public static generateAppOpenApi = async (createJson: boolean = false) => {
    const registry = new OpenAPIRegistry();

    // 移行期間のため、一旦全てのAPI定義をappCustomFetch用にも含める
    defs.forEach((def) => registry.registerPath(def));

    // OpenAPIドキュメントを生成（アプリ用の設定）
    const generator = new OpenApiGeneratorV3(registry.definitions);

    const appSettings = {
      ...apiGeneratorConstant.globalSetting,
      info: {
        ...apiGeneratorConstant.globalSetting.info,
        title: 'MycaPOS App API',
        description: 'Mycaアプリ統合用API（appCustomFetch対象）',
      },
    };

    const document = generator.generateDocument(appSettings);

    // JSONファイルとして保存
    if (createJson) {
      writeFileSync(
        './src/generated/app-openapi.json',
        JSON.stringify(document, null, 2),
      );
    }

    console.log('AppCustomFetch用OpenAPI定義書が生成されました');

    return document;
  };
}

export type OpenAPIObject = ReturnType<
  typeof OpenApiGeneratorV3.prototype.generateDocument
>;
