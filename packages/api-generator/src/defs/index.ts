import {
  extendZodWithOpenApi,
  RouteConfig,
} from '@asteasolutions/zod-to-openapi';
import { BackendApiDef, roleDict } from '../types/main';
import { apiPolicies } from 'common';
import { z } from 'zod';
import { apiGeneratorConstant } from '../generator/constant';
import { defError } from '../generator/util';
extendZodWithOpenApi(z);

/**
 * ドメインごとにAPI定義をまとめる
 * @param def
 * @param domainName
 */
const defineDomain = (
  def: Record<string, unknown>,
  domainName: string,
): Array<RouteConfig> => {
  const configs: Array<RouteConfig> = [];

  Object.entries(def).map(([key, value]) => {
    if (!key.includes('Api')) return;

    const apiDef = value as BackendApiDef;
    const operationId = key.replace('Api', '');

    const thisRecord: RouteConfig = {
      method: apiDef.method,
      path: apiDef.path,
      summary: apiDef.summary,
      description: apiDef.description,
      tags: [domainName],
      operationId,
      request: {},
      responses: {
        200: {
          description: '成功レスポンス',
          content: {
            'application/json': {
              schema: apiDef.response,
            },
          },
        },
      },
    };

    if (apiDef.request.params) {
      thisRecord.request.params = apiDef.request.params;
    }

    if (apiDef.request.query) {
      thisRecord.request.query = apiDef.request.query;
    }

    if (apiDef.request.body) {
      thisRecord.request.body = {
        content: {
          'application/json': {
            schema: apiDef.request.body,
          },
        },
      };
    }

    if (apiDef.error) {
      if (Object.keys(apiDef.error).length) {
        const errorDefs: Map<number, Array<string>> = new Map();

        Object.entries(apiDef.error).forEach(([key, value]) => {
          if (errorDefs.has(value.status)) {
            errorDefs.get(value.status).push(value.messageText);
          } else {
            errorDefs.set(value.status, [value.messageText]);
          }
        });

        errorDefs.forEach((messages, status) => {
          thisRecord.responses[status] = {
            description: 'エラーレスポンス',
            content: {
              'application/json': {
                schema: defError(messages),
              },
            },
          };
        });
      }
    }

    thisRecord.description = `
${apiDef.description || ''}

### メソッド名
${operationId}
`;

    if (apiDef.privileges) {
      // thisRecord.security = [];

      if (apiDef.privileges.role) {
        thisRecord.description =
          thisRecord.description +
          `

### 必要ロール
${apiDef.privileges.role.map((role) => roleDict[role]).join(' or ')}
`;
      }

      if (apiDef.privileges.policies) {
        thisRecord.description =
          thisRecord.description +
          `
### 必要ポリシー
${apiDef.privileges.policies
  .map((policy) => {
    const thisPolicyInfo = apiPolicies[policy];
    return ` - ${policy}（${thisPolicyInfo.domain}：${thisPolicyInfo.label}）`;
  })
  .join('\n')}
`;
      }
    }

    configs.push(thisRecord);
  });

  return configs;
};

//ディレクトリリストを取得する
const tags = apiGeneratorConstant.globalSetting.tags.map((tag) => tag.name);
const defs: Array<RouteConfig> = [];

tags.forEach((tag) => {
  const thisDefs = require(`./${tag}/def`);
  defs.push(...defineDomain(thisDefs, tag));
});

export { defs };
export * from './account/def';
export * from './advertisement/def';
export * from './appraisal/def';
export * from './contract/def';
export * from './corporation/def';
export * from './customer/def';
export * from './ec/def';
export * from './inventory/def';
export * from './item/def';
export * from './launch/def';
export * from './memo/def';
export * from './myca-item/def';
export * from './product/def';
export * from './purchase-table/def';
export * from './register/def';
export * from './square/def';
export * from './stats/def';
export * from './stocking/def';
export * from './store/def';
export * from './system/def';
export * from './transaction/def';
export * from './ochanoko/def';
export * from './reservation/def';
export * from './template/def';
export * from './consignment/def';
export * from './task/def';
export * from './loss/def';
export * from './announcement/def';
export * from './shopify/def';
export * from './store-shipment/def';
export * from './location/def';
export * from './myca-user/def';
export * from './device/def';
