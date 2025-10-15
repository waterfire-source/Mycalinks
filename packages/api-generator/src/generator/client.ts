import { ApiGenerator } from '@/generator/main';
import * as CodeGen from 'openapi-typescript-codegen';

export const generateApiClient = async () => {
  const json = await ApiGenerator.openapiGenerate();

  // 既存のcustomFetch用クライアント生成
  await CodeGen.generate({
    input: json,
    output: './src/generated/client',
    clientName: 'MycaPosApiClient',
    httpClient: 'fetch',
    useOptions: true,
  });

  // appCustomFetch用の別クライアント生成
  await generateAppApiClient();
};

// appCustomFetch用の別クライアント生成関数
const generateAppApiClient = async () => {
  // appCustomFetch用のAPI定義のみを含むOpenAPI仕様を生成
  const appJson = await ApiGenerator.generateAppOpenApi();

  await CodeGen.generate({
    input: appJson,
    output: './src/generated/app-client',
    clientName: 'MycaAppClient',
    httpClient: 'fetch',
    useOptions: true,
  });

  console.log('AppCustomFetch用クライアントが生成されました');
};

generateApiClient();
