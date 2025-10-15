//商品マスタの拡張クエリ（DAO的な）

import { PrismaService, PrismaUtil } from '@/db/prisma';
import { ItemStatus, Prisma } from '@prisma/client';

export const createItemDao = (prisma: PrismaService) => {
  const logicalDeleteWhere = {
    status: {
      not: ItemStatus.DELETED,
    },
    category: {
      deleted: false,
      hidden: false,
    },
    genre: {
      deleted: false,
      hidden: false,
    },
  };

  return {
    /**
     * 論理削除されていないデータを取得する
     */
    async findUniqueExists<T extends Prisma.ItemFindUniqueArgs>(
      args: Prisma.SelectSubset<T, Prisma.ItemFindUniqueArgs>,
    ): Promise<Prisma.ItemGetPayload<T> | null> {
      PrismaUtil.safeWhere(args.where!, logicalDeleteWhere);

      return await prisma.item.findUnique(args);
    },
    /**
     * 論理削除されていないデータを取得する
     */
    async findManyExists<T extends Prisma.ItemFindManyArgs>(
      args: Prisma.SelectSubset<T, Prisma.ItemFindManyArgs>,
    ): Promise<Prisma.ItemGetPayload<T>[]> {
      PrismaUtil.safeWhere(args.where!, logicalDeleteWhere);

      return await prisma.item.findMany(args);
    },
    /**
     * 論理削除されていないデータを取得する
     */
    async countExists<T extends Prisma.ItemCountArgs>(
      args: Prisma.SelectSubset<T, Prisma.ItemCountArgs>,
    ): Promise<number> {
      PrismaUtil.safeWhere(args.where!, logicalDeleteWhere);

      return (await prisma.item.count(args)) as number;
    },
  };
};
