//在庫の拡張クエリ（DAO的な）

import { PrismaService, PrismaUtil } from '@/db/prisma';
import { ItemStatus, Prisma } from '@prisma/client';

export const createProductDao = (prisma: PrismaService) => {
  const logicalDeleteWhere = {
    item: {
      genre: {
        deleted: false,
        hidden: false,
      },
      category: {
        deleted: false,
        hidden: false,
      },
      status: ItemStatus.PUBLISH,
    },
    deleted: false, //物理削除されていないものだけ
  };

  return {
    /**
     * 論理削除されていないデータを取得する
     */
    async findUniqueExists<T extends Prisma.ProductFindUniqueArgs>(
      args: Prisma.SelectSubset<T, Prisma.ProductFindUniqueArgs>,
    ): Promise<Prisma.ProductGetPayload<T> | null> {
      PrismaUtil.safeWhere(args.where, logicalDeleteWhere);

      return await prisma.product.findUnique(args);
    },
    /**
     * 論理削除されていないデータを取得する
     */
    async findFirstExists<T extends Prisma.ProductFindFirstArgs>(
      args: Prisma.SelectSubset<T, Prisma.ProductFindFirstArgs>,
    ): Promise<Prisma.ProductGetPayload<T> | null> {
      PrismaUtil.safeWhere(args.where!, logicalDeleteWhere);

      return await prisma.product.findFirst(args);
    },
    /**
     * 論理削除されていないデータを取得する
     */
    async findManyExists<T extends Prisma.ProductFindManyArgs>(
      args: Prisma.SelectSubset<T, Prisma.ProductFindManyArgs>,
    ): Promise<Prisma.ProductGetPayload<T>[]> {
      PrismaUtil.safeWhere(args.where!, logicalDeleteWhere);

      return await prisma.product.findMany(args);
    },
    /**
     * 論理削除されていないデータを取得する
     */
    async countExists<T extends Prisma.ProductCountArgs>(
      args: Prisma.SelectSubset<T, Prisma.ProductCountArgs>,
    ): Promise<number> {
      PrismaUtil.safeWhere(args.where!, logicalDeleteWhere);

      return (await prisma.product.count(args)) as number;
    },
  };
};
