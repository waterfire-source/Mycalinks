import { createItemDao } from '@/db/dao/item';
import { createProductDao } from '@/db/dao/product';
import { createRegisterDao } from '@/db/dao/register';
import { createAccountDao } from '@/db/dao/account';
import { PrismaService } from '@/db/prisma';
import { Prisma } from '@prisma/client';
import { posCommonConstants } from 'common';

//トランザクション実行中でもトランザクション外で実行される点に注意

export const createCustomDao = (prisma: PrismaService) => {
  const customDao = prisma.$extends({
    name: 'customDao',
    model: {
      item: createItemDao(prisma),
      product: createProductDao(prisma),
      register: createRegisterDao(prisma),
      account: createAccountDao(prisma),
    },
    result: {
      product: {
        product_code: {
          needs: { id: true },
          compute(product) {
            return posCommonConstants.productCodePrefix + product.id;
          },
        },
      },
    },
  });

  return customDao;
};
