//アカウントマスタの拡張クエリ（DAO的な）
import { PrismaService, PrismaUtil } from '@/db/prisma';
import { Prisma } from '@prisma/client';

export const createAccountDao = (prisma: PrismaService) => {
  const logicalDeleteWhere: Prisma.AccountWhereInput = {
    deleted: false,
  };

  return {
    /**
     * 論理削除されていないデータを取得する
     */
    async findUniqueExists<T extends Prisma.AccountFindUniqueArgs>(
      args: Prisma.SelectSubset<T, Prisma.AccountFindUniqueArgs>,
    ): Promise<Prisma.AccountGetPayload<T> | null> {
      PrismaUtil.safeWhere(args.where, logicalDeleteWhere);

      return await prisma.account.findUnique(args);
    },
    /**
     * 論理削除されていないデータを取得する
     */
    async findFirstExists<T extends Prisma.AccountFindFirstArgs>(
      args: Prisma.SelectSubset<T, Prisma.AccountFindFirstArgs>,
    ): Promise<Prisma.AccountGetPayload<T> | null> {
      PrismaUtil.safeWhere(args.where!, logicalDeleteWhere);

      return await prisma.account.findFirst(args);
    },

    /**
     * 論理削除されていないデータを取得する
     */
    async findManyExists<T extends Prisma.AccountFindManyArgs>(
      args: Prisma.SelectSubset<T, Prisma.AccountFindManyArgs>,
    ): Promise<Prisma.AccountGetPayload<T>[]> {
      PrismaUtil.safeWhere(args.where!, logicalDeleteWhere);

      return await prisma.account.findMany(args);
    },
  };
};
